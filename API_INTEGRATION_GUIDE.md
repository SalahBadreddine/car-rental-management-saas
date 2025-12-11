# 🚀 Backend API Integration Guide

This guide provides a comprehensive overview of how to integrate with the Car Rental Management System (CRMS) backend. It consolidates information from individual module guides into a single reference for frontend developers.

## 🌍 Base Configuration

- **Base URL**: `http://localhost:3000`
- **Global Headers**:
  - `Content-Type`: `application/json` (unless uploading files)
  - `Authorization`: `Bearer <access_token>` (for protected endpoints)

---

## 🔐 Authentication Module

The authentication system uses JWTs (Access & Refresh Tokens).

### Key Concepts
- **Access Token**: Short-lived (1 hour). Used for API requests.
- **Refresh Token**: Long-lived (7 days). Used to get new access tokens.
- **User Roles**: `customer` (end-users) and `client_admin` (agency owners).

### Core Endpoints

| Action | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Signup** | `POST` | `/auth/signup` | ❌ | Register a new user. Customers need email verification. |
| **Login** | `POST` | `/auth/login` | ❌ | Returns `access_token`, `refresh_token`, and `user` object. |
| **Get Profile** | `GET` | `/auth/me` | ✅ | Get current user details. |
| **Refresh Token** | `POST` | `/auth/refresh` | ❌ | Send `refresh_token` to get new tokens. **Critical for session maintenance.** |
| **Logout** | `POST` | `/auth/logout` | ✅ | Invalidate tokens. |

### Password & Email Flows
- **Forgot Password**: `POST /auth/forgot-password` (sends email)
- **Reset Password**: `POST /auth/reset-password` (requires token from email)
- **Verify Email**: `POST /auth/verify-email` (requires token from email)
- **Resend Verification**: `POST /auth/resend-verification`

> **💡 Tip:** Always check for `401 Unauthorized`. If encountered, try to refresh the token using `/auth/refresh`. If that fails, log the user out.

---

## 🏢 Tenants Module (Multi-Tenancy)

The system is multi-tenant. Agencies are identified by a unique **slug** (e.g., `/luxe-cars`).

### Public Flow (Customer Portal)
1. **Extract Slug**: Get the slug from the URL (e.g., `luxe-cars`).
2. **Fetch Tenant**: Call `GET /tenants/by-slug/:slug`.
3. **Store Info**: Save `tenant_id` and branding info (logo, name) for the session.

### Admin Flow (Dashboard)
1. **Login**: Admin logs in.
2. **Fetch My Tenant**: Call `GET /tenants/me` (Protected).
3. **Update Settings**: Call `PATCH /tenants/me` to update name, contact info, or upload a logo.

### Endpoints

| Action | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Get by Slug** | `GET` | `/tenants/by-slug/:slug` | ❌ | Public info for customer portal. |
| **Get My Tenant** | `GET` | `/tenants/me` | ✅ | Full info for admin dashboard. |
| **Update Tenant** | `PATCH` | `/tenants/me` | ✅ | Update details. Use `multipart/form-data` for logo upload. |

---

## 📍 Locations Module

Manage agency branches (e.g., "Airport Branch", "Downtown Office").

### Key Notes
- **Isolation**: Locations are strictly isolated by `tenant_id`.
- **Public Access**: Customers can list locations for a specific tenant.
- **Admin Access**: Admins can create/delete locations for their tenant.

### Endpoints

| Action | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **List Locations** | `GET` | `/locations?tenantId={uuid}` | ❌ | List all locations for a tenant. |
| **Create Location** | `POST` | `/locations` | ✅ | Create a new location. Requires `multipart/form-data` for image. |
| **Delete Location** | `DELETE` | `/locations/:id` | ✅ | Remove a location. |

### Creating a Location (Example)
Use `FormData` to send the request:
```javascript
const formData = new FormData();
formData.append('name', 'Oran Airport');
formData.append('city', 'Oran');
formData.append('address', 'Terminal 1');
formData.append('file', imageFile); // File object

await fetch('/locations', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }, // Do NOT set Content-Type manually
  body: formData
});
```

---

## ☁️ Storage (Cloudflare R2)

File uploads (images, logos) are handled automatically by the respective modules (`tenants`, `locations`).

- **Mechanism**: Files are uploaded directly to Cloudflare R2 via the backend.
- **Structure**: Files are organized by tenant: `tenants/{tenant_id}/{entity}/{filename}`.
- **Response**: API responses include the full public URL (e.g., `logo_url`, `image_url`).

---

## 🚗 Cars Module

> **🚧 Status**: Under Development
>
> The Cars module is currently being set up. It will handle vehicle inventory, availability, and specifications.
>
> **Planned Features**:
> - List cars by tenant
> - Filter by category, price, transmission
> - Car details page
> - Admin: Add/Edit/Delete cars with image galleries

---

## 🛠️ General Best Practices

1. **Error Handling**:
   - `400`: Validation error (check your payload).
   - `401`: Auth error (refresh token or login again).
   - `404`: Resource not found (check IDs/Slugs).
   - `500`: Server error (retry or contact support).

2. **Image Uploads**:
   - Always use `multipart/form-data`.
   - The `file` field is standard for single file uploads.

3. **Tenant Context**:
   - For public pages, always ensure you have the correct `tenantId` (from the slug lookup) before making other requests (like listing locations).
