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

---

## 🚗 Cars Module

Manage vehicle inventory with image uploads, filtering, and availability checks.

### Key Notes

- **Public Access**: List cars, view details, check availability.
- **Admin Access**: Full CRUD operations, status updates.
- **Images**: Primary image + gallery (up to 10 images) stored in Cloudflare R2.

### Endpoints

| Action | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **List Cars** | `GET` | `/cars?tenantId={uuid}` | ❌ | List cars. Filters: `locationId`, `category`, `status`. |
| **Get Car** | `GET` | `/cars/:id` | ❌ | Single car details. |
| **Check Availability** | `GET` | `/cars/:id/availability?startDate=&endDate=` | ❌ | Check if car is available for date range. |
| **Create Car** | `POST` | `/cars` | ✅ | Create car with images (`multipart/form-data`). |
| **Update Car** | `PATCH` | `/cars/:id` | ✅ | Update car details. |
| **Update Status** | `PATCH` | `/cars/:id/status` | ✅ | Quick status change (`available`, `rented`, `maintenance`). |
| **Delete Car** | `DELETE` | `/cars/:id` | ✅ | Remove a car. |

> **📖 Full Documentation:** See [CARS_API_GUIDE.md](./CARS_API_GUIDE.md)

---

## 📅 Reservations Module

Handle customer bookings with auto-pricing and status management.

### Key Notes

- **Customer Flow**: Create reservations, view own bookings.
- **Admin Flow**: View all tenant reservations, update status, cancel.
- **Auto-Pricing**: If `totalPrice` is omitted, it's calculated as `days × price_per_day`.

### Endpoints

| Action | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Create Reservation** | `POST` | `/reservations` | ✅ | Customer creates a booking. |
| **List Reservations** | `GET` | `/reservations` | ✅ | Admin: all tenant reservations. Customer: own only. |
| **Get Reservation** | `GET` | `/reservations/:id` | ✅ | Single reservation with car/customer details. |
| **Update Status** | `PATCH` | `/reservations/:id/status` | ✅ (Admin) | Change status (`pending`, `confirmed`, `cancelled`, `completed`). |
| **Cancel Reservation** | `DELETE` | `/reservations/:id` | ✅ (Admin) | Permanently delete a reservation. |

> **📖 Full Documentation:** See [RESERVATIONS_API_GUIDE.md](./RESERVATIONS_API_GUIDE.md)

---

## 📊 Dashboard Module

Aggregated statistics for agency admins.

### Endpoints

| Action | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Get Stats** | `GET` | `/dashboard/stats` | ✅ (Admin) | Returns totals, revenue, and recent reservations. |

> **📖 Full Documentation:** See [DASHBOARD_API_GUIDE.md](./DASHBOARD_API_GUIDE.md)

---

## ☁️ Storage (Cloudflare R2)

File uploads (images, logos) are handled automatically by the respective modules.

- **Mechanism**: Files are uploaded directly to Cloudflare R2 via the backend.
- **Structure**: Files are organized by tenant: `tenants/{tenant_id}/{entity}/{filename}`.
- **Response**: API responses include the full public URL (e.g., `logo_url`, `image_url`).

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
   - For cars: use `primaryImage` and `galleryImages` fields.

3. **Tenant Context**:
   - For public pages, always ensure you have the correct `tenantId` (from the slug lookup) before making other requests.
   - Admin endpoints automatically use `tenant_id` from the JWT token.
