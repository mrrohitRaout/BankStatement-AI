# MongoDB Atlas Free Database Setup Guide

This guide will help you set up a **FREE MongoDB Atlas database** for your BankStatement AI application.

## 📋 Prerequisites
- A valid email address
- Internet connection

---

## 🚀 Step 1: Create MongoDB Atlas Account

1. **Visit MongoDB Atlas**: Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)

2. **Sign Up**:
   - Click "Sign up" 
   - Use Google/GitHub account OR email/password
   - Verify your email if using email signup

3. **Complete Profile**:
   - Fill in your basic information
   - Select "Learning MongoDB" as your goal (for free tier)

---

## 🗄️ Step 2: Create a Free Cluster

1. **Choose Deployment Option**:
   - Select **"Build a Database"**
   - Choose **"M0 FREE"** tier (highlighted in green)

2. **Configure Cluster**:
   - **Cloud Provider**: AWS, Google Cloud, or Azure (any works)
   - **Region**: Choose closest to your location
   - **Cluster Name**: Leave default or name it `bankstatement-ai`

3. **Click "Create"** - Wait 1-3 minutes for cluster to deploy

---

## 🔐 Step 3: Create Database User

1. **Security Quickstart** will appear automatically:

2. **Create Database User**:
   - **Username**: Choose a username (e.g., `admin` or `dbuser`)
   - **Password**: Click "Autogenerate Secure Password" OR create your own
   - ⚠️ **IMPORTANT**: Copy and save the password immediately!

3. **Click "Create User"**

---

## 🌐 Step 4: Configure Network Access

1. **Add IP Address**:
   - **Option 1 (Development)**: Click "Add My Current IP Address"
   - **Option 2 (Universal Access)**: Click "Allow Access from Anywhere" 
     - This adds `0.0.0.0/0` (useful for development, but less secure for production)

2. **Click "Finish and Close"**

---

## 🔗 Step 5: Get Your Connection String

1. **In Atlas Dashboard**:
   - Click on **"Database"** in left sidebar
   - Find your cluster
   - Click **"Connect"** button

2. **Choose Connection Method**:
   - Select **"Connect your application"**

3. **Copy Connection String**:
   - **Driver**: Node.js
   - **Version**: 4.1 or later
   - Copy the connection string that looks like:
     ```
     mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

4. **Replace `<password>`**:
   - Replace `<password>` with your actual database user password
   - Replace `username` if different
   - Add database name after `.net/` (e.g., `bankstatement-ai`)
   
   Final format:
   ```
   mongodb+srv://admin:YourPassword123@cluster0.xxxxx.mongodb.net/bankstatement-ai?retryWrites=true&w=majority
   ```

---

## ⚙️ Step 6: Configure Your Application

1. **Open `.env` file** in your project root

2. **Update MONGODB_URI**:
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/bankstatement-ai?retryWrites=true&w=majority
   ```

3. **Update JWT_SECRET** (optional but recommended):
   ```env
   JWT_SECRET=your-super-secret-random-string-here
   ```
   
   Generate a random secret using:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

---

## 📦 Step 7: Install Dependencies

Open terminal in your project directory and run:

```bash
npm install
```

This will install all required packages including:
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `dotenv` - Environment variables

---

## 🏃 Step 8: Start Your Server

```bash
npm start
```

You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
📊 Database Name: bankstatement-ai
Demo server running on http://localhost:3000
```

---

## ✅ Step 9: Test the Connection

### **Option 1: Using Browser**

1. Visit: `http://localhost:3000`
2. Click "Sign In" → "Create account"
3. Fill in registration form
4. If successful, you're connected to the database!

### **Option 2: Using Postman/Thunder Client**

**Test Registration:**
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

---

## 📊 View Data in MongoDB Atlas

1. Go to **MongoDB Atlas Dashboard**
2. Click **"Database"** → **"Browse Collections"**
3. Select your database (`bankstatement-ai`)
4. View collections:
   - `users` - User accounts
   - `statements` - Processed bank statements

---

## 🔍 Troubleshooting

### ❌ Connection Failed

**Error**: `MongoServerError: bad auth`
- **Solution**: Double-check username and password in `.env` file

**Error**: `MongoNetworkError: connect ECONNREFUSED`
- **Solution**: Check your IP is whitelisted in Atlas → Network Access

**Error**: `MongooseServerSelectionError`
- **Solution**: Verify internet connection and connection string format

### ❌ Authentication Issues

**Error**: `Email already registered`
- **Solution**: User already exists, try logging in or use different email

**Error**: `Invalid credentials`
- **Solution**: Check email/password combination

---

## 🌟 Features Now Available

With the database connected, you now have:

✅ **User Registration** - Create new accounts  
✅ **User Login** - Secure authentication with JWT  
✅ **Password Hashing** - Encrypted password storage  
✅ **User Profiles** - Store user data and preferences  
✅ **Statement Storage** - Save processed bank statements  
✅ **Analytics Persistence** - Keep transaction history  
✅ **Subscription Management** - Track user plans  
✅ **Usage Tracking** - Monitor file processing limits  

---

## 📝 API Endpoints

### Authentication

**Register**
```http
POST /api/auth/register
Body: { "name": "...", "email": "...", "password": "..." }
```

**Login**
```http
POST /api/auth/login
Body: { "email": "...", "password": "..." }
```

**Get Current User**
```http
GET /api/auth/me
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use strong passwords** for database users
3. **Rotate JWT_SECRET** regularly
4. **Limit IP whitelist** in production
5. **Use HTTPS** in production

---

## 🎉 Success!

Your BankStatement AI application is now connected to MongoDB Atlas free database!

### Next Steps:
- Test user registration and login
- Process a bank statement and see it saved to database
- Check MongoDB Atlas to view your data
- Deploy to production when ready

---

## 📞 Support

- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Mongoose Docs**: https://mongoosejs.com/docs/
- **Project Issues**: Contact your development team

---

**Happy Coding! 🚀**
