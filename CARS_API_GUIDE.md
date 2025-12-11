# Cars Module API Documentation

## Overview

The Cars module handles vehicle inventory management. It supports multi-tenancy (each agency has isolated cars) and image uploads via Cloudflare R2 storage.

## API Endpoints

### 1. List Cars (Public)

**`GET /cars?tenantId={uuid}`**

Retrieves all cars for a specific tenant.

**Authentication:** Not required

**Query Parameters:**

- `tenantId` (required) - UUID of the tenant/agency
- `locationId` (optional) - Filter by location ID (for customer-facing: show cars at a specific branch)
- `category` (optional) - Filter by category (e.g. "SUV", "Sedan")
- `status` (optional) - Filter by status ("available", "rented", "maintenance")

**Success Response (200):**

```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "make": "Toyota",
    "model": "Camry",
    "year": 2024,
    "license_plate": "12345",
    "color": "Black",
    "category": "Sedan",
    "price_per_day": 50.00,
    "deposit_amount": 200.00,
    "transmission": "Automatic",
    "fuel_type": "Petrol",
    "seats": 5,
    "features": ["AC", "GPS"],
    "location_id": "uuid",
    "status": "available",
    "primary_image_url": "https://...",
    "gallery_urls": ["https://..."],
    "rental_count": 0,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### 2. Get Car by ID (Public)

**`GET /cars/:id`**

Retrieves a single car by ID.

**Authentication:** Not required

**Success Response (200):** Single car object (same structure as above).

---

### 3. Check Car Availability (Public)

**`GET /cars/:id/availability?startDate={ISO}&endDate={ISO}`**

Checks if a car is available for a specific date range.

**Authentication:** Not required

**Query Parameters:**

- `startDate` (required) - ISO date string
- `endDate` (required) - ISO date string

**Success Response (200):**

```json
{
  "carId": "uuid",
  "startDate": "2024-01-20T10:00:00Z",
  "endDate": "2024-01-25T10:00:00Z",
  "isAvailable": true,
  "conflictingReservations": []
}
```

---

### 4. Create Car (Admin)

**`POST /cars`**

Creates a new car with images.

**Authentication:** Required (Bearer Token - Admin only)

**Request Format:** `multipart/form-data`

**Form Fields:**

- `make` (string, required)
- `model` (string, required)
- `year` (integer, required)
- `licensePlate` (string, required)
- `category` (string, required)
- `pricePerDay` (number, required)
- `color` (string, optional)
- `depositAmount` (number, optional)
- `transmission` (string, optional) - "Automatic" or "Manual"
- `fuelType` (string, optional)
- `seats` (integer, optional)
- `features` (array of strings, optional)
- `locationId` (string, optional)
- `primaryImage` (file, optional) - Cover image
- `galleryImages` (files, optional) - Up to 10 gallery images

**Success Response (201):** Created car object.

---

### 5. Update Car (Admin)

**`PATCH /cars/:id`**

Updates an existing car.

**Authentication:** Required (Bearer Token - Admin only)

**Request Format:** `multipart/form-data` or `application/json`

**Success Response (200):** Updated car object.

---

### 6. Update Car Status (Admin)

**`PATCH /cars/:id/status`**

Quick status update for a car.

**Authentication:** Required (Bearer Token - Admin only)

**Request Body:**

```json
{
  "status": "maintenance"
}
```

**Valid Statuses:** `available`, `rented`, `maintenance`

**Success Response (200):** Updated car object.

---

### 7. Delete Car (Admin)

**`DELETE /cars/:id`**

Deletes a car.

**Authentication:** Required (Bearer Token - Admin only)

**Success Response (200):**

```json
{ "id": "deleted-car-uuid" }
```

---

## Image Upload Details

- **Storage:** Cloudflare R2
- **Primary Image Path:** `tenants/{tenant_id}/cars/primary/{uuid}-{filename}`
- **Gallery Path:** `tenants/{tenant_id}/cars/gallery/{uuid}-{filename}`

---

## Frontend Integration Example

```typescript
// List cars
const getCars = async (tenantId: string, locationId?: string) => {
  const url = locationId 
    ? `/cars?tenantId=${tenantId}&locationId=${locationId}`
    : `/cars?tenantId=${tenantId}`;
  const response = await fetch(url);
  return response.json();
};

// Check availability
const checkAvailability = async (carId: string, startDate: string, endDate: string) => {
  const response = await fetch(`/cars/${carId}/availability?startDate=${startDate}&endDate=${endDate}`);
  return response.json();
};

// Create car (with images)
const createCar = async (formData: FormData, token: string) => {
  const response = await fetch('/cars', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return response.json();
};

// Quick status update
const updateCarStatus = async (carId: string, status: string, token: string) => {
  const response = await fetch(`/cars/${carId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  return response.json();
};
```
