# Chemistry & ICT Care by Belal Sir - Coaching Center Management System

## Overview

A comprehensive coaching center management system built for chemistry and ICT education with a scientific-themed interface. The application supports two primary user roles: Teachers (Sir) and Students, providing specialized dashboards, AI-powered question generation, exam management, messaging systems, and progress tracking. The system features animated chemical elements, responsive design, and comprehensive educational tools for modern coaching centers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Styling**: TailwindCSS with shadcn/ui component library for consistent design
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Form Management**: React Hook Form with Zod validation
- **Responsive Design**: Mobile-first approach with device ratio detection system

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the stack
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Session-based authentication with Replit Auth integration
- **API Design**: RESTful API with comprehensive error handling

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema**: Comprehensive schema covering users, batches, exams, questions, submissions, messages, notices, attendance, SMS transactions, and activity logs
- **Migrations**: Database migrations managed through Drizzle Kit
- **Connection**: Neon serverless PostgreSQL with WebSocket support

### Authentication & Authorization
- **Primary Auth**: Replit Auth with OpenID Connect integration
- **Session Management**: PostgreSQL-backed session storage
- **Role-Based Access**: Teacher and Student roles with feature-specific permissions
- **Security**: JWT tokens, secure session cookies, and CSRF protection

### AI Integration
- **Primary AI**: Anthropic Claude (latest model: claude-sonnet-4-20250514)
- **Secondary AI**: Google Gemini for question generation and doubt solving
- **Use Cases**: Automated question generation, intelligent doubt solving, educational content creation
- **Fallback**: Sample content when AI services are unavailable

### Mobile Optimization
- **Device Detection**: Custom useDeviceRatio hook for screen ratio and battery level detection
- **Responsive Icons**: Dynamic icon grid system that adapts to device capabilities
- **Layout Adaptation**: Automatic switching between grid and scroll modes based on screen dimensions
- **Performance**: Mobile-first CSS with optimized animations and reduced chemical compound rendering

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit Auth service with OpenID Connect
- **Session Storage**: PostgreSQL-backed session management

### AI Services
- **Anthropic Claude**: Primary AI for question generation and educational content
- **Google Gemini**: Secondary AI provider for educational assistance
- **Use Cases**: Question generation, doubt solving, content creation

### Payment Processing
- **Stripe**: Payment processing for SMS credits and subscription management
- **Integration**: React Stripe.js for frontend payment forms

### File Storage & Upload
- **Google Cloud Storage**: File storage for exam materials and documents
- **Uppy**: Frontend file upload interface with AWS S3 support
- **Use Cases**: Exam question uploads, document sharing, profile images

### Development Tools
- **Vite**: Build tool with runtime error overlay for development
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast bundling for production builds
- **Drizzle Kit**: Database schema management and migrations

### UI & Styling
- **Radix UI**: Accessible component primitives
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **PostCSS**: CSS processing with autoprefixer

### Monitoring & Analytics
- **Activity Logging**: Comprehensive user action tracking
- **Performance Monitoring**: Built-in performance tracking for mobile optimization
- **Error Handling**: Comprehensive error boundaries and logging