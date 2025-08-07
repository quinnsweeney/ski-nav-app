# Ski Navigation App

A comprehensive ski resort navigation application with route finding capabilities, consisting of a server backend, admin client for resort management, and user client for route finding.

Note: No apps will work right now since you need the env variables to run them. I'm working on getting some builded versions up and running

## Project Structure

- **server/** - Node.js backend server with API endpoints
- **admin-client/** - React/Vite admin dashboard for managing resorts, trails, lifts, and POIs
- **user-client/** - React/Vite user interface for finding routes between locations

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## Getting Started

### 1. Server Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Start the development server:

```bash
npm run dev
```

The server will start on the default port (typically 3001).

### 2. Admin Client Setup

Navigate to the admin-client directory and install dependencies:

```bash
cd admin-client
npm install
```

Start the development server:

```bash
npm run dev
```

The admin client will be available at the URL shown in the terminal (typically http://localhost:5173).

### 3. User Client Setup

Navigate to the user-client directory and install dependencies:

```bash
cd user-client
npm install
```

Start the development server:

```bash
npm run dev
```

The user client will be available at the URL shown in the terminal (typically http://localhost:5174).

## Running All Projects

To run the complete application, you'll need to start all three projects in separate terminal windows:

1. **Terminal 1 (Server):**
   ```bash
   cd server
   npm run dev
   ```

2. **Terminal 2 (Admin Client):**
   ```bash
   cd admin-client
   npm run dev
   ```

3. **Terminal 3 (User Client):**
   ```bash
   cd user-client
   npm run dev
   ```

## Features

- **Admin Dashboard**: Manage ski resorts, trails, lifts, and points of interest
- **Route Finding**: Find optimal paths between locations on ski slopes
- **Real-time Updates**: Live updates to resort information and trail conditions
- **Interactive Maps**: Visual representation of ski resort layouts

## Development

Each project uses modern development tools:
- **Server**: Node.js with Express
- **Admin/User Clients**: React with TypeScript, Vite for build tooling
- **Linting**: ESLint configuration for code quality