# **Cloudflare R2 Storage Architecture**

This document defines the file naming and folder structure (prefixes) used in our Cloudflare R2 bucket. This structure is built to enforce multi-tenancy, ensuring data isolation and easy management.

**Core Principle:** All assets are stored within a tenant's UUID folder, not by name or slug.

## **Structure Breakdown**

The general format is: tenants/{tenant\_id}/{entity\_type}/{role}/{filename}

| Level | Folder/Prefix | Purpose | Example |
| :---- | :---- | :---- | :---- |
| **Root** | tenants/ | Container for all client data. | tenants/ |
| **L1** | {tenant\_id}/ | **Tenant Isolation.** Uses the UUID of the client agency. | tenants/1111.../ |
| **L2** | locations/ | Stores static branch photos. | tenants/1111.../locations/ |
| **L2** | cars/ | Stores vehicle images. | tenants/1111.../cars/ |
| **L2** | branding/ | Stores the agency logo/assets. | tenants/1111.../branding/ |

## **Specific File Paths**

This defines the full, final URL path saved in the Supabase database:

| Entity | Role | R2 Path Example (Key) | DB Column |
| :---- | :---- | :---- | :---- |
| **Locations** | Storefront Photo | tenants/1111.../locations/uuid-storefront.jpg | locations.image\_url |
| **Cars** | Primary (Cover) | tenants/1111.../cars/primary/uuid-front.jpg | cars.primary\_image\_url |
| **Cars** | Gallery Images | tenants/1111.../cars/gallery/uuid-interior.jpg | cars.gallery\_urls |
| **Tenants** | Logo | tenants/1111.../branding/logo.png | tenants.logo\_url |

## **Usage Note for Backend**

The StorageService.uploadFile method is generic. The Nest.js **Controller** is responsible for building the correct folderPath string (tenants/UUID/entity/role) before calling the service.