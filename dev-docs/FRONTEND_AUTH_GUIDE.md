# 🔐 Authentication Backend API Guide

Quick reference for frontend developers.

## Base URL
```
http://localhost:3000/auth
```

## Token System

**Access Token:** 1 hour lifetime - Use for all API requests  
**Refresh Token:** 7 days lifetime - Use to get new access token when it expires

**Critical:** When you get `401 Unauthorized` → Call `/auth/refresh` with refresh_token → Get new tokens → Retry request

---

## Endpoints

### 1. Signup
`POST /auth/signup`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phoneNumber": "1234567890",
  "role": "customer" // Optional: "customer" (default) or "client_admin"
}
```

**Response (Customer):**
```json
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "emailVerified": false,
  "userId": "abc123..."
}
```

**Response (Admin):**
```json
{
  "message": "User registered successfully",
  "emailVerified": true,
  "userId": "abc123..."
}
```

**What to do:**
- Check `emailVerified`
- If `false` → Show "Check your email" message
- If `true` → User can login immediately

---

### 2. Login
`POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "abc123...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "customer",
    "tenant_id": null
  }
}
```

**What to do:**
1. Store `access_token` and `refresh_token` (localStorage/cookies)
2. Store user data
3. Add token to all API requests: `Authorization: Bearer <access_token>`
4. Redirect based on role: `customer` → customer dashboard, `client_admin` → admin dashboard

**Errors:**
- `401: "Invalid credentials"` → Wrong email/password
- `401: "Please verify your email before logging in"` → Customer email not verified → Show verification UI

---

### 3. Get Current User
`GET /auth/me`

**Headers:** `Authorization: Bearer <access_token>`

**Response:** User data (same as login)

**What to do:**
- Call on app load to check if user is logged in
- If `401` → Token expired → Try refresh token → If fails → Logout

---

### 4. Logout
`POST /auth/logout`

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "token": "<access_token>"
}
```

**What to do:**
- Call endpoint (optional)
- Clear all stored tokens and user data
- Redirect to login

---

### 5. Refresh Token ⚠️ IMPORTANT
`POST /auth/refresh`

**Request:**
```json
{
  "refresh_token": "your_refresh_token"
}
```

**Response:**
```json
{
  "access_token": "new_access_token...",
  "refresh_token": "new_refresh_token...",
  "user": {...}
}
```

**What to do:**
- **When:** Any API request returns `401`
- **Action:** Call this endpoint with refresh_token
- **Then:** Update stored tokens with new ones
- **Then:** Retry the original request
- **If fails:** Logout user

**Without this:** Users get logged out every hour!

---

### 6. Forgot Password
`POST /auth/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**What to do:** Always show success message (don't reveal if email exists)

---

### 7. Reset Password
`POST /auth/reset-password`

**Request:**
```json
{
  "token": "access_token_from_email_link",
  "newPassword": "newPassword123"
}
```

**What to do:**
1. User clicks email link → Redirects to your frontend with token in URL hash: `#access_token=xxx&...`
2. Extract `access_token` from URL hash
3. Show password reset form
4. Submit new password with token
5. On success → Redirect to login

**Errors:**
- `401` → Token expired → Show "Link expired, request new one"
- `400` → Password validation error

---

### 8. Verify Email
`POST /auth/verify-email`

**Request:**
```json
{
  "token": "access_token_from_email_link"
}
```

**What to do:**
1. User clicks email link → Redirects with token in URL hash: `#access_token=xxx&...`
2. Extract `access_token` from URL hash
3. Call this endpoint with token
4. On success → Show "Email verified!" → Redirect to login

**Note:** Supabase may auto-verify when link is clicked. Still call this endpoint to ensure.

**Errors:**
- `401` → Token expired → Show "Link expired"
- `400` → Already verified

---

### 9. Resend Verification Email
`POST /auth/resend-verification`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**What to do:** Show "Check your email" message. Use when user tries to login but email not verified.

---

### 10. Change Password (Logged In)
`POST /auth/change-password`

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

**What to do:**
- User must be logged in (protected endpoint)
- Show form: current password + new password
- On success → Show success → Optionally logout and require re-login

**Errors:**
- `401: "Current password is incorrect"` → Wrong password
- `401: "Missing or invalid Authorization header"` → Not logged in

---

## User Roles

**Customer (`customer`):**
- Email verification REQUIRED before login
- Cannot login until email verified
- Access: Customer dashboard, make reservations

**Client Admin (`client_admin`):**
- Email auto-verified (can login immediately)
- Access: Admin dashboard, manage everything

**What to do:**
- After login → Check `user.role` → Redirect to appropriate dashboard
- Protect admin routes → Only allow `client_admin` role

---

## Important Use Cases

### Token Expires During App Usage
1. API request returns `401`
2. Call `/auth/refresh` with refresh_token
3. Get new tokens → Update stored tokens
4. Retry original request
5. If refresh fails → Logout user

### New Customer Signup Flow
1. Signup → Get `emailVerified: false`
2. Show "Check your email"
3. User clicks email link → Extract token from URL
4. Call `/auth/verify-email` with token
5. Show "Verified!" → User can now login

### Password Reset Flow
1. User enters email → `/auth/forgot-password`
2. User clicks email link → Extract token from URL hash
3. Show password reset form
4. Submit → `/auth/reset-password` with token + new password
5. Redirect to login

---

## Error Handling

**401 Unauthorized:**
- Check error message:
  - `"Invalid credentials"` → Wrong email/password
  - `"Please verify your email"` → Show verification UI
  - `"Invalid token"` → Try refresh token → If fails → Logout

**400 Bad Request:** Validation errors → Show message to user

**500 Internal Server Error:** Server error → Show generic error

---

## Security Notes

1. Store tokens securely (localStorage/sessionStorage/cookies)
2. Always use HTTPS in production
3. Never expose tokens in URLs (except email link hash)
4. Clear tokens on logout
5. Handle token expiration gracefully (auto-refresh)
6. Don't reveal if email exists (show generic messages)

---

## Quick Reference

| Endpoint | Method | Auth | Use Case |
|----------|--------|------|----------|
| `/auth/signup` | POST | ❌ | New user registration |
| `/auth/login` | POST | ❌ | User login |
| `/auth/me` | GET | ✅ | Check auth status |
| `/auth/logout` | POST | ✅ | User logout |
| `/auth/refresh` | POST | ❌ | Get new access token |
| `/auth/forgot-password` | POST | ❌ | Request password reset |
| `/auth/reset-password` | POST | ❌ | Reset password |
| `/auth/verify-email` | POST | ❌ | Verify email |
| `/auth/resend-verification` | POST | ❌ | Resend verification |
| `/auth/change-password` | POST | ✅ | Change password |

---

## Summary

**Backend does:** Authentication, token management, email verification

**You do:**
- Store tokens, send in headers
- Handle token expiration (refresh automatically)
- Extract tokens from email links (URL hash)
- Handle errors gracefully
- Check user roles and redirect accordingly

**Most important:** Implement refresh token logic or users get logged out every hour!
