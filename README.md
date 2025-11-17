# 🚗 Car Rental Management System (CRMS) - SaaS Platform

Welcome to the official repository for the Car Rental Management System (CRMS). This project is built using a modern stack to deliver a scalable, multi-tenant SaaS solution for the car rental industry.

## 🌟 Project Goals
* Provide a simple and intuitive **Client Dashboard** for car rental business owners.
* Offer an easy-to-use **End-User Portal** for customers to find and reserve cars.
* Ensure a secure, performant, and scalable architecture.

## 🛠️ Tech Stack
| Component | Technology | Reasoning |
| :--- | :--- | :--- |
| **Frontend** | **React.js** (with **Tailwind CSS**) | Modern, component-based UI development with utility-first styling. |
| **Backend** | **Nest.js** (Node.js/Express) | Scalable, structured server-side development with TypeScript support. |
| **Database** | **PostgreSQL** | Robust, transactional database suitable for reservation and inventory management. |
| **Design** | **Figma** | Prototyping and UI/UX Collaboration. |
| **Hosting** | Vercel (Frontend), Render/AWS (Backend) | Cloud-native, scalable hosting. |

## 🚀 Getting Started

### Prerequisites

* Node.js (LTS version)
* PostgreSQL
* Git

### Backend Setup (Nest.js)

1.  Clone the repository: `git clone [REPO_URL]`
2.  Navigate to the backend directory: `cd crms-backend`
3.  Install dependencies: `npm install`
4.  Create a `.env` file based on `.env.example` and configure your PostgreSQL connection.
5.  Run database migrations (TBD - e.g., `npx prisma migrate dev` or similar).
6.  Start the server: `npm run start:dev`

### Frontend Setup (React)

1.  Navigate to the frontend directory: `cd crms-frontend`
2.  Install dependencies: `npm install`
3.  Start the client: `npm start` (Runs on http://localhost:3000)

## 🤝 Contribution Guidelines

We are using **Scrum Agile** with a focus on 1-week sprints.
* **Project Management:** Refer to our Jira/Trello board for the current Sprint Backlog.
* **Branching Strategy:** Use the **Feature Branch Workflow**.
    * Create a new branch from `main` for every task (e.g., `feat/EU01-user-auth` or `fix/CD02-car-update-bug`).
    * Open a Pull Request (PR) to merge back into `main` after review.

---
*Last Updated: 17-11-2025*