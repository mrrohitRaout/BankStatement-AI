/**
 * Client-Side Bank Statement Processor
 * Processes files entirely in the browser for complete privacy
 * No data is sent to any server
 */

class ClientSideProcessor {
    constructor() {
        this.pdfWorker = null;
        this.tesseractWorker = null;
        this.initialized = false;
    }

    /**
     * Initialize client-side processing libraries
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Initialize PDF.js
            if (typeof pdfjsLib !== 'undefined') {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 
                    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                this.pdfWorker = pdfjsLib;
            }

            // Initialize Tesseract.js for OCR
            if (typeof Tesseract !== 'undefined') {
                this.tesseractWorker = await Tesseract.createWorker();
                await this.tesseractWorker.loadLanguage('eng');
                await this.tesseractWorker.initialize('eng');
            }

            this.initialized = true;
            console.log('✅ Client-side processor initialized');
        } catch (error) {
            console.error('Failed to initialize client-side processor:', error);
            throw error;
        }
    }

    /**
     * Process file client-side (PDF or Image)
     */
    async processFile(file, options = {}) {
        await this.initialize();

        const fileType = file.type;
        let text = '';

        try {
            if (fileType === 'application/pdf') {
                text = await this.processPDF(file, options);
            } else if (fileType.startsWith('image/')) {
                text = await this.processImage(file, options);
            } else {
                throw new Error('Unsupported file type. Please upload PDF or image files.');
            }

            // Parse the extracted text
            const transactions = this.parseTransactions(text);
            const analytics = this.calculateAnalytics(transactions);
            const bankInfo = this.detectBank(text);

            return {
                success: true,
                filename: file.name,
                fileSize: file.size,
                processedAt: new Date().toISOString(),
                extractedText: text,
                transactions: transactions,
                analytics: analytics,
                bankInfo: bankInfo,
                privacy: {
                    processedLocally: true,
                    dataShared: false,
                    secure: true
                }
            };

        } catch (error) {
            console.error('Client-side processing error:', error);
            return {
                success: false,
                error: error.message,
                filename: file.name
            };
        }
    }

    /**
     * Process PDF file
     */
    async processPDF(file, options = {}) {
        if (!this.pdfWorker) {
            throw new Error('PDF processor not available');
        }

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = this.pdfWorker.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';

        // Extract text from all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            const pageText = textContent.items
                .map(item => item.str)
                .join(' ');
            
            fullText += pageText + '\n';
        }

