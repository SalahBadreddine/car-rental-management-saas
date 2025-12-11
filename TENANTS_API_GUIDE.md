# Tenants Module Documentation

## Overview
The Tenants module handles SaaS multi-tenancy by identifying agencies based on URL slugs and allowing agency owners to manage their tenant settings. It provides both public endpoints (for customer portal identification) and protected admin endpoints (for agency management).

## API Endpoints

### 1. Get Tenant by Slug (Public)
**`GET /tenants/by-slug/:slug`**

Retrieves public tenant information based on the URL slug. This is the first API call when a user visits a tenant's subdomain/path (e.g., `localhost:3000/luxe-cars`).

**Authentication:** Not required (Public endpoint)

**URL Parameters:**
- `slug` (string, required) - The tenant's unique slug identifier (e.g., "luxe-cars")

**Example Request:**
```
GET /tenants/by-slug/luxe-cars
```

**Success Response (200):**
```json
{
  "id": "33333333-3333-3333-3333-333333333333",
  "name": "Luxe Cars Oran",
  "slug": "luxe-cars",
  "logo_url": "https://cdn.example.com/tenants/33333333-3333-3333-3333-333333333333/branding/logo.png",
  "contact_email": "contact@luxecars.com",
  "phone_number": "+213555001122"
}
```

**Note:** This endpoint returns only public fields. The `subscription_status` field is excluded for security.

**Error Responses:**
- `404 Not Found` - Tenant with the specified slug does not exist
- `500 Internal Server Error` - Database error

---

### 2. Initialize Tenant (New Admin)
**`POST /tenants`**

Criteria a new tenant for a newly registered admin user. This also links the admin user to the created tenant.

