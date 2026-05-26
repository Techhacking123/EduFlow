<div align="center">
  <h1>🎓 EduFlow LMS Frontend</h1>
  <p>
    <strong>A comprehensive, responsive, and modern Learning Management System interface.</strong>
  </p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white" alt="Redux Toolkit" />
    <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" alt="Socket.io" />
  </p>
</div>

---

## 🌟 Project Overview

The **EduFlow LMS** frontend is designed to deliver a seamless educational experience for all stakeholders. Built with modern web technologies, it features role-based access control, real-time collaboration, and an intuitive, aesthetic UI.

Whether you're an Administrator overseeing the platform, a Faculty member managing courses, a Student engaging with materials, or a Parent tracking progress—EduFlow has a dedicated portal tailored just for you.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 🔐 **Role-Based Auth** | Secure, specialized login & registration for Admin, Faculty, Student, and Parent. |
| 📊 **Dedicated Portals** | Custom dashboards designed specifically for the needs of each role. |
| ⚡ **Real-Time Updates** | Integrated WebSockets (Socket.io) for live notifications and messaging. |
| 📱 **Responsive Design** | A mobile-first, fully responsive layout built entirely with Tailwind CSS. |
| 🧠 **State Management** | Centralized, predictable data flow using Redux Toolkit. |

---

## 🛠️ Tech Stack

<details>
<summary><b>Click to view detailed tech stack</b></summary>
<br>

- **Core Framework:** React (v19)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Redux Toolkit & React-Redux
- **Routing:** React Router DOM (v7)
- **API Communication:** Axios
- **Real-time Features:** Socket.io Client

</details>

---

## 🚀 Setup Instructions

### 1️⃣ Prerequisites
Ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **npm** (Node Package Manager)

### 2️⃣ Installation & Setup

```bash
# Navigate to the frontend directory
cd lms-frontend

# Install all required dependencies
npm install
```

### 3️⃣ Environment Variables
Create a `.env` file in the root of the `lms-frontend` directory. 

To connect to the **Live Production Backend**:
```env
VITE_API_BASE_URL=https://eduflow-backend-ndca.onrender.com/api
```
*(Alternatively, if running the backend locally, use `http://localhost:5000/api`)*

### 4️⃣ Start Development Server

```bash
# Launch the Vite development server
npm run dev
```
> The application will typically be accessible at [http://localhost:5173](http://localhost:5173).

---

## 📦 Building for Production

To create an optimized, production-ready build, run:

```bash
npm run build
```
> The compiled assets will be generated in the `dist` directory, ready to be deployed to any static hosting service.