        return fullText;
    }

    /**
     * Process Image file with OCR
     */
    async processImage(file, options = {}) {
        if (!this.tesseractWorker) {
            throw new Error('OCR processor not available. Please process on server.');
        }

        const { data: { text } } = await this.tesseractWorker.recognize(file);
        return text;
    }

    /**
     * Parse transactions from extracted text
     */
    parseTransactions(text) {
        const transactions = [];
        const lines = text.split('\n').filter(line => line.trim());

        // Regular expressions for common patterns
        const dateRegex = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g;
        const amountRegex = /(\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Look for lines with dates and amounts
            const dates = line.match(dateRegex);
            const amounts = line.match(amountRegex);

            if (dates && amounts) {
                // Extract transaction details
                const date = dates[0];
                const amount = this.parseAmount(amounts[amounts.length - 1]);
                
                // Clean description (remove date and amount)
                let description = line
                    .replace(dateRegex, '')
                    .replace(amountRegex, '')
                    .trim();

                transactions.push({
                    date: this.parseDate(date),
                    description: description || 'Transaction',
                    amount: amount,
                    type: amount < 0 ? 'debit' : 'credit',
                    category: this.categorizeTransaction(description)
                });
            }
        }

        return transactions;
    }

    /**
     * Parse amount string to number
     */
    parseAmount(amountStr) {
        const cleaned = amountStr.replace(/[$,]/g, '');
        return parseFloat(cleaned);
    }

    /**
     * Parse date string
     */
    parseDate(dateStr) {
        // Try common date formats
        const formats = [
            /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,  // MM/DD/YYYY
            /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/    // MM/DD/YY
        ];

        for (const format of formats) {
            const match = dateStr.match(format);
            if (match) {
                return dateStr;
            }
        }

        return dateStr;
    }

    /**
     * Categorize transaction based on description
     */
    categorizeTransaction(description) {
        const desc = description.toLowerCase();

        const categories = {
            'Food & Dining': ['restaurant', 'cafe', 'food', 'starbucks', 'mcdonald', 'pizza', 'uber eats', 'doordash'],
            'Shopping': ['amazon', 'walmart', 'target', 'store', 'shop', 'mall'],
            'Transportation': ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'toll'],
            'Entertainment': ['netflix', 'spotify', 'hulu', 'movie', 'theater', 'game'],
            'Utilities': ['electric', 'water', 'gas', 'internet', 'phone', 'utility'],
            'Healthcare': ['pharmacy', 'hospital', 'doctor', 'medical', 'health'],
            'Transfer': ['transfer', 'payment', 'deposit', 'withdrawal', 'atm'],
            'Income': ['salary', 'payroll', 'income', 'deposit', 'credit']
        };

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => desc.includes(keyword))) {
                return category;
            }
        }

        return 'Other';
    }

    /**
     * Calculate analytics from transactions
     */
    calculateAnalytics(transactions) {
        const analytics = {
            totalTransactions: transactions.length,
            totalCredits: 0,
            totalDebits: 0,
            netAmount: 0,
            averageTransaction: 0,
            categoryBreakdown: {},
            largestTransaction: null,
            smallestTransaction: null
        };

        if (transactions.length === 0) return analytics;

        let amounts = [];

        transactions.forEach(tx => {
            amounts.push(Math.abs(tx.amount));

            if (tx.type === 'credit') {
                analytics.totalCredits += tx.amount;
            } else {
                analytics.totalDebits += Math.abs(tx.amount);
            }

            // Category breakdown
            const category = tx.category || 'Other';
            analytics.categoryBreakdown[category] = 
                (analytics.categoryBreakdown[category] || 0) + Math.abs(tx.amount);
        });

        analytics.netAmount = analytics.totalCredits - analytics.totalDebits;
        analytics.averageTransaction = amounts.length > 0 
            ? amounts.reduce((a, b) => a + b, 0) / amounts.length 
            : 0;

        analytics.largestTransaction = Math.max(...amounts);
        analytics.smallestTransaction = Math.min(...amounts);

        return analytics;
    }

    /**
     * Detect bank from text using smart template recognition
     */
    detectBank(text) {
        // Use BankTemplateRecognition if available
        if (typeof BankTemplateRecognition !== 'undefined') {
            const recognizer = new BankTemplateRecognition();
            const result = recognizer.detectBank(text);
            
            if (result.detected) {
                return {
                    name: result.bank.name,
                    country: result.bank.country,
                    logo: result.bank.logo,
                    colors: result.bank.colors,
                    detected: true,
                    confidence: result.confidence,
                    matches: result.matches,
                    accountInfo: result.bank.patterns ? this.extractAccountInfo(text, result.bank.patterns) : {}
                };
            }
        }

        // Fallback to basic detection
        const lower = text.toLowerCase();
        const banks = [
            { name: 'Chase Bank', keywords: ['chase', 'jpmorgan'] },
            { name: 'Bank of America', keywords: ['bank of america', 'bofa'] },
            { name: 'Wells Fargo', keywords: ['wells fargo'] },
            { name: 'Citibank', keywords: ['citibank', 'citi'] },
            { name: 'Capital One', keywords: ['capital one'] },
            { name: 'US Bank', keywords: ['u.s. bank', 'us bank'] },
            { name: 'PNC Bank', keywords: ['pnc'] },
            { name: 'TD Bank', keywords: ['td bank'] },
            { name: 'HSBC', keywords: ['hsbc'] },
            { name: 'State Bank of India', keywords: ['state bank of india', 'sbi'] }
        ];

        for (const bank of banks) {
            if (bank.keywords.some(keyword => lower.includes(keyword))) {
                return {
                    name: bank.name,
                    detected: true,
                    confidence: 75
                };
            }
        }

        return {
            name: 'Unknown Bank',
            detected: false,
            confidence: 0
        };
    }

    /**
     * Extract account information using bank patterns
     */
    extractAccountInfo(text, patterns) {
        const info = {};

        if (patterns.accountNumber) {
            const match = text.match(patterns.accountNumber);
            if (match) info.accountNumber = match[1];
        }

        if (patterns.sortCode) {
            const match = text.match(patterns.sortCode);
            if (match) info.sortCode = match[1];
        }

        if (patterns.ifsc) {
            const match = text.match(patterns.ifsc);
            if (match) info.ifsc = match[1];
        }

        if (patterns.iban) {
            const match = text.match(patterns.iban);
            if (match) info.iban = match[1];
        }

        if (patterns.bsb) {
            const match = text.match(patterns.bsb);
            if (match) info.bsb = match[1];
        }

        if (patterns.statementDate) {
            const match = text.match(patterns.statementDate);
            if (match) info.statementDate = match[1];
        }

        if (patterns.balance) {
            const match = text.match(patterns.balance);
            if (match) info.balance = match[1];
        }

        return info;
    }

    /**
     * Export data to various formats (client-side)
     */
    exportToCSV(transactions) {
        const headers = ['Date', 'Description', 'Amount', 'Type', 'Category'];
        const rows = transactions.map(tx => [
            tx.date,
            `"${tx.description}"`,
            tx.amount,
            tx.type,
            tx.category
        ]);

        const csv = [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');

        return csv;
    }

    exportToJSON(data) {
        return JSON.stringify(data, null, 2);
    }

    /**
     * Download file (client-side)
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Cleanup
     */
    async cleanup() {
        if (this.tesseractWorker) {
            await this.tesseractWorker.terminate();
        }
        this.initialized = false;
    }
}

// Export for use
window.ClientSideProcessor = ClientSideProcessor;
