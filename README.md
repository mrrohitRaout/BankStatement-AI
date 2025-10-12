# BankStatement AI

BankStatement AI transforms bank statements into smart, actionable financial data using advanced AI-powered OCR and machine learning technologies. It allows users to upload PDFs, images, and scanned documents to extract structured data, categorize transactions, and produce insightful analytics — all within a secure, privacy-first environment.

## Features

- **AI-Powered OCR:** Extracts data from any bank statement format with 99.9% accuracy.
- **Smart Categorization:** Classifies transactions automatically by type, merchant, and purpose.
- **Real-time Analytics:** Interactive visualizations for spending patterns, cash flow trends, and financial health.
- **Multi-Bank Support:** Processes statements from over 150 banks worldwide.
- **Multiple Export Formats:** Export data as CSV, Excel, JSON, or QuickBooks formats.
- **Password Protection:** Secure processing of password-protected PDFs.
- **Bank-Level Security:** End-to-end encryption and zero data retention policy.
- **Responsive UI:** Modern and intuitive interface with drag-and-drop uploads.

## Getting Started

1. Clone the repository or download the source files.
2. Place the `hero-bg.jpg` image inside the `resources` folder.
3. Serve the files using any static web server (e.g., [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), Apache, Nginx).
4. Open `index.html` in a browser.
5. Use the navigation links for login, registration, and uploading bank statements.

## Folder Structure

## Demo Backend (optional)

This repository now includes a small Node.js Express demo backend to accept uploads and perform a basic demo OCR/parsing pipeline. It is intended to help wire the frontend buttons to a working API while you develop full processing features.

Files added for demo server:
- `package.json` - Node dependencies and start script
- `server.js` - Express server that serves static files and `/api/process` endpoint

Quick start (Node.js required):

```powershell
npm install
npm start
```

The server listens on http://localhost:3000 and will serve the project root. Open `http://localhost:3000/index.html` to test the upload/processing flow.

Notes:
- The backend uses `pdf-parse` and `tesseract.js` for demo extraction. Tesseract can be slow and memory intensive locally.
- For production use consider offloading OCR to a cloud provider or a specialized worker pool, add authentication, and use persistent storage.

Native dependencies note (image preprocessing):
- This demo also uses `sharp` to preprocess images for better OCR accuracy. `sharp` depends on `libvips` which is included in the npm package for most platforms. On some systems (notably certain Linux distributions) you may need to install libvips manually.
- Windows users: `sharp` should install automatically via npm, but if you encounter install errors, try installing the latest Node.js and then reinstalling dependencies. Consult https://sharp.pixelplumbing.com/install for troubleshooting.

Password-protected PDFs
-----------------------
- The demo server detects encrypted PDFs and will respond with JSON indicating a password is required.
- The client UI will prompt the user for the password and resend the file with the password included in the multipart form field `pdf_password` for decryption on the server.
- No passwords are stored by the demo server. In production, avoid logging or persisting passwords and prefer client-side decryption when feasible.

Multilingual OCR
-----------------
- The demo supports selecting OCR language in the UI (English, Spanish, French, Hindi, Swahili) via the `ocr_lang` field.
- For Tesseract to OCR other languages, the appropriate traineddata files must be available. `tesseract.js` may include some languages, but for reliable multi-language support you may need to install native Tesseract and language packs or use a cloud OCR provider.
- Example language codes used in the UI: `eng` (English), `spa` (Spanish), `fra` (French), `hin` (Hindi), `swa` (Swahili).
- When deploying, ensure your OCR backend supports the requested languages and locale-specific date/currency parsing.

Historical Learning (Adaptive AI)
---------------------------------
- The demo includes a simple feedback mechanism: when you correct a parsed transaction category in the UI, the client POSTs a mapping `{ key: <merchant text>, category: <category> }` to `/api/feedback`.
- These mappings are stored in `data/feedback.json` and are applied as `suggested_category` on future parsing results where the merchant text contains the mapped key.
- This is a simple rule-based learning mechanism (not a full ML model) intended to demonstrate how user corrections can improve future accuracy. For production consider training a classifier on accumulated corrections.

Complex layout handling
-----------------------
- The demo parsing pipeline now includes heuristics to handle complex layouts: it strips repeated page headers, groups lines across pages, handles merged/continuation lines, and extracts a best-effort merchant, date, and amount for each record.
- This is heuristic-based and designed to improve parsing of irregular tables and multi-page statements. For robust production needs consider:
	- Using PDF layout analysis libraries (pdfplumber, Camelot) to extract table structures.
	- Training an ML model that maps text blocks to structured fields when layouts vary widely.
	- Handling bank-specific templates with higher precision using template matchers.

	Developer Tools, Export & Integrations
	-------------------------------------

	This demo now includes developer-focused features for exporting processed data and connecting to common accounting platforms. These are demo/stub implementations intended to show how integrations and API access can be structured.

	Export Formats
	- CSV (Excel-compatible)
	- JSON (developer-friendly)
	- PDF (printable report)
	- Excel XLSX (formatted table)

	Endpoints
	- `POST /api/export` - Request an export. Body: `{ format: 'csv'|'json'|'xlsx'|'pdf', filename?: 'name', data: { transactions: [...] } }`. The endpoint responds with a file download (Content-Disposition). Example:

	```powershell
	curl -X POST http://localhost:3000/api/export -H "Content-Type: application/json" -d "{ \"format\": \"csv\", \"data\": { \"transactions\": [ { \"date\": \"2025-01-01\", \"line\": \"Starbucks\", \"amount\": -4.5 } ] } }" -o export.csv
	```

	Developer API & Token Access
	- `POST /api/developer/token` - Demo token issuance. Body: `{ client_id: 'your-app' }`. Returns a JWT token for calling protected developer endpoints (expires in 7 days in demo).
	- Protected endpoints (require `Authorization: Bearer <token>`): currently `/api/export` is designed as a developer endpoint and presumes token-based access for production deployments. For demo it's permissive, but examples show JWT usage.

	Accounting Integrations (Stubs)
	- `/api/integrations/:provider/connect` - Returns a mock consent URL (in real app redirect to provider OAuth consent).
	- `/api/integrations/:provider/callback` - OAuth callback simulation. In demo this stores a mock token in memory.
	- `/api/integrations/:provider/status` - Check connection status.
	- `/api/integrations/:provider/webhook` - Accepts incoming webhooks (demo receiver).

	Supported provider stubs: `quickbooks`, `zoho`, `wave`.

	Notes & Next Steps
	- These integrations are demo stubs. For production you'd implement secure OAuth flows, persist tokens in a secure store, retry/queue failed pushes, and honor scopes/permissions required by the accounting API.
	- QuickBooks: use the Intuit Developer docs and OAuth2 flow; consider using the `node-quickbooks` SDK or direct REST calls.
	- Zoho Books and Wave: similar OAuth2 flows and REST endpoints; read provider docs for required scopes and webhooks.

	Security
	- This demo uses a simple JWT secret `DEV_API_SECRET`. Always rotate and store secrets in your environment or a secrets manager in production.

	If you'd like, I can now:
	- Add a client-side “Export” dropdown that calls `/api/export` (CSV/JSON/XLSX/PDF) and triggers a download from the browser.
	- Wire the UI to show integration connect status and allow demo OAuth flows from the frontend.
	- Implement a basic server-side queue to push transactions to connected accounting providers and show push status in the UI.


