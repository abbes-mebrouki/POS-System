# Modern POS System (MVP)

A modern, modular Point of Sale (POS) system built with React, Node.js, and PostgreSQL. Designed with offline-first capabilities.

## Features

- **Point of Sale**: Fast and efficient checkout process.
- **Offline Support**: Continue selling even without an internet connection. Sales are synced when online.
- **Inventory Management**: Track stock levels and product details.
- **Sales Reporting**: View daily and total sales statistics.
- **Receipts**: Generate and print receipts for transactions.
- **Authentication**: Secure role-based access control.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI, TanStack Query, Zustand, LocalForage.
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL (SQLite for dev).
- **Infrastructure**: Docker (optional for DB).

## Prerequisites

- Node.js (v18+)
- npm or yarn

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pos-system
   ```

2. **Install Dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Variables**
   - Create `.env` in `server/` (see `.env.example` if available, or use defaults).
   - Default `DATABASE_URL="file:./dev.db"` for SQLite.

4. **Database Setup**
   ```bash
   cd server
   npx prisma migrate dev --name init
   ```

## Running the Application

1. **Start the Server**
   ```bash
   cd server
   npm run dev
   ```
   Server runs on `http://localhost:3000`.

2. **Start the Client**
   ```bash
   cd client
   npm run dev
   ```
   Client runs on `http://localhost:5173`.

3. **Access the App**
   - Open browser at `http://localhost:5173`.
   - Login/Register to start using the POS.

## Offline Mode

The application automatically detects network status.
- **Online**: Transactions are sent directly to the server.
- **Offline**: Transactions are saved locally and queued.
- **Sync**: When connectivity is restored, queued transactions are automatically synced.

## Testing

Run unit tests for the client:
```bash
cd client
npm test
```