**Authentication:** Required (Bearer Token)

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "My Rental Co",
  "slug": "my-rentals",
  "contactEmail": "admin@example.com",
  "phoneNumber": "1234567890" // Optional
}
```

**Success Response (201):**
```json
{
  "id": "new-tenant-uuid",
  "name": "My Rental Co",
  "slug": "my-rentals",
  "contact_email": "admin@example.com",
  "phone_number": "1234567890",
  "logo_url": null,
  "subscription_status": "active"
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `500 Internal Server Error` - Slug already exists or database error

---

---

### 3. List All Tenants (Admin)
**`GET /tenants`**

Retrieves a list of all tenants. Useful for super-admins or directory listing.

**Authentication:** Required (Bearer Token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
[
  {
    "id": "tenant-uuid-1",
    "name": "Luxe Cars Oran",
    "slug": "luxe-cars",
    "logo_url": "...",
    "contact_email": "...",
    "phone_number": "..."
  },
  {
    "id": "tenant-uuid-2",
    "name": "Another Rental",
    "slug": "another-rental",
    ...
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Invalid token
- `500 Internal Server Error` - Database error

---

### 4. Get My Tenant (Admin)
**`GET /tenants/me`**

Retrieves the complete tenant information for the authenticated agency owner, including private fields like `subscription_status`.

**Authentication:** Required (Bearer Token - Admin only)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Example Request:**
```
GET /tenants/me
```

**Success Response (200):**
```json
{
  "id": "33333333-3333-3333-3333-333333333333",
  "created_at": "2024-01-15T10:30:00Z",
  "name": "Luxe Cars Oran",
  "slug": "luxe-cars",
  "contact_email": "contact@luxecars.com",
  "phone_number": "+213555001122",
  "logo_url": "https://cdn.example.com/tenants/33333333-3333-3333-3333-333333333333/branding/logo.png",
  "subscription_status": "active"
}
```

**Error Responses:**
- `400 Bad Request` - User does not have a tenant associated
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Tenant not found (shouldn't happen if user has tenant_id)
- `500 Internal Server Error` - Database error

---

### 3. Update My Tenant (Admin)
**`PATCH /tenants/me`**

Updates the authenticated agency owner's tenant settings. Only provided fields will be updated. Logo can be uploaded as a file, which will be automatically stored in R2.

**Authentication:** Required (Bearer Token - Admin only)

**Request Format:** `multipart/form-data` (if uploading logo) or `application/json` (if only updating text fields)

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data (or application/json)
```

**Form Fields (multipart/form-data):**
- `name` (string, optional) - Agency name
- `slug` (string, optional) - URL identifier (must be unique)
- `contactEmail` (string, optional, email format) - Contact email address
- `phoneNumber` (string, optional) - Phone number
- `file` (file, optional) - Logo image file (JPG, PNG, etc.) - If provided, will be uploaded to R2 and `logoUrl` will be set automatically

**JSON Body (application/json - if not uploading logo):**
```json
{
  "name": "Luxe Cars Oran Updated",
  "slug": "luxe-cars-updated",
  "contactEmail": "newemail@luxecars.com",
  "phoneNumber": "+213555999999"
}
```

**Note:** If you upload a `file`, the backend will automatically:
1. Upload it to R2 at `tenants/{tenant_id}/branding/{uuid-filename}`
2. Set the `logoUrl` field with the returned public URL
3. You don't need to provide `logoUrl` manually when uploading a file

**Example Request (with logo upload):**
```
PATCH /tenants/me
Body: form-data
  - name: Luxe Cars Oran Updated
  - slug: luxe-cars-updated
  - contactEmail: newemail@luxecars.com
  - phoneNumber: +213555999999
  - file: [Select Logo Image File]
```

**Example Request (text fields only):**
```
PATCH /tenants/me
Body: application/json
{
  "name": "Luxe Cars Oran Updated",
  "contactEmail": "newemail@luxecars.com",
  "phoneNumber": "+213555999999"
}
```

**Success Response (200):**
```json
{
  "id": "33333333-3333-3333-3333-333333333333",
  "created_at": "2024-01-15T10:30:00Z",
  "name": "Luxe Cars Oran Updated",
  "slug": "luxe-cars",
  "contact_email": "newemail@luxecars.com",
  "phone_number": "+213555999999",
  "logo_url": "https://cdn.example.com/tenants/33333333-3333-3333-3333-333333333333/branding/new-logo.png",
  "subscription_status": "active"
}
```

**Error Responses:**
- `400 Bad Request` - User does not have a tenant associated, or validation error
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Tenant not found
- `500 Internal Server Error` - Database error

---

## Multi-Tenancy Flow

### Customer Portal Flow
1. User visits `localhost:3000/luxe-cars` (or tenant subdomain)
2. Frontend extracts slug from URL (`luxe-cars`)
3. Frontend calls `GET /tenants/by-slug/luxe-cars`
4. Backend returns tenant info (name, logo, contact details)
5. Frontend displays tenant branding and uses `tenant_id` for subsequent API calls

### Admin Dashboard Flow
1. Admin logs in and receives `access_token` + `user.tenant_id`
2. Admin dashboard calls `GET /tenants/me` to load current settings
3. Admin can update settings via `PATCH /tenants/me`
4. Changes are immediately reflected in the tenant profile

---

## Frontend Integration Examples

### React/TypeScript Example

```typescript
// Get tenant by slug (Public - Customer Portal)
const getTenantBySlug = async (slug: string) => {
  const response = await fetch(`http://localhost:3000/tenants/by-slug/${slug}`);
  if (!response.ok) {
    throw new Error('Tenant not found');
  }
  return response.json();
};

// Get my tenant (Admin)
const getMyTenant = async (token: string) => {
  const response = await fetch('http://localhost:3000/tenants/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch tenant');
  }
  return response.json();
};

// Update my tenant (Admin) - With logo file upload
const updateMyTenant = async (
  token: string,
  updates: {
    name?: string;
    contactEmail?: string;
    phoneNumber?: string;
  },
  logoFile?: File
) => {
  const formData = new FormData();
  
  if (updates.name) formData.append('name', updates.name);
  if (updates.contactEmail) formData.append('contactEmail', updates.contactEmail);
  if (updates.phoneNumber) formData.append('phoneNumber', updates.phoneNumber);
  if (logoFile) formData.append('file', logoFile);

  const response = await fetch('http://localhost:3000/tenants/me', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type header - browser will set it with boundary for FormData
    },
    body: formData
  });
  if (!response.ok) {
    throw new Error('Failed to update tenant');
  }
  return response.json();
};

// Update my tenant (Admin) - Text fields only (no logo)
const updateMyTenantTextOnly = async (
  token: string,
  updates: {
    name?: string;
    contactEmail?: string;
    phoneNumber?: string;
  }
) => {
  const response = await fetch('http://localhost:3000/tenants/me', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  if (!response.ok) {
    throw new Error('Failed to update tenant');
  }
  return response.json();
};
```

### Usage in Customer Portal

```typescript
// Extract slug from URL
const slug = window.location.pathname.split('/')[1]; // e.g., "luxe-cars"

// Fetch tenant info on page load
useEffect(() => {
  getTenantBySlug(slug)
    .then(tenant => {
      setTenantName(tenant.name);
      setTenantLogo(tenant.logo_url);
      setTenantId(tenant.id); // Use for subsequent API calls
    })
    .catch(error => {
      console.error('Tenant not found:', error);
      // Redirect to 404 or default page
    });
}, [slug]);
```

### Usage in Admin Dashboard

```typescript
// Load tenant settings
useEffect(() => {
  getMyTenant(accessToken)
    .then(tenant => {
      setFormData({
        name: tenant.name,
        contactEmail: tenant.contact_email,
        phoneNumber: tenant.phone_number,
        logoUrl: tenant.logo_url
      });
    })
    .catch(error => {
      console.error('Failed to load tenant:', error);
    });
}, [accessToken]);

// Update tenant settings
const handleSave = async (logoFile?: File) => {
  try {
    const updated = await updateMyTenant(
      accessToken,
      {
        name: formData.name,
        contactEmail: formData.contactEmail,
        phoneNumber: formData.phoneNumber
      },
      logoFile // Pass the file if user selected a new logo
    );
    console.log('Tenant updated:', updated);
    // Update formData.logoUrl with the returned logo_url if logo was uploaded
    if (logoFile && updated.logo_url) {
      setFormData(prev => ({ ...prev, logoUrl: updated.logo_url }));
    }
  } catch (error) {
    console.error('Update failed:', error);
  }
};
```

---

## Database Schema Reference

```sql
create table public.tenants (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  name text not null,
  slug text unique not null,
  contact_email text,
  phone_number text,
  logo_url text,
  subscription_status text default 'active'
);
```

---

## Notes for Frontend Developers

1. **Slug Extraction:** The slug is typically extracted from the URL path or subdomain. Ensure proper URL parsing to handle edge cases.

2. **Logo Upload:** When updating the logo:
   - Use `multipart/form-data` format for the `PATCH /tenants/me` request
   - Include the logo file in the `file` field
   - The backend will automatically upload it to R2 at `tenants/{tenant_id}/branding/`
   - The returned response will include the new `logo_url`
   - You don't need to manually provide `logoUrl` when uploading a file

3. **Tenant ID:** Once you have the tenant ID (from `/by-slug/:slug` or `/me`), use it for:
   - Filtering locations: `GET /locations?tenantId={tenant_id}`
   - Other tenant-scoped API calls

4. **Error Handling:** Always handle 404 errors gracefully, as slugs may not exist. Consider showing a "Tenant not found" page.

5. **Caching:** Consider caching tenant info (by slug) to reduce API calls, especially for the public endpoint.

6. **Subscription Status:** The `subscription_status` field is only available via `/tenants/me` (admin endpoint). Use it to check if the tenant's subscription is active before allowing certain operations.

---

## Security Notes

- **Public Endpoint (`/by-slug/:slug`):** Returns only public fields. Never expose `subscription_status` or other sensitive data.
- **Admin Endpoints (`/me`):** Require authentication. Users can only access/update their own tenant (enforced via `user.tenant_id`).
- **Slug Uniqueness:** Slugs are unique in the database. If a slug doesn't exist, the tenant hasn't been created yet.

