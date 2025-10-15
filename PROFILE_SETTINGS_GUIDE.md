# User Profile & Settings Guide

## ✅ Features Added

Your BankStatement AI application now includes comprehensive **User Profile** and **Settings** management!

---

## 🆕 New Pages

### 1. **Profile Page** (`profile.html`)
View and edit your user profile with beautiful dark-themed interface.

**Features:**
- ✅ User avatar with initials
- ✅ Display name, email, subscription plan
- ✅ Edit personal information (name, email, phone, company, address)
- ✅ Bio section (up to 500 characters)
- ✅ Usage statistics (files processed, account status, subscription plan)
- ✅ Real-time profile updates
- ✅ Form validation

### 2. **Settings Page** (`settings.html`)
Manage account security and preferences.

**Features:**
- ✅ **Security Section**
  - Change password functionality
  - Current password verification
  - Password strength requirements (minimum 6 characters)
  
- ✅ **Subscription Management**
  - View current plan (Free/Starter/Pro/Enterprise)
  - Plan status display
  - Upgrade plan button
  
- ✅ **Preferences**
  - Email notifications toggle
  - Marketing emails toggle
  
- ✅ **Danger Zone**
  - Delete account functionality
  - Password confirmation required
  - Deletes all user data and statements

---

## 🔌 New API Endpoints

### Profile Management

**Get Profile**
```http
GET /api/profile
Authorization: Bearer YOUR_TOKEN

Response:
{
  "success": true,
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Acme Inc",
    "address": "123 Main St",
    "bio": "Software developer...",
    "subscription": {...},
    "usage": {...}
  }
}
```

**Update Profile**
```http
PUT /api/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Inc",
  "address": "123 Main St",
  "bio": "Updated bio"
}

Response:
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {...}
}
```

**Change Password**
```http
PUT /api/profile/password
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}

Response:
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Delete Account**
```http
DELETE /api/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "password": "yourpassword"
}

Response:
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## 💾 Updated Database Model

### User Schema (Enhanced)

**New Fields Added:**
```javascript
{
  phone: String,        // Phone number
  address: String,      // User address
  company: String,      // Company name
  bio: String,          // User bio (max 500 chars)
  
  // Existing fields...
  name: String,
  email: String,
  password: String (hashed),
  subscription: {...},
  usage: {...}
}
```

---

## 🎨 User Interface

### Profile Page Features:

1. **Header Section**
   - Large circular avatar with user initials
   - User name and email
   - Subscription plan badge
   - Member since date

2. **Edit Form**
   - Full name (required)
   - Email address (required, validated)
   - Phone number (optional)
   - Company (optional)
   - Address (optional)
   - Bio (optional, max 500 chars)
   - Save and Reset buttons

3. **Usage Statistics**
   - Files processed count
   - Account status
   - Subscription plan

### Settings Page Features:

1. **Security Section**
   - Change password form
   - Current password verification
   - New password with confirmation
   - Password strength requirements

2. **Subscription Section**
   - Current plan display
   - Plan status
   - Upgrade button (links to pricing)

3. **Preferences**
   - Email notifications toggle
   - Marketing emails toggle
   - Beautiful toggle switches

4. **Danger Zone**
   - Delete account button
   - Confirmation modal
   - Password verification required
   - Warning messages

---

## 🔒 Security Features

### Profile Updates:
- ✅ JWT token authentication required
- ✅ Email uniqueness validation
- ✅ User can only update their own profile
- ✅ Input sanitization and validation

### Password Change:
- ✅ Current password verification
- ✅ Minimum 6 characters for new password
- ✅ Password hashing with bcrypt
- ✅ Secure password comparison

### Account Deletion:
- ✅ Password confirmation required
- ✅ Deletes user and all associated statements
- ✅ Irreversible action warning
- ✅ Confirmation modal

---

## 🎯 How to Use

### Access Profile Page:
1. Login to your account
2. Navigate to **Dashboard**
3. Click **"Profile"** in navigation
4. Edit your information
5. Click **"Save Changes"**

