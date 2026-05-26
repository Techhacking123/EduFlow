# EduFlow Learning Management System (LMS) - Frontend

## Project Overview
This is the frontend application for the EduFlow Learning Management System (LMS). It provides a comprehensive, responsive, and modern user interface for managing educational processes. The platform is designed with role-based access control, catering specifically to Administrators, Faculty, Students, and Parents. It leverages real-time updates and an intuitive design to enhance the learning and administrative experience.

## Features Implemented
- **Role-Based Authentication**: Secure login and registration tailored for distinct user roles (Admin, Faculty, Student, Parent).
- **Dedicated Portals**:
  - **Admin Dashboard**: For system-wide management and oversight.
  - **Faculty Portal**: Tools for managing courses, assignments, and student progress.
  - **Student Portal**: Access to learning materials, assignments, and grades.
  - **Parent Portal**: Monitoring tools for tracking student performance and engagement.
- **Real-Time Communication**: Integrated WebSocket support for live notifications and updates via Socket.io.
- **Responsive Design**: Fully responsive layout built with Tailwind CSS, ensuring a seamless experience across all devices.
- **State Management**: Centralized application state using Redux Toolkit for predictable data flow.

## Tech Stack Used
- **Core Framework**: React (v19)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit & React-Redux
- **Routing**: React Router DOM (v7)
- **API Communication**: Axios
- **Real-time Features**: Socket.io Client

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

### Installation

1. **Navigate to the frontend directory**:
   ```bash
   cd lms-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Ensure you have a `.env` file in the root of the `lms-frontend` directory to configure necessary environment variables. To connect to the live backend, use the provided Render URL:
   ```env
   VITE_API_BASE_URL=https://eduflow-backend-ndca.onrender.com/api
   ```
   *(Alternatively, if running the backend locally, you can use `http://localhost:5000/api`)*

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will start and typically be accessible at `http://localhost:5173`.

### Building for Production
To create an optimized, production-ready build, run:
```bash
npm run build
```
The compiled assets will be generated in the `dist` directory, ready to be deployed.
