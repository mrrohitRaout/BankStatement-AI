# Quick Start Guide - BankStatement AI with Database

## 🚀 Quick Setup (3 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up MongoDB Atlas (Free)
Follow these steps at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register):
1. Create free account
2. Create free M0 cluster
3. Create database user (save password!)
4. Whitelist your IP (or allow all: `0.0.0.0/0`)
5. Get connection string

**Detailed Instructions**: See `DATABASE_SETUP_GUIDE.md`

### 3. Configure Environment
1. Open `.env` file
2. Update your MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bankstatement-ai?retryWrites=true&w=majority
```
3. (Optional) Generate new JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Start Server
```bash
npm start
```

### 5. Test It
- Open browser: `http://localhost:3000`
- Click "Sign In" → "Create account"
- Register a new user
- Success! You're connected to the database 🎉

---

## 📚 What's Included?

### Backend (Node.js + Express + MongoDB)
- ✅ User authentication (register/login)
- ✅ JWT token-based security
- ✅ Password hashing with bcrypt
- ✅ MongoDB Atlas integration
- ✅ Statement processing and storage
- ✅ Transaction analytics

### Frontend (HTML + TailwindCSS)
- ✅ Dark theme with teal accents
- ✅ Responsive design
- ✅ Login/Register pages
- ✅ Dashboard
- ✅ File upload & processing
- ✅ Analytics charts (Chart.js)

### Database Models
- **User Model**: name, email, password, subscription, usage stats
- **Statement Model**: transactions, analytics, file info

---

## 🌐 API Endpoints

### Authentication
```http
POST /api/auth/register  - Create new user
POST /api/auth/login     - Login user
GET  /api/auth/me        - Get current user (requires auth token)
```

### File Processing
```http
POST /api/process        - Process bank statement
POST /api/export         - Export data (CSV, JSON, Excel, PDF)
POST /api/feedback       - Submit category corrections
```

### Status
```http
GET  /api/status         - Check server & database status
```

---

## 📁 Project Structure

```
BankStatement-AI-3/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── User.js              # User schema
│   └── Statement.js         # Statement schema
├── routes/
│   └── auth.js              # Authentication routes
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── css/
│   └── custom.css           # Custom styles
├── js/
│   └── statement-processor.js  # Frontend processing
├── .env                     # Environment variables (DO NOT COMMIT)
├── .env.example             # Environment template
├── server.js                # Main server file
├── package.json             # Dependencies
├── index.html               # Homepage
├── login.html               # Login page
├── register.html            # Register page
└── dashboard.html           # User dashboard
```

---

## 🧪 Testing

### Test Registration (Postman/Thunder Client)
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Test Login
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Save the `token` from response!**

### Test Protected Route
```http
GET http://localhost:3000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🔒 Environment Variables

Required in `.env`:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://...

# JWT secret for authentication
JWT_SECRET=your-secret-key

# Server port (default: 3000)
PORT=3000

# Environment
NODE_ENV=development
```

---

## 📊 View Your Data

**MongoDB Atlas Dashboard**:
1. Go to atlas.mongodb.com
2. Click "Database" → "Browse Collections"
3. Select `bankstatement-ai` database
4. View collections:
   - `users` - All registered users
   - `statements` - Processed bank statements

---

## 🎨 Frontend Pages

1. **Homepage** (`index.html`)
   - Hero section with image
   - Features showcase
   - Pricing plans
   - Upload section
   - Analytics dashboard

2. **Login** (`login.html`)
   - Email/password authentication
   - Dark theme with teal glows
   - "Create account" link

3. **Register** (`register.html`)
   - User registration form
   - Password confirmation
   - Auto-redirect after signup

4. **Dashboard** (`dashboard.html`)
   - User welcome screen
   - Quick actions
   - Feature stats

---

## 🛠️ Development

### Install Dependencies
```bash
npm install
```

### Run Server
```bash
npm start
```

### Access Application
```
http://localhost:3000
```

---

## 🚀 Deployment (Future)

For production deployment:

1. **Update Environment Variables**
   - Use strong JWT_SECRET
   - Restrict MongoDB IP whitelist
   - Set NODE_ENV=production

2. **Choose Hosting Platform**
   - **Backend**: Heroku, Railway, Render, DigitalOcean
   - **Frontend**: Netlify, Vercel, GitHub Pages
   - **Full Stack**: Heroku, Railway, Render

3. **Enable HTTPS**
   - Use SSL certificates
   - Update CORS settings

---

## 💡 Tips

- **Free Tier Limits**: MongoDB Atlas M0 has 512MB storage
- **JWT Tokens**: Valid for 7 days (configurable)
- **Password Requirements**: Minimum 6 characters
- **File Upload**: Max 60MB per file

---

## 🐛 Common Issues

**Issue**: Can't connect to database  
**Solution**: Check connection string in `.env` and verify IP whitelist

**Issue**: npm install fails  
**Solution**: Use Node.js v14+ and npm v6+

**Issue**: Port 3000 already in use  
**Solution**: Change PORT in `.env` or kill existing process

---

## 📞 Need Help?

1. Read `DATABASE_SETUP_GUIDE.md` for detailed MongoDB setup
2. Check `.env.example` for configuration reference
3. Verify all dependencies installed with `npm list`

---

**Ready to go! 🎉**

Start the server with `npm start` and visit `http://localhost:3000`