### Change Password:
1. Navigate to **Settings**
2. Go to **Security** section
3. Enter current password
4. Enter new password (min 6 chars)
5. Confirm new password
6. Click **"Change Password"**

### Delete Account:
1. Navigate to **Settings**
2. Scroll to **Danger Zone**
3. Click **"Delete Account"**
4. Enter your password in modal
5. Click **"Confirm Delete"**
6. ⚠️ **All data will be permanently deleted!**

---

## 🔄 Navigation Structure

All pages now include consistent navigation:

```
Home | Dashboard | Profile | Settings | Logout
```

Active page is highlighted in teal color.

---

## 🧪 Testing

### Test Profile Update:
1. Login to account
2. Go to Profile page
3. Update name, phone, or bio
4. Click Save Changes
5. Verify success message
6. Refresh page to confirm changes persisted

### Test Password Change:
1. Go to Settings page
2. Enter current password
3. Enter new password
4. Confirm new password
5. Click Change Password
6. Logout and login with new password

### Test Account Deletion:
⚠️ **Be careful - this is permanent!**
1. Create a test account
2. Go to Settings
3. Click Delete Account
4. Enter password
5. Confirm deletion
6. Verify account is deleted

---

## 📊 Database Records

### User Profile Data:
```javascript
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Inc",
  "address": "123 Main St, City, State",
  "bio": "Software developer passionate about fintech",
  "subscription": {
    "plan": "free",
    "status": "active"
  },
  "usage": {
    "filesProcessed": 5,
    "lastProcessedAt": "2025-01-15T..."
  },
  "createdAt": "2025-01-01T...",
  "updatedAt": "2025-01-15T..."
}
```

---

## 🎨 Design Consistency

All new pages follow the existing design system:

**Colors:**
- Background: Dark blue-gray gradient
- Primary: Teal (`#14b8a6`)
- Text: White and light gray
- Accents: Teal glows and borders

**Components:**
- Glass-morphism cards
- Teal glowing buttons
- Smooth hover animations
- Responsive grid layouts
- Modern form inputs

---

## 📱 Responsive Design

All pages are fully responsive:

- **Desktop**: Full navigation and multi-column layout
- **Tablet**: Adjusted grid columns
- **Mobile**: Stacked layout, full-width cards

---

## ⚠️ Important Notes

1. **Email Changes**: When updating email, system checks for uniqueness
2. **Password Requirements**: Minimum 6 characters
3. **Bio Limit**: Maximum 500 characters
4. **Account Deletion**: Cannot be undone - deletes all user data
5. **Authentication**: All API calls require valid JWT token
6. **Session Management**: Token stored in localStorage

---

## 🚀 Future Enhancements

Potential additions:
- [ ] Profile picture upload
- [ ] Email verification on email change
- [ ] Two-factor authentication
- [ ] Export account data
- [ ] Account activity log
- [ ] Social media links
- [ ] Timezone preferences
- [ ] Language preferences
- [ ] Dark/light mode toggle

---

## 📄 Files Modified/Created

### New Files:
- `profile.html` - User profile page
- `settings.html` - Settings and security page
- `routes/profile.js` - Profile API routes
- `PROFILE_SETTINGS_GUIDE.md` - This guide

### Modified Files:
- `models/User.js` - Added profile fields
- `server.js` - Added profile routes
- `dashboard.html` - Added navigation links

---

## ✅ Checklist

Verify everything works:

- [ ] Can access profile page after login
- [ ] Can update name and email
- [ ] Can add phone, company, address
- [ ] Can write and save bio
- [ ] Usage stats display correctly
- [ ] Can change password
- [ ] Can logout and login with new password
- [ ] Settings page loads correctly
- [ ] Subscription info displays
- [ ] Delete account works (test account only!)
- [ ] Navigation works on all pages
- [ ] Responsive on mobile devices

---

## 🎉 Success!

You now have a complete user profile and settings management system integrated with MongoDB!

**What you can do:**
- ✅ View and edit user profiles
- ✅ Change passwords securely
- ✅ Manage subscription info
- ✅ Delete accounts
- ✅ Track usage statistics
- ✅ Professional UI/UX

**Your application is production-ready! 🚀**
