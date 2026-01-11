# 🔄 Auto-Refresh Token Guide

## Overview

The frontend now has **automatic token refresh** built into the `apiRequest` function. When your access token expires (after 1 hour), the system automatically:

1. Detects the 401 error
2. Calls `/auth/refresh` to get new tokens
3. Retries the original request
4. **Users stay logged in!** ✅

## How to Use apiRequest

### Import
```typescript
import { apiRequest } from "@/lib/api";
```

### GET Request (Protected)
```typescript
const { status, data } = await apiRequest("/tenants/me", "GET");

if (status === 200) {
  console.log("Tenant data:", data);
}
```

### POST Request (Protected)
```typescript
const { status, data } = await apiRequest(
  "/locations",
  "POST",
  {
    name: "Oran Airport",
    city: "Oran",
    address: "Terminal 1"
  }
);

if (status === 201) {
  console.log("Location created:", data);
}
```

### Custom Headers
```typescript
const { status, data } = await apiRequest(
  "/some-endpoint",
  "GET",
  undefined, // no body
  { "x-custom-header": "value" }
);
```

## What Happens Behind the Scenes

```
User makes request
    ↓
apiRequest attaches access_token from localStorage
    ↓
[If 200-299] → Return response ✅
    ↓
[If 401] → Token expired!
    ↓
Call /auth/refresh with refresh_token
    ↓
[If refresh succeeds] → Save new tokens → Retry original request ✅
    ↓
[If refresh fails] → Logout user → Redirect to /signin
```

## Important Notes

### ⚠️ Don't Use Raw `fetch()` for Protected Routes

**❌ WRONG:**
```typescript
// This bypasses auto-refresh!
const res = await fetch("http://localhost:3000/tenants/me", {
  headers: { Authorization: `Bearer ${token}` }
});
```

**✅ CORRECT:**
```typescript
const { status, data } = await apiRequest("/tenants/me", "GET");
```

### Public Endpoints (No Token Required)

For public endpoints like `/auth/login` or `/auth/signup`, you can still use raw `fetch()` since they don't need authentication. But using `apiRequest` also works.

## File Uploads (FormData)

For file uploads, you still need to use raw `fetch()` because you can't set `Content-Type` to `multipart/form-data` (the browser does it automatically). But you should manually attach the token:

```typescript
import { getAccessToken } from "@/lib/auth";

const formData = new FormData();
formData.append('name', 'Oran Airport');
formData.append('file', imageFile);

const token = getAccessToken();
const res = await fetch("http://localhost:3000/locations", {
  method: "POST",
  headers: { 
    Authorization: `Bearer ${token}` 
  },
  body: formData
});

// If you get 401, call refreshToken() manually and retry
```

## Summary

- ✅ Use `apiRequest()` for all protected JSON API calls
- ✅ Tokens refresh automatically on 401
- ✅ Users stay logged in for 7 days (refresh token lifetime)
- ❌ Don't use raw `fetch()` for protected routes (bypasses auto-refresh)
