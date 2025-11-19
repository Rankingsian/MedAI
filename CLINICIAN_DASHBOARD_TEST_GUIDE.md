# Clinician Dashboard - Quick Test Guide

## 🚀 Testing the Fix

### Prerequisites
- Frontend running on localhost (typically http://localhost:5173)
- Backend API running
- Firebase configured

### Step-by-Step Test

#### 1️⃣ **Sign Up as a New Clinician**

1. Open your browser and go to: `http://localhost:5173/clinician`
2. Click **"Don't have an account? Sign up"**
3. Fill in the form:
   - **Full Name**: Dr. Jane Smith
   - **Specialization**: Cardiology
   - **License Number**: MED-123456-CS
   - **Email**: jane.smith@hospital.com
   - **Password**: SecurePass123
4. Click **"Create Account"**

**Expected Result**: 
- ✅ No errors
- ✅ Redirected to `/clinician/settings` (profile completion page)

#### 2️⃣ **Complete Profile**

1. Review the pre-filled information
2. Verify all fields have correct values
3. Click **"Save Profile"**

**Expected Result**:
- ✅ Success message appears: "Profile updated successfully"
- ✅ Redirected to `/clinician/dashboard` after 2 seconds
- ✅ Dashboard loads with patient list and consultation requests

#### 3️⃣ **Verify Dashboard Access**

Once on dashboard, verify you see:
- ✅ **Dashboard Header** with clinician name
- ✅ **Patient List** section (may be empty initially)
- ✅ **Consultation Requests** section
- ✅ **Logout** button in top navigation

#### 4️⃣ **Test Login**

1. Click **"Logout"** button
2. Navigate to: `http://localhost:5173/clinician`
3. Should show login form by default
4. Fill in credentials:
   - **Email**: jane.smith@hospital.com
   - **Password**: SecurePass123
5. Click **"Login"**

**Expected Result**:
- ✅ Successfully logged in
- ✅ Redirected to `/clinician/dashboard`
- ✅ Dashboard displays correctly

#### 5️⃣ **Test Patient Account Cannot Access Clinician Dashboard**

1. Log out from clinician account
2. Sign up / log in as a regular **patient** account
3. Try to manually navigate to: `http://localhost:5173/clinician/dashboard`

**Expected Result**:
- ✅ Redirected back to landing page or user dashboard
- ✅ Cannot access clinician-only routes

#### 6️⃣ **Verify Firestore Data**

1. Open Firebase Console: https://console.firebase.google.com
2. Go to Firestore Database
3. Check `users` collection → Find the clinician document (by email)
4. Verify the document contains:

```
{
  "uid": "user-uid-here",
  "email": "jane.smith@hospital.com",
  "name": "Dr. Jane Smith",
  "role": "clinician",  ✅ This must be present!
  "profileComplete": true,  ✅ This must be true!
  "createdAt": "2025-11-12T..."
}
```

5. Check `clinicians` collection → Find clinician document
6. Verify it contains:

```
{
  "uid": "user-uid-here",
  "email": "jane.smith@hospital.com",
  "name": "Dr. Jane Smith",
  "specialization": "Cardiology",
  "license_number": "MED-123456-CS",
  "status": "pending",
  "created_at": "2025-11-12T...",
  "role": "clinician"
}
```

## ✅ Success Criteria

All of the following should pass:

- [ ] New clinician can sign up
- [ ] Redirect to settings page after signup
- [ ] Can save profile without errors
- [ ] Redirected to dashboard after profile save
- [ ] Dashboard loads with all sections visible
- [ ] Can log out successfully
- [ ] Can log back in with same credentials
- [ ] Dashboard redirects from login flow
- [ ] Patient accounts cannot access `/clinician/dashboard`
- [ ] Firestore `users` collection has `role: "clinician"`
- [ ] Firestore `users` collection has `profileComplete: true`
- [ ] Firestore `clinicians` collection has all profile info

## 🐛 Troubleshooting

### Issue: Still redirected to landing page after login

**Solution**:
1. Check browser console for errors (F12)
2. Check that `role: 'clinician'` exists in Firestore `users` collection
3. Clear browser cache and try again
4. Check that `/clinician/dashboard` route exists in `App.jsx`

### Issue: "Error verifying clinician profile" during login

**Solution**:
1. Verify the user document exists in Firestore `users` collection
2. Verify `role` field is exactly `'clinician'` (case-sensitive)
3. Check that Firebase credentials are correct

### Issue: Dashboard loads but shows "Loading..." forever

**Solution**:
1. Check browser console for API errors
2. Verify backend API is running
3. Check CORS settings
4. Verify clinician has permissions to fetch patients

### Issue: "No clinician profile found" error

**Solution**:
1. This means the user document in `users` collection is missing or doesn't have `role: 'clinician'`
2. Try signing up again
3. Verify Firestore data structure matches expected format

## 📱 Browser Console Debugging

Open browser Developer Tools (F12) and check console for messages:

```javascript
// Should see something like:
Clinician logged in successfully: jane.smith@hospital.com
Navigating to: /clinician/dashboard

// Should NOT see:
No clinician profile found
Error verifying clinician profile
userRole is null
```

## 🔗 Important Routes

| Route | Purpose | Accessible By |
|-------|---------|----------------|
| `/clinician` | Login/Signup | Everyone (unauthenticated) |
| `/clinician/dashboard` | Main dashboard | Authenticated clinicians only |
| `/clinician/patient/:user_id` | Patient detail view | Authenticated clinicians only |
| `/clinician/settings` | Profile settings | Authenticated clinicians with incomplete profile |

## 📞 Support

If tests fail, check:
1. Browser console for JavaScript errors
2. Firebase console for authentication issues
3. Backend logs for API errors
4. Firestore data structure matches this guide
5. All required fields are present in both collections

---

**Last Updated**: November 12, 2025  
**Test Difficulty**: ⭐ Easy (All automated, just follow steps)
