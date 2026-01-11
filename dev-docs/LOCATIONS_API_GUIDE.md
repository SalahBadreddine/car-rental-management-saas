# Locations Module Documentation

## Overview
The Locations module handles CRUD operations for agency branch locations (e.g., "Oran Airport", "Algiers Downtown"). It supports multi-tenancy (each client agency has isolated locations) and image uploads via Cloudflare R2 storage.

## API Endpoints

### 1. Create Location (Admin Only)
**`POST /locations`**

Creates a new location with an uploaded image.

**Authentication:** Required (Bearer Token - Admin only)

**Request Format:** `multipart/form-data`

**Form Fields:**
- `name` (string, required) - Location name (e.g., "Oran Airport")
- `city` (string, required) - City name (e.g., "Oran")
- `address` (string, optional) - Full address
- `file` (file, required) - Image file (JPG, PNG, etc.)

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Example Request (Postman/Form Data):**
```
name: Oran Airport
city: Oran
address: Parking B, Terminal 1
file: [Select Image File]
```

**Success Response (201):**
```json
{
  "id": "2db2fd50-2b8e-4037-84e9-8d5bc28f1d2f",
  "tenant_id": "33333333-3333-3333-3333-333333333333",
  "name": "Oran Airport",
  "city": "Oran",
  "address": "Parking B, Terminal 1",
  "image_url": "https://cdn.example.com/tenants/33333333-3333-3333-3333-333333333333/locations/uuid-file.jpg"
}
```

**Error Responses:**
- `400 Bad Request` - Missing tenant context (user has no tenant_id)
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Upload or database error

---

### 2. List Locations (Public)
**`GET /locations?tenantId={uuid}`**

Retrieves all locations for a specific tenant, ordered by name.

**Authentication:** Not required (Public endpoint)

**Query Parameters:**
- `tenantId` (string, required) - UUID of the tenant/agency

**Example Request:**
```
GET /locations?tenantId=33333333-3333-3333-3333-333333333333
```

**Success Response (200):**
```json
[
  {
    "id": "2db2fd50-2b8e-4037-84e9-8d5bc28f1d2f",
    "tenant_id": "33333333-3333-3333-3333-333333333333",
    "name": "Oran Airport",
    "city": "Oran",
    "address": "Parking B, Terminal 1",
    "image_url": "https://cdn.example.com/tenants/33333333-3333-3333-3333-333333333333/locations/uuid-file.jpg"
  },
  {
    "id": "abc123...",
    "tenant_id": "33333333-3333-3333-3333-333333333333",
    "name": "Algiers Downtown",
    "city": "Algiers",
    "address": "123 Main Street",
    "image_url": "https://cdn.example.com/..."
  }
]
```

**Error Responses:**
- `400 Bad Request` - Missing tenantId query parameter
- `500 Internal Server Error` - Database error

---

### 3. Delete Location (Admin Only)
**`DELETE /locations/:id`**

Deletes a location. Only locations belonging to the authenticated user's tenant can be deleted.

**Authentication:** Required (Bearer Token - Admin only)

**URL Parameters:**
- `id` (string, required) - UUID of the location to delete

**Headers:**
```
Authorization: Bearer <access_token>
```

**Example Request:**
```
DELETE /locations/2db2fd50-2b8e-4037-84e9-8d5bc28f1d2f
```

**Success Response (200):**
```json
{
  "id": "2db2fd50-2b8e-4037-84e9-8d5bc28f1d2f"
}
```

**Error Responses:**
- `400 Bad Request` - Missing tenant context
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Location not found or database error

---

## Multi-Tenancy

**Important:** All locations are isolated by `tenant_id`. 

- **Write Operations (Create/Delete):** The backend automatically uses the `tenant_id` from the authenticated user's JWT token. Users can only create/delete locations for their own tenant.
- **Read Operations (List):** The frontend must provide the `tenantId` as a query parameter. This allows public browsing of locations (e.g., customers viewing available branches).

**Security Note:** Even if a user tries to delete a location from another tenant, the backend will reject it because the service filters by `tenant_id`.

---

## Image Upload Details

- **Storage:** Cloudflare R2
- **Path Structure:** `tenants/{tenant_id}/locations/{uuid}-{original_filename}`
- **Return Value:** Full public URL in `image_url` field
- **File Requirements:** 
  - Must be a valid image file
  - No explicit size limit (backend handles it)
  - Supported formats: JPG, PNG, etc. (standard image types)

---

## Frontend Integration Examples

### React/TypeScript Example

```typescript
// Create Location
const createLocation = async (formData: FormData, token: string) => {
  const response = await fetch('http://localhost:3000/locations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData // FormData with name, city, address, file
  });
  return response.json();
};

// List Locations
const getLocations = async (tenantId: string) => {
  const response = await fetch(
    `http://localhost:3000/locations?tenantId=${tenantId}`
  );
  return response.json();
};

// Delete Location
const deleteLocation = async (locationId: string, token: string) => {
  const response = await fetch(
    `http://localhost:3000/locations/${locationId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.json();
};
```

### FormData Example (Create Location)

```typescript
const formData = new FormData();
formData.append('name', 'Oran Airport');
formData.append('city', 'Oran');
formData.append('address', 'Parking B, Terminal 1');
formData.append('file', imageFile); // File object from input[type="file"]

await createLocation(formData, accessToken);
```

---

## Database Schema Reference

```sql
create table public.locations (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  name text not null,
  city text not null,
  address text,
  image_url text
);
```

---

## Notes for Frontend Developers

1. **Image Upload:** Always use `multipart/form-data` for POST requests (not JSON). The `file` field is required.
2. **Tenant ID:** For listing locations, you can get the `tenant_id` from the user's profile after login (`user.tenant_id`).
3. **Error Handling:** Check for `400` (validation/tenant errors) and `401` (auth errors) separately.
4. **Public vs Protected:** Only `GET /locations` is public. All other endpoints require authentication.
5. **Ordering:** Locations are automatically ordered by `name` (ascending) in the list response.

