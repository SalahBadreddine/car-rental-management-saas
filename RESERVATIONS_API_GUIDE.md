# Reservations Module API Documentation

## Overview

The Reservations module handles booking management. Customers can create reservations, and admins can view/manage all reservations for their tenant.

## API Endpoints

### 1. Create Reservation (Customer)

**`POST /reservations`**

Creates a new reservation.

**Authentication:** Required (Bearer Token)

**Request Body:**

```json
{
  "carId": "uuid-of-the-car",
  "startDate": "2024-01-20T10:00:00Z",
  "endDate": "2024-01-25T10:00:00Z",
  "totalPrice": 250.00
}
```

> **Note:** `totalPrice` is optional. If omitted, it will be auto-calculated as `days × price_per_day`.

**Business Logic:**

- Verifies the car exists and is available
- Validates that `endDate` is after `startDate`
- Auto-calculates `totalPrice` if not provided

**Success Response (201):**

```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "car_id": "uuid",
  "customer_id": "uuid",
  "start_date": "2024-01-20T10:00:00Z",
  "end_date": "2024-01-25T10:00:00Z",
  "total_price": 250.00,
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 2. List Reservations

**`GET /reservations`**

Returns reservations based on user role:

- **Admin (`client_admin`)**: All reservations for the tenant
- **Customer**: Only their own reservations

**Authentication:** Required (Bearer Token)

**Success Response (200):**

```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "car_id": "uuid",
    "customer_id": "uuid",
    "start_date": "2024-01-20T10:00:00Z",
    "end_date": "2024-01-25T10:00:00Z",
    "total_price": 250.00,
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z",
    "cars": {
      "id": "uuid",
      "make": "Toyota",
      "model": "Camry",
      "year": 2024,
      "primary_image_url": "https://..."
    },
    "profiles": {
      "id": "uuid",
      "full_name": "John Doe",
      "phone_number": "+213555123456"
    }
  }
]
```

---

### 3. Get Reservation Details

**`GET /reservations/:id`**

Retrieves a single reservation by ID with full details.

**Authentication:** Required (Bearer Token)

**Success Response (200):** Single reservation object with joined car and customer data.

---

### 4. Update Reservation Status (Admin)

**`PATCH /reservations/:id/status`**

Updates the status of a reservation.

**Authentication:** Required (Bearer Token - Admin only)

**Request Body:**

```json
{
  "status": "confirmed"
}
```

**Valid Statuses:** `pending`, `confirmed`, `cancelled`, `completed`

**Success Response (200):** Updated reservation object.

---

### 5. Cancel/Delete Reservation (Admin)

**`DELETE /reservations/:id`**

Permanently deletes a reservation.

**Authentication:** Required (Bearer Token - Admin only)

**Success Response (200):**

```json
{
  "id": "deleted-reservation-uuid",
  "message": "Reservation cancelled successfully"
}
```

---

## Reservation Statuses

| Status | Description |
|--------|-------------|
| `pending` | New reservation, awaiting admin confirmation |
| `confirmed` | Reservation confirmed by admin |
| `cancelled` | Reservation cancelled |
| `completed` | Rental period finished |

---

## Frontend Integration Example

```typescript
// Create reservation
const createReservation = async (data: CreateReservationDto, token: string) => {
  const response = await fetch('/reservations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

// List reservations
const getReservations = async (token: string) => {
  const response = await fetch('/reservations', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

// Get single reservation
const getReservation = async (id: string, token: string) => {
  const response = await fetch(`/reservations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

// Update status (Admin)
const updateStatus = async (id: string, status: string, token: string) => {
  const response = await fetch(`/reservations/${id}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  return response.json();
};

// Cancel reservation (Admin)
const cancelReservation = async (id: string, token: string) => {
  const response = await fetch(`/reservations/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
```
