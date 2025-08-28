# Chemistry & ICT Care by Belal Sir - Coaching Center Management System

## Project Overview
A scientific-themed coaching center management system with animated chemical elements and comprehensive educational dashboards. The system supports two main user types: Teachers (Sir) and Students, with role-based access and features.

## User Preferences
- Clean, scientific-themed UI with animated chemical elements floating around
- Sidebar navigation with dashboard-style layout
- Mobile responsive design (PWA capability)
- Chemistry and ICT focused branding

## Project Architecture
- **Frontend**: React + TailwindCSS + Vite
- **Backend**: Node.js + Express
- **Storage**: In-memory storage (MemStorage) for development
- **Authentication**: JWT-based role management
- **Styling**: shadcn/ui components + custom chemistry theme
- **Routing**: Wouter for client-side routing

## Features Implementation Plan
1. **Landing Page**: Scientific theme with animated chemical elements
2. **Authentication**: Login/signup for students and teachers
3. **Teacher Dashboard**: Exam management, student monitoring, notifications
4. **Student Dashboard**: Exam taking, attendance, messaging
5. **Exam System**: MCQ and written exams with timing
6. **Messaging**: Teacher-student communication
7. **Reports**: Progress tracking and analytics

## Recent Changes
- **DEVICE RATIO DETECTION & RESPONSIVE ICON SYSTEM (Jan 2025)**: Successfully implemented comprehensive device ratio detection system to fix mobile display issues
- **Smart Device Adaptation Technology**: Created useDeviceRatio hook that automatically detects screen ratios (88%, 100%, etc.) and calculates optimal icon layouts
- **Responsive Icon Grid Component**: Built ResponsiveIconGrid that dynamically adjusts icon count per row (3-8 icons) based on device capabilities and screen width
- **Real-Time Layout Optimization**: System displays live ratio information and automatically switches between grid and scroll modes for optimal mobile experience
- **Complete Feature Accessibility**: All 8 teacher features (Home, AI Gen, Buy SMS, SMS, Exams, Quest, Students, Reports) and 7 student features remain accessible regardless of device ratio
- **Dynamic Icon Sizing**: Automatically adjusts icon sizes (small/medium/large) and spacing based on screen dimensions for perfect visibility
- **Cross-Platform Consistency**: Both Teacher and Student dashboards use identical responsive system ensuring consistent experience across all devices
- **Advanced AI Integration**: Fully functional Claude/Gemini AI systems for question generation (teachers) and doubt solving (students)
- **Production Database Setup**: Migrated from demo data to real PostgreSQL database with authentic users
- **Real User Accounts**: Created Sir (Teacher: belal.sir@chemistry-ict.edu.bd) and Student (rashid.ahmed@student.edu.bd)

## Tech Stack
- React with TypeScript
- TailwindCSS for styling
- Wouter for routing
- TanStack Query for data fetching
- Zod for validation
- Lucide React for icons