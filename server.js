// Load environment variables
require('dotenv').config();

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');

// Database connection
const connectDatabase = require('./config/database');
let pdfjs = null;
try{
  // pdfjs-dist can optionally depend on canvas; load if available
  pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
}catch(e){
  console.warn('pdfjs-dist not available or failed to load (optional). Password-protected PDF support will be limited.\n', e && e.message);
  pdfjs = null;
}
const Tesseract = require('tesseract.js');
const sharp = require('sharp');

// polyfill fetch in Node.js if missing (node <18)
if(typeof global.fetch !== 'function'){
  try{
    // node-fetch v2 exports a function
    global.fetch = require('node-fetch');
  }catch(e){
    console.warn('node-fetch not available, currency conversion and some network features may fail');
  }
}

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 60 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDatabase();

// developer/demo auth (JWT) - in a real app store keys securely
const jwt = require('jsonwebtoken');
const DEV_API_SECRET = process.env.DEV_API_SECRET || 'dev-secret-change-me';

function requireApiAuth(req, res, next){
  // allow browser-based form posts and local dev without token for now
  const auth = req.headers['authorization'] || '';
  if(!auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing Bearer token' });
  const token = auth.replace('Bearer ', '').trim();
  try{ const payload = jwt.verify(token, DEV_API_SECRET); req.apiUser = payload; next(); }catch(e){ return res.status(401).json({ message: 'Invalid token' }); }
}

// Simple token issuance endpoint (demo) - POST { client_id } -> { token }
app.post('/api/developer/token', (req, res) => {
  const { client_id } = req.body || {};
  if(!client_id) return res.status(400).json({ message: 'Missing client_id' });
  const token = jwt.sign({ client_id, iss: 'bankstatement-ai-demo' }, DEV_API_SECRET, { expiresIn: '7d' });
  res.json({ token, expires_in: 7*24*3600 });
});

// Load feedback mappings for adaptive corrections
const FEEDBACK_PATH = path.join(__dirname, 'data', 'feedback.json');
let feedbackMap = {};
try{ feedbackMap = JSON.parse(fs.readFileSync(FEEDBACK_PATH, 'utf8') || '{}'); }catch(e){ feedbackMap = {}; }

function saveFeedback(){
  try{ fs.writeFileSync(FEEDBACK_PATH, JSON.stringify(feedbackMap, null, 2)); }catch(e){ console.warn('could not save feedback', e.message); }
}

// Import authentication routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const { protect } = require('./middleware/auth');

// Serve static frontend
app.use(express.static(path.join(__dirname)));

// Health
app.get('/api/status', (req, res) => res.json({ status: 'ok', version: '0.1.0-demo', database: 'connected' }));

// Authentication routes
app.use('/api/auth', authRoutes);

// Profile routes
app.use('/api/profile', profileRoutes);

// Simple processing endpoint
app.post('/api/process', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const file = req.file;
    const filename = file.originalname || 'upload';
    const ext = path.extname(filename).toLowerCase();

    // If PDF - try to extract text with pdf-parse
    let text = '';
    if (ext === '.pdf'){
      try{
        const data = await pdf(file.buffer);
        text = data.text || '';
      }catch(err){
        console.warn('pdf-parse error', err && err.message);
        if(/password/i.test(err && err.message || '')){
          // if client supplied a password attempt to use pdfjs to open it
          const provided = req.body && req.body.pdf_password;
          if(provided){
            try{
              // helper: extract with pdfjs using password
              async function extractTextFromPdfWithPassword(buffer, password){
                const loadingTask = pdfjs.getDocument({ data: buffer, password });
                const doc = await loadingTask.promise;
                let full = '';
                for(let i=1;i<=doc.numPages;i++){
                  const page = await doc.getPage(i);
                  const content = await page.getTextContent();
                  const strs = content.items.map(it => it.str).join(' ');
                  full += '\n' + strs;
                }
                return full;
              }
              text = await extractTextFromPdfWithPassword(file.buffer, provided);
            }catch(passErr){
              console.warn('pdfjs password open failed', passErr && passErr.message);
              return res.status(422).json({ message: 'Unable to open PDF with provided password', require_password: true });
            }
          } else {
            return res.status(422).json({ message: 'PDF is password-protected', require_password: true });
          }
        }
      }
    }

    // If image or no text from PDF, run Tesseract on buffer
    if(!text || text.trim().length < 20){
      // Preprocess image buffer to improve OCR accuracy
      async function preprocessImageBuffer(buf){
        try{
          // Convert to grayscale, increase contrast, resize to reasonable width while preserving aspect
          const image = sharp(buf).grayscale().normalise().sharpen();
          const meta = await image.metadata();
          const width = Math.min(2600, Math.max(1200, meta.width || 1600));
          const processed = await image.resize({ width }).toBuffer();
          return processed;
        }catch(err){
          console.warn('sharp preprocess failed', err.message);
          return buf;
        }
      }

      const tmpPath = path.join(__dirname, 'tmp', `${Date.now()}-${filename}`);
      fs.mkdirSync(path.dirname(tmpPath), { recursive: true });
      const preBuf = await preprocessImageBuffer(file.buffer);
      fs.writeFileSync(tmpPath, preBuf);
      try{
        const ocrLang = (req.body && req.body.ocr_lang) ? req.body.ocr_lang : 'eng';
        const { data: { text: ocrText } } = await Tesseract.recognize(tmpPath, ocrLang);
        text += '\n' + (ocrText || '');
      }catch(err){
        console.warn('tesseract error', err.message);
      }finally{
        try{ fs.unlinkSync(tmpPath); }catch(e){}
      }
    }

    // Complex layout parsing: handle multi-page, repeated headers, merged cells, and continuations
    function parseComplexLayout(rawText){
      // Split into pages (pdf-parse may use form-feed \f between pages)
      const pages = rawText.split(/\f+/).map(p => p.split(/\r?\n/).map(l => l.trim()).filter(Boolean));

      // Detect repeated headers (lines appearing in first N lines across multiple pages)
      const headerCounts = {};
      const firstN = 6;
      pages.forEach(p => {
        for(let i=0;i<Math.min(firstN, p.length); i++){
          const line = p[i];
          headerCounts[line] = (headerCounts[line] || 0) + 1;
        }
      });
      const repeatedHeaders = new Set(Object.keys(headerCounts).filter(k => headerCounts[k] > 1));

      // Flatten pages into line objects with page index and line index
      const flat = [];
      pages.forEach((p, pi) => {
        p.forEach((ln, li) => {
          if(repeatedHeaders.has(ln)) return; // drop repeated header lines
          flat.push({ text: ln, page: pi+1, lineIndex: li });
        });
      });

      const amtRe = /(-?\$?\d{1,3}(?:[\,\.]\d{3})*(?:[\.,]\d{2})?)/g;
      const dateRe = /(\d{2}[\-\/\.]\d{2}[\-\/\.]\d{2,4}|\d{4}[\-]\d{2}[\-]\d{2})/g;

      const records = [];
      let current = null;

      function flushCurrent(){ if(current){ records.push(current); current = null; } }

      for(const item of flat){
        const l = item.text;
        const dateMatch = l.match(dateRe);
        const amtMatch = l.match(amtRe);

        if(dateMatch){
          // start a new record when a date is present
          flushCurrent();
          current = { lines: [l], page: item.page, lineIndex: item.lineIndex };
        } else if(amtMatch && !current){
          // amount present but no date; start a record
          current = { lines: [l], page: item.page, lineIndex: item.lineIndex };
        } else if(current){
          // continuation line (merged cells or multi-line description)
          current.lines.push(l);
        } else {
          // orphan line: store as its own tiny record
          records.push({ lines: [l], page: item.page, lineIndex: item.lineIndex });
        }
      }
      flushCurrent();

      // Convert records into structured transactions (best-effort)
      const txs = records.map(r => {
        const textBlock = r.lines.join(' ');
        // find last amount in block
        let amt = null; let amtRaw = null;
        const am = Array.from(textBlock.matchAll(amtRe));
        if(am.length) { const last = am[am.length-1][0]; amtRaw = last; amt = parseFloat(last.replace(/[^0-9\-\.]/g,'')); }
        // find first date in block
        const d = textBlock.match(dateRe);
        const date = d ? d[0] : null;

        // attempt to separate merchant/description by removing date and amount tokens
        let merch = textBlock;
        if(date) merch = merch.replace(date, '');
        if(amtRaw) merch = merch.replace(amtRaw, '');
        merch = merch.replace(/\s{2,}/g,' ').trim();

        // naive merchant extraction: take leading segment up to a dash or comma
        let merchant = merch.split(/\s{2,}|\-|,|:/)[0] || merch;
        merchant = merchant.trim();

        // category suggestion via feedback map
        let suggested = null;
        const key = merch.toLowerCase();
        for(const k of Object.keys(feedbackMap)){
          if(key.includes(k.toLowerCase())){ suggested = feedbackMap[k]; break; }
        }

        // detect currency symbol
        let currency = null;
        if(amtRaw){ if(amtRaw.includes('$')) currency='USD'; else if(amtRaw.includes('€')) currency='EUR'; else if(amtRaw.includes('₹')) currency='INR'; }

        return {
          page: r.page,
          lineIndex: r.lineIndex,
          raw: textBlock,
          merchant: merchant || null,
          description: merch || null,
          date: date || null,
          amount: amtRaw || null,
          amount_value: isNaN(amt) ? null : amt,
          currency,
          suggested_category: suggested
        };
      });

      return txs;
    }

  // ensure text is defined and split into lines for downstream heuristics
  text = text || '';
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const tx = parseComplexLayout(text);

    // Smart Bank Detection (pattern-based signatures + confidence)
    function smartBankDetect(text, lines){
      const signatures = [
        { name: 'Chase', patterns: ['chase', 'chase bank', 'chaseonline', 'chase card'] },
        { name: 'HSBC', patterns: ['hsbc', 'hong kong and shanghai', 'hsbc bank'] },
        { name: 'State Bank of India', patterns: ['state bank of india', 'sbi', 'sbicollect'] },
        { name: 'Wells Fargo', patterns: ['wells fargo', 'wellsfargo'] },
        { name: 'Bank of America', patterns: ['bank of america', 'boa', 'bofa'] },
        { name: 'Citibank', patterns: ['citibank', 'citi'] }
      ];

      const lower = (text || '').toLowerCase();
      const scores = signatures.map(sig => {
        let score = 0;
        const matched = [];
        sig.patterns.forEach(p => {
          if(lower.includes(p)){
            score += 1.0; matched.push(p);
          }
        });

        // additional heuristics: page layout clues — look for known headers in first 40 lines
        for(let i=0;i<Math.min(40, lines.length); i++){
          const l = lines[i].toLowerCase();
          if(l.includes('account summary') && sig.name === 'Chase') { score += 0.5; matched.push('account summary'); }
          if(l.includes('statement of account') && sig.name === 'State Bank of India') { score += 0.4; matched.push('statement of account'); }
        }

        return { name: sig.name, score, matched };
      });

      // pick best
      scores.sort((a,b)=>b.score-a.score);
      const best = scores[0];
      const totalPossible = Math.max(1, signatures.reduce((s,sg)=>s + sg.patterns.length, 0));
      const confidence = Math.min(1, best.score / 3);
      return { name: best.name, confidence: parseFloat(confidence.toFixed(2)), matched: best.matched };
    }

    const detection = smartBankDetect(text, lines);

    // Enrich transactions: parse debit/credit, detect tax, duplicates, categorize, currency conversion, and insights
    async function enrichTransactions(transactions){
      // 1) Normalize merchant names helper
      const normalize = s => (s || '').toLowerCase().replace(/["'\.,]/g,'').trim();

      // 2) Categorization rules: combine feedbackMap + simple merchant keywords
      const merchantKeywords = {
        'uber': 'Transport', 'ola': 'Transport', 'lyft': 'Transport', 'uber eats': 'Food', 'starbucks': 'Food',
        'netflix': 'Subscriptions', 'spotify': 'Subscriptions', 'amazon': 'Shopping', 'walmart': 'Groceries', 'grocer': 'Groceries'
      };

      // 3) detect tax fields
      const taxKeywords = ['gst','vat','tax','cgst','sgst','igst'];
      const amtAbs = v => (v===null||v===undefined) ? null : Math.abs(v);

      // 4) duplicates detection map
      const sigMap = {};
      const duplicates = [];

      // parse dates safely
      function tryParseDate(s){
        if(!s) return null;
        // try ISO first
        const d = new Date(s);
        if(!isNaN(d)) return d;
        // try DD-MM-YYYY or DD/MM/YYYY
        const m = s.match(/(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{2,4})/);
        if(m){
          let day=m[1].padStart(2,'0'), mon=m[2].padStart(2,'0'), yr=m[3];
          if(yr.length===2) yr = '20'+yr;
          return new Date(`${yr}-${mon}-${day}`);
        }
        return null;
      }

      // currency conversion helper using exchangerate.host (historical)
      async function convertAmount(amount, from, to, date){
        if(!amount || !from || !to || from === to) return { converted: amount, rate:1 };
        try{
          const qdate = date ? (date.toISOString().slice(0,10)) : undefined;
          const url = `https://api.exchangerate.host/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount)}${qdate?`&date=${qdate}`:''}`;
          const resp = await fetch(url);
          if(!resp.ok) throw new Error('rate fetch failed');
          const body = await resp.json();
          return { converted: body.result, rate: body.info && body.info.rate ? body.info.rate : null };
        }catch(e){
          console.warn('currency convert failed', e.message);
          return { converted: amount, rate: null };
        }
      }

      // collect numeric amounts to compute median for anomaly detection
      const numericAmounts = [];
      for(const t of transactions){ if(t.amount_value !== null && !isNaN(t.amount_value)) numericAmounts.push(Math.abs(t.amount_value)); }
      numericAmounts.sort((a,b)=>a-b);
      const median = numericAmounts.length ? numericAmounts[Math.floor(numericAmounts.length/2)] : 0;

      // base currency (allow override)
      const baseCurrency = (req.body && req.body.base_currency) ? req.body.base_currency : 'USD';

      for(const t of transactions){
        // type: debit vs credit
        t.type = (t.amount_value===null) ? 'unknown' : (t.amount_value < 0 ? 'debit' : 'credit');

        // detect tax keywords and attempt to extract tax amount
        const low = (t.raw || '').toLowerCase();
        t.tax = null;
        for(const k of taxKeywords){ if(low.includes(k)){ t.tax = true; break; } }
        if(t.tax){
          // try to find an amount labelled as tax
          const m = t.raw.match(/(tax|gst|vat)[^0-9\-\.,]*([\d\.,]+)/i);
          if(m && m[2]){
            const n = parseFloat(m[2].replace(/,/g,''));
            if(!isNaN(n)) t.tax_amount = n;
          }
        }

        // merchant normalization
        t.merchant_norm = normalize(t.merchant || t.description || t.raw);

        // suggested category from feedbackMap
        t.suggested_category = t.suggested_category || null;
        if(!t.suggested_category){
          for(const k of Object.keys(feedbackMap)){
            if(t.merchant_norm.includes(k.toLowerCase())){ t.suggested_category = feedbackMap[k]; break; }
          }
        }
        // merchant keyword map
        if(!t.suggested_category){
          for(const k of Object.keys(merchantKeywords)){
            if(t.merchant_norm.includes(k)) { t.suggested_category = merchantKeywords[k]; break; }
          }
        }

        // duplicates: signature on date+abs(amount)+merchant
        const sigDate = tryParseDate(t.date);
        const sigAmount = (t.amount_value===null) ? null : Math.round(Math.abs(t.amount_value)*100); // cents
        const sigMerchant = (t.merchant_norm || '').split(/\s+/).slice(0,4).join(' ');
        const sig = `${sigDate?sigDate.toISOString().slice(0,10):'?' }|${sigAmount||'?'}|${sigMerchant}`;
        sigMap[sig] = (sigMap[sig] || 0) + 1;
        if(sigMap[sig] > 1) t.duplicate = true; else t.duplicate = false;

        // currency conversion to base
        t.converted = null; t.exchange_rate = null;
        if(t.currency && baseCurrency){
          try{
            const parsedDate = tryParseDate(t.date);
            const conv = await convertAmount(t.amount_value || 0, t.currency, baseCurrency, parsedDate);
            t.converted = conv.converted; t.exchange_rate = conv.rate; t.base_currency = baseCurrency;
          }catch(e){ /* ignore */ }
        }
      }

      // insights: large transactions, recurring, subscriptions
      const insights = { flags: [], recurring: [], subscriptions: [] };
      // large/unusual transactions
      for(const t of transactions){
        const amt = Math.abs(t.amount_value || 0);
        if(median>0 && amt > Math.max(100, median * 3)){
          insights.flags.push({ type: 'large_transaction', message: `Large transaction ${t.raw}`, transaction: t });
        }
      }

      // find recurring merchants (>=3 occurrences, similar amount)
      const merchantGroups = {};
      for(const t of transactions){
        const mk = t.merchant_norm || 'unknown';
        merchantGroups[mk] = merchantGroups[mk] || []; merchantGroups[mk].push(t);
      }
      for(const [mk, arr] of Object.entries(merchantGroups)){
        if(arr.length >= 3){
          // check if amounts similar
          const amounts = arr.map(x=>Math.round((x.amount_value||0)*100));
          const avg = amounts.reduce((a,b)=>a+b,0)/amounts.length;
          const varSum = amounts.reduce((a,b)=>a + Math.abs(b-avg),0)/amounts.length;
          if(varSum < Math.abs(avg) * 0.15){
            insights.recurring.push({ merchant: mk, occurrences: arr.length, avg_amount: avg/100, sample: arr[0] });
            if(arr.length >= 3) insights.subscriptions.push({ merchant: mk, amount: avg/100, occurrences: arr.length });
          }
        }
      }

      // duplicates list
      for(const t of transactions){ if(t.duplicate) duplicates.push(t); }

      return { transactions, insights, duplicates };
    }

    const enriched = await enrichTransactions(tx);

    const result = {
      message: 'Processed (demo mode)',
      data: {
        filename,
        text_snippet: lines.slice(0,20).join('\n'),
        transactions: enriched.transactions,
        duplicates: enriched.duplicates,
        insights: enriched.insights,
        detected_bank: detection,
        stats: { pages_estimate: Math.max(1, Math.round(file.size / 200000)), total_lines: lines.length }
      }
    };

    res.json(result);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Processing failed', error: String(err) });
  }
});

// Export endpoint (creates CSV/JSON in-memory)
app.post('/api/export', express.json(), async (req, res) => {
  // Secured export API for developers
  // Accepts body: { format: 'csv'|'json'|'xlsx'|'pdf', data: { transactions: [...] }, filename }
  try{
    const { format = 'json', data, filename = 'export' } = req.body || {};
    if(!data) return res.status(400).json({ message: 'Missing data' });

    if(format === 'csv'){
      const rows = ['date,description,amount'];
      (data.transactions || []).forEach(t => rows.push(`${t.date || ''},"${(t.line||'').replace(/"/g,'""')}",${t.amount||''}`));
      const csv = rows.join('\n');
      res.setHeader('Content-Type','text/csv');
      res.setHeader('Content-Disposition',`attachment; filename=${filename.replace(/[^a-z0-9\-_\.]/gi,'_')}.csv`);
      return res.send(csv);
    }

    if(format === 'json'){
      res.setHeader('Content-Type','application/json');
      res.setHeader('Content-Disposition',`attachment; filename=${filename.replace(/[^a-z0-9\-_\.]/gi,'_')}.json`);
      return res.send(JSON.stringify(data, null, 2));
    }

    if(format === 'xlsx'){
      // generate a simple XLSX with sheet 'Transactions'
      const ExcelJS = require('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Transactions');
      ws.columns = [ { header: 'Date', key: 'date', width: 15 }, { header: 'Description', key: 'line', width: 60 }, { header: 'Amount', key: 'amount', width: 15 } ];
      (data.transactions || []).forEach(t => ws.addRow({ date: t.date || '', line: t.line || t.raw || '', amount: t.amount || t.amount_value || '' }));
      res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition',`attachment; filename=${filename.replace(/[^a-z0-9\-_\.]/gi,'_')}.xlsx`);
      await wb.xlsx.write(res);
      res.end();
      return;
    }

    if(format === 'pdf'){
      // create a printable PDF report (simple table)
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      res.setHeader('Content-Type','application/pdf');
      res.setHeader('Content-Disposition',`attachment; filename=${filename.replace(/[^a-z0-9\-_\.]/gi,'_')}.pdf`);
      doc.pipe(res);
      doc.fontSize(16).text('BankStatement AI - Export', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10);
      // table header
      const rows = data.transactions || [];
      const tableTop = doc.y + 10;
      const col1 = 50, col2 = 150, col3 = 460;
      doc.font('Helvetica-Bold').text('Date', col1, tableTop);
      doc.text('Description', col2, tableTop);
      doc.text('Amount', col3, tableTop, { width: 80, align: 'right' });
      doc.moveTo(col1, tableTop + 14).lineTo(550, tableTop + 14).stroke();
      doc.font('Helvetica');
      let y = tableTop + 20;
      rows.forEach(r => {
        if(y > 720){ doc.addPage(); y = 50; }
        doc.text(r.date || '', col1, y);
        doc.text((r.line || r.raw || '').substring(0,80), col2, y, { width: 300 });
        doc.text(String(r.amount || r.amount_value || ''), col3, y, { width: 80, align: 'right' });
        y += 18;
      });
      doc.end();
      return;
    }

    return res.status(400).json({ message: 'Unknown export format: ' + String(format) });
  }catch(err){ console.error('Export failed', err); return res.status(500).json({ message: 'Export failed', error: String(err) }); }
});

// Accept feedback corrections from client: { merchantKey: 'starbucks', category: 'Food' }
app.post('/api/feedback', express.json(), (req, res) => {
  const { key, category } = req.body || {};
  if(!key || !category) return res.status(400).json({ message: 'Missing key or category' });
  feedbackMap[key] = category;
  saveFeedback();
  res.json({ message: 'feedback saved', key, category });
});

// --- Integrations (demo stubs) ---
const connectedAccounts = { quickbooks: null, zoho: null, wave: null };

// Cloud storage connected accounts (demo)
connectedAccounts.cloud = { dropbox: null, gdrive: null };

// Cloud connect endpoints (demo)
app.get('/api/cloud/:provider/connect', (req, res) => {
  const provider = req.params.provider;
  if(!['dropbox','gdrive'].includes(provider)) return res.status(404).json({ message: 'Unknown cloud provider' });
  const mockUrl = `https://demo-oauth/${provider}/consent?client_id=demo&redirect_uri=${encodeURIComponent('http://localhost:3000/api/cloud/'+provider+'/callback')}`;
  res.json({ connect_url: mockUrl });
});

app.get('/api/cloud/:provider/callback', (req, res) => {
  const provider = req.params.provider;
  connectedAccounts.cloud[provider] = { connected_at: new Date(), token: 'demo-cloud-token-'+provider };
  res.send(`<html><body><h3>${provider} connected (demo)</h3><p>Close this window and return to the app.</p></body></html>`);
});

app.get('/api/cloud/:provider/status', (req, res) => {
  const provider = req.params.provider;
  return res.json({ provider, connected: !!connectedAccounts.cloud[provider], info: connectedAccounts.cloud[provider] });
});

// Demo import: list files (simulated) or fetch a file
app.post('/api/cloud/:provider/import', express.json(), (req, res) => {
  const provider = req.params.provider;
  if(!['dropbox','gdrive'].includes(provider)) return res.status(404).json({ message: 'Unknown cloud provider' });
  if(!connectedAccounts.cloud[provider]) return res.status(400).json({ message: 'Not connected' });
  // In a real app you'd call provider APIs to list or download files. Here return a simulated file list
  return res.json({ files: [ { id: 'demo-1', name: 'statement-jan.pdf', size: 234567 }, { id: 'demo-2', name: 'statement-feb.pdf', size: 198321 } ] });
});

// Demo export to cloud - accept basic upload and simulate success
app.post('/api/cloud/:provider/export', upload.single('file'), (req, res) => {
  const provider = req.params.provider;
  if(!['dropbox','gdrive'].includes(provider)) return res.status(404).json({ message: 'Unknown cloud provider' });
  if(!connectedAccounts.cloud[provider]) return res.status(400).json({ message: 'Not connected' });
  // simulate storing file
  console.log(`Simulated upload to ${provider}`, req.file && req.file.originalname);
  res.json({ ok: true, provider, stored: req.file && req.file.originalname });
});

// Start OAuth (demo): /api/integrations/:provider/connect -> returns a mock redirect URL
app.get('/api/integrations/:provider/connect', (req, res) => {
  const provider = req.params.provider;
  if(!['quickbooks','zoho','wave'].includes(provider)) return res.status(404).json({ message: 'Unknown provider' });
  // In a real implementation you would redirect to provider's OAuth consent URL
  const mockUrl = `https://demo-oauth/${provider}/consent?client_id=demo&redirect_uri=${encodeURIComponent('http://localhost:3000/api/integrations/'+provider+'/callback')}`;
  res.json({ connect_url: mockUrl });
});

// OAuth callback simulation (GET)
app.get('/api/integrations/:provider/callback', (req, res) => {
  const provider = req.params.provider;
  // Store a demo token (in real app store securely and associate with user)
  connectedAccounts[provider] = { connected_at: new Date(), token: 'demo-token-'+provider };
  res.send(`<html><body><h3>${provider} connected (demo)</h3><p>Close this window and return to the app.</p></body></html>`);
});

// Get connection status
app.get('/api/integrations/:provider/status', (req, res) => {
  const provider = req.params.provider;
  return res.json({ provider, connected: !!connectedAccounts[provider], info: connectedAccounts[provider] });
});

// Webhook receiver (demo)
app.post('/api/integrations/:provider/webhook', express.json(), (req, res) => {
  console.log('Integration webhook', req.params.provider, req.body);
  // process or enqueue the webhook in real app
  res.json({ received: true });
});

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

function startServer(port, maxTries=10){
  const server = app.listen(port, ()=> console.log(`Demo server running on http://localhost:${port}`));
  server.on('error', (err) => {
    if(err && err.code === 'EADDRINUSE'){
      const next = port + 1;
      if(port - (process.env.PORT ? parseInt(process.env.PORT,10) : 3000) < maxTries){
        console.warn(`Port ${port} in use, trying ${next}...`);
        startServer(next, maxTries - 1);
      } else {
        console.error('No available ports found. Please free a port or set PORT env variable.');
        process.exit(1);
      }
    } else {
      console.error('Server error', err);
      process.exit(1);
    }
  });
}

startServer(DEFAULT_PORT);

// Prevent process from exiting silently on unhandled errors during demo
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
