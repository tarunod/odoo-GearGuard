# GearGuard - Equipment Maintenance Management System

A comprehensive equipment maintenance management system built with Next.js, designed to streamline maintenance workflows, track equipment lifecycle, and manage maintenance teams efficiently.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based authentication with role management
- **Equipment Management** - Complete lifecycle tracking from purchase to disposal
- **Maintenance Request System** - Create, track, and manage maintenance requests
- **Team Management** - Organize maintenance teams with team leaders and members
- **Work Center Management** - Define production areas and their capacities
- **Equipment Categories** - Classify equipment by type and assign responsible technicians
- **Maintenance Workflow** - Structured workflow from request to completion/scrap

### Dashboard & Analytics
- **Interactive Dashboard** - Overview of maintenance requests, equipment status, and team performance
- **Real-time Status Tracking** - Monitor maintenance request progress through defined stages
- **Equipment Inventory** - Comprehensive equipment catalog with detailed specifications

### Maintenance Types
- **Corrective Maintenance** - Fix equipment after failure
- **Preventive Maintenance** - Scheduled maintenance to prevent failures

## 🗄️ Database Structure

### Core Tables

#### `users`
- User management with role-based access
- Fields: id, username, email, password, role, department, created_at, updated_at

#### `maintenance_teams`
- Organize technicians into teams
- Fields: id, name, description, team_leader_id, created_at, updated_at

#### `maintenance_team_members`
- Junction table linking users to teams
- Fields: team_id, user_id

#### `equipment`
- Equipment inventory and specifications
- Fields: id, name, serial_number, equipment_category_id, department_name, assigned_employee_id, maintenance_team_id, default_technician_id, purchase_date, warranty_end_date, location, is_scrapped, scrap_date, work_center_id, description, used_by_type, used_by_employee_id, employee_id, assigned_date, created_at, updated_at

#### `equipment_categories`
- Equipment classification system
- Fields: id, name, company_id, responsible_technician_id, created_at, updated_at

#### `work_centers`
- Production area definitions
- Fields: id, name, code, tag, cost_per_hour, capacity_time_efficiency, oee_target, is_active, company_id, created_at, updated_at

#### `maintenance_requests`
- Maintenance request lifecycle management
- Fields: id, subject, description, maintenance_for, maintenance_type, category, priority, stage, equipment_id, work_center_id, maintenance_team_id, technician_id, company_id, scheduled_date, started_at, completed_at, duration_hours, created_by, requested_by_id, created_at

#### `maintenance_logs`
- Audit trail for maintenance activities
- Fields: id, request_id, user_id, action, note, created_at

## 🔐 Authentication & Authorization

### Authentication System
- **JWT-based authentication** with 2-hour token expiration
- **Secure password hashing** using bcryptjs
- **HTTP-only cookies** for session management
- **Middleware protection** for dashboard routes

### User Roles
- **Admin** - Full system access
- **Technician** - Maintenance operations
- **User** - Basic access and request creation

### Workflow Protection
- Authenticated routes require valid JWT tokens
- Automatic redirect to login for unauthorized access
- Session validation on protected endpoints

## 🌐 API Endpoints

### Authentication APIs
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
POST /api/auth/logout         # User logout
GET  /api/auth/me             # Get current user info
```

### Equipment Management
```
GET    /api/equipment/list               # List all equipment
POST   /api/equipment/create             # Create new equipment
GET    /api/equipment/[id]               # Get equipment details
PUT    /api/equipment/[id]               # Update equipment
DELETE /api/equipment/[id]               # Delete equipment
GET    /api/equipment/categories         # List equipment categories
POST   /api/equipment/categories         # Create equipment category
GET    /api/equipment/categories/[id]    # Get category details
PUT    /api/equipment/categories/[id]    # Update category
DELETE /api/equipment/categories/[id]    # Delete category
```

### Maintenance Management
```
GET    /api/maintenance/list             # List maintenance requests
POST   /api/maintenance/request          # Create maintenance request
GET    /api/maintenance/request/[id]     # Get request details
PUT    /api/maintenance/request/[id]     # Update request
DELETE /api/maintenance/request/[id]     # Delete request
GET    /api/maintenance/metadata         # Get maintenance metadata
```

### Team Management
```
GET    /api/teams              # List maintenance teams
POST   /api/teams              # Create new team
GET    /api/teams/[id]         # Get team details
PUT    /api/teams/[id]         # Update team
DELETE /api/teams/[id]         # Delete team
```

### Work Center Management
```
GET    /api/workcenters              # List work centers
POST   /api/workcenters              # Create work center
GET    /api/workcenters/[id]         # Get work center details
PUT    /api/workcenters/[id]         # Update work center
DELETE /api/workcenters/[id]         # Delete work center
```

## 🔄 Maintenance Workflow

### Request Stages
1. **New** - Initial request creation
2. **In Progress** - Work has started
3. **Repaired** - Maintenance completed successfully
4. **Scrap** - Equipment marked for disposal

### Priority Levels
- **1** - Low priority
- **2** - Medium priority
- **3** - High priority

### Maintenance Types
- **Corrective** - Reactive maintenance after failure
- **Preventive** - Proactive scheduled maintenance

## 🛠️ Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MySQL (AWS RDS)
- **Authentication**: JWT with jose library
- **Password Hashing**: bcryptjs
- **Database Client**: mysql2

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd odoo-geargurd
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local
JWT_SECRET=your-secret-key
DATABASE_URL=mysql://user:password@host:port/database
```

4. Set up the database:
```bash
# Run database creation scripts in order
npm run create-tables
npm run seed-data
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── equipment/      # Equipment management
│   │   ├── maintenance/    # Maintenance requests
│   │   ├── teams/          # Team management
│   │   └── workcenters/    # Work center management
│   ├── dashboard/          # Main dashboard
│   ├── equipment/          # Equipment pages
│   ├── login/             # Authentication pages
│   └── register/          # User registration
├── components/            # Reusable UI components
├── lib/
│   ├── auth.ts           # Authentication utilities
│   └── db.ts             # Database connection
└── middleware.ts         # Route protection
```

## 🏗️ Database Setup Scripts

Located in `scripts/` directory:
- `create-table.mjs` - Main database schema creation
- `update-equipment-schema.mjs` - Equipment table enhancements
- `update-maintenance-schema.mjs` - Maintenance request updates
- `create-equipment-categories.mjs` - Equipment categories table
- `create-work-centers.mjs` - Work centers table
- `seed-*.mjs` - Data seeding scripts

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🚀 Deployment

### Docker Deployment
```bash
docker build -t gearguard .
docker run -p 3000:3000 gearguard
```

### Environment Variables for Production
```env
JWT_SECRET=your-production-secret
DATABASE_URL=mysql://prod-user:prod-pass@prod-host:3306/gearguard_db
NEXT_PUBLIC_API_URL=https://your-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.
