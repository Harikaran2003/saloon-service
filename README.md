# Salon Booking Management System

A comprehensive salon booking application with React frontend and Spring Boot backend.

## Features
- **Customer**: Book appointments, view history, leave feedback
- **Stylist**: Manage bookings, services, and profile  
- **Admin**: System overview, manage stylists, monitor feedback
- **Email Notifications**: Automatic booking alerts

## Tech Stack
- **Backend**: Java Spring Boot, MySQL, JPA/Hibernate, Spring Mail
- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Axios

## Quick Setup

### Backend Setup
1. Configure `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   spring.mail.username=YOUR_EMAIL@gmail.com
   spring.mail.password=YOUR_EMAIL_PASSKEY
   ```

2. Create MySQL database:
   ```sql
   CREATE DATABASE salon_booking;
   ```

3. Run backend:
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Access URLs
- Backend: http://localhost:8080
- Frontend: http://localhost:5173

## Usage
1. Sign up with role (Customer/Stylist/Admin)
2. Stylists: Add services and manage bookings
3. Customers: Browse stylists and book appointments
4. Admin: Manage system and monitor activities

Complete documentation available in the project files.