# Hospital Management System

## Overview

A full-stack Hospital Management System with modular architecture to support multiple departments. Initially focused on OPD (Outpatient Department), with extensibility for dialysis, cath lab, operating theater, wards, pharmacy, and more.

## Features

- User authentication and authorization with role-based access control
- Patient management with search capabilities
- Prescription management with PDF generation
- Medicine formulary with CSV import/export
- Test result tracking and management
- Hospital and print settings configuration

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Knex.js ORM
- **Authentication**: JWT-based
- **Documentation**: Modular API documentation

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- PostgreSQL (v13 or later)

### Installation

1. Clone the repository

```
git clone <repository-url>
cd thiNodes
```

2. Install dependencies

```
npm install
```

3. Setup environment variables
   Create a `.env` file in the project root with the following variables:

```
PORT=3000
NODE_ENV=development
JWT_SECRET_KEY=your_secret_key
DB_CLIENT=pg
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=hospital_management
DB_PORT=5432
CORS_ORIGIN=http://localhost:3000
```

4. Run database migrations

```
npx knex migrate:latest --knexfile src/db/knexfile.js
```

5. Start the development server

```
npm run dev
```

## API Routes

### Authentication

- `POST /api/auth/register` - Register a new user (admin only)
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Patients

> **Important Note**: The system uses Oracle-generated `patientId` as the primary key for patients, rather than auto-incrementing IDs. This allows seamless integration with the existing hospital system.

- `GET /api/patients` - Get all patients
- `GET /api/patients/search` - Search patients
- `GET /api/patients/:id` - Get patient by Oracle ID
- `GET /api/patients/:id/prescriptions` - Get patient prescriptions
- `POST /api/patients` - Create new patient (requires Oracle patientId)
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Prescriptions

- `GET /api/prescriptions` - Get all prescriptions
- `GET /api/prescriptions/:id` - Get prescription by ID
- `GET /api/prescriptions/:id/pdf` - Generate prescription PDF
- `POST /api/prescriptions` - Create new prescription
- `PUT /api/prescriptions/:id` - Update prescription
- `DELETE /api/prescriptions/:id` - Delete prescription

### Formulary

- `GET /api/formulary` - Get all medicines
- `GET /api/formulary/search` - Search medicines
- `GET /api/formulary/:id` - Get medicine by ID
- `GET /api/formulary/export` - Export medicines to CSV
- `POST /api/formulary` - Create new medicine (admin only)
- `POST /api/formulary/import` - Import medicines from CSV (admin only)
- `PUT /api/formulary/:id` - Update medicine (admin only)
- `DELETE /api/formulary/:id` - Delete medicine (admin only)

### Test Results

- `GET /api/test-results` - Get all test results
- `GET /api/test-results/:id` - Get test result by ID
- `GET /api/test-results/patient/:patientId` - Get test results by patient ID
- `POST /api/test-results` - Create new test result
- `PUT /api/test-results/:id` - Update test result
- `DELETE /api/test-results/:id` - Delete test result

### Settings

- `GET /api/settings/hospital` - Get hospital settings
- `PUT /api/settings/hospital` - Update hospital settings (admin only)
- `POST /api/settings/hospital/reset` - Reset hospital settings (admin only)
- `GET /api/settings/print` - Get print settings
- `PUT /api/settings/print` - Update print settings (admin only)
- `POST /api/settings/print/reset` - Reset print settings (admin only)

## License

ISC
