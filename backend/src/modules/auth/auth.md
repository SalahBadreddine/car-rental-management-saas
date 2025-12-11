# Authentication System Documentation

## Overview
This project uses **Supabase Auth** for user management and authentication, integrated into a **NestJS** backend.

## How Authentication Works

The authentication flow follows a standard **JWT (JSON Web Token)** pattern:

1.  **Signup**: The user sends their details (email, password, etc.) to the backend. The backend creates the user in Supabase and a corresponding profile in the database.
2.  **Login**: The user sends their credentials. If valid, Supabase returns an `access_token` (JWT).
3.  **Authenticated Requests**: For any future request to a protected route (e.g., "Create Reservation"), the client must send this token in the `Authorization` header:
    ```
    Authorization: Bearer <your_access_token>
    ```
4.  **Validation**: The backend verifies the token before processing the request.

## Project Structure & Components

### 1. AuthService (`auth.service.ts`)
Handles the direct communication with Supabase.
*   `signup()`: Creates a user and a profile row.
*   `login()`: Authenticates credentials and returns the token + user profile (role, tenant_id).
*   `getUser(token)`: Verifies a token and retrieves the full user profile.

### 2. AuthController (`auth.controller.ts`)
Exposes the API endpoints:
*   `POST /auth/signup`: Register a new user.
*   `POST /auth/login`: Log in and get a token.
*   `GET /auth/me`: (Protected) Get the current user's profile.

### 3. JwtAuthGuard (`../../common/guards/jwt-auth.guard.ts`)
**"The Security Guard"**
*   This is a NestJS Guard used to protect routes.
*   It intercepts requests and checks for the `Authorization` header.
*   It calls `AuthService.getUser()` to validate the token.
*   If valid, it attaches the user object to the request (`request.user`).
*   If invalid, it throws a `401 Unauthorized` error.

**Usage:**
```typescript
@UseGuards(JwtAuthGuard)
@Get('protected-route')
```

### 4. CurrentUser Decorator (`../../common/decorators/current-user.decorator.ts`)
**"The Helper"**
*   A custom parameter decorator to make code cleaner.
*   Instead of extracting the user from the request object manually, you can just use this decorator in your controller.

**Usage:**
```typescript
getProfile(@CurrentUser() user: any) {
  return user;
}
```

## Recent Implementation (What was just added)

We recently enhanced the security infrastructure by adding the **Guard** and **Decorator** pattern:

1.  **Implemented `JwtAuthGuard`**:
    *   We moved from open access to secured access.
    *   The guard ensures that only users with a valid Supabase token can access specific endpoints.

2.  **Implemented `@CurrentUser`**:
    *   Simplifies developer experience by automatically injecting the authenticated user's data into controller methods.

3.  **Added `/auth/me` Endpoint**:
    *   A proof-of-concept protected route.
    *   It demonstrates how to use the Guard and Decorator together to retrieve the currently logged-in user's information securely.

## How the Frontend Should Use Login and Logout

### Login Flow
1. User submits email and password to `POST /auth/login`.
2. Backend responds with `{ access_token, refresh_token, user }`.
3. Frontend saves `access_token` (usually in localStorage or a cookie).
4. For all future API requests, frontend sets the header:
   ```
   Authorization: Bearer <access_token>
   ```
5. To check if the token is valid (e.g., on page load), frontend calls `GET /auth/me` with the token in the header.
6. If `/auth/me` returns user data, the user is authenticated. If it returns 401, the token is invalid/expired and should be deleted.

### Logout Flow
1. Frontend sends a `POST /auth/logout` request with the token in the body and as the Bearer token in the header.
   ```json
   {
     "token": "<access_token>"
   }
   ```
2. Backend responds with `{ message: 'Logged out successfully' }`.
3. Frontend deletes the token from localStorage/cookie.
4. User is now logged out and cannot access protected routes until they log in again.
