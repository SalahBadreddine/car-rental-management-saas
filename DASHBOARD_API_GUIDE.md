# Dashboard Module API Documentation

## Overview

The Dashboard module provides aggregated statistics for agency admins to monitor their business performance.

## API Endpoints

### 1. Get Dashboard Stats (Admin)

**`GET /dashboard/stats`**

Returns aggregated statistics for the admin's tenant.

**Authentication:** Required (Bearer Token - Admin only)

**Success Response (200):**

```json
{
  "totalCars": 15,
  "availableCars": 10,
  "totalReservations": 42,
  "pendingReservations": 5,
  "totalRevenue": 12500.00,
  "recentReservations": [
    {
      "id": "uuid",
      "status": "pending",
      "total_price": 250.00,
      "created_at": "2024-01-15T10:30:00Z",
      "cars": {
        "make": "Toyota",
        "model": "Camry"
      },
      "profiles": {
        "full_name": "John Doe"
      }
    }
  ]
}
```

**Response Fields:**

| Field | Description |
|-------|-------------|
| `totalCars` | Total number of cars in the fleet |
| `availableCars` | Cars with status "available" |
| `totalReservations` | All-time reservations count |
| `pendingReservations` | Reservations awaiting confirmation |
| `totalRevenue` | Sum of completed reservation amounts |
| `recentReservations` | Last 5 reservations |

---

## Frontend Integration Example

```typescript
// Get dashboard stats
const getDashboardStats = async (token: string) => {
  const response = await fetch('/dashboard/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
```
