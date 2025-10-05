# Production Deployment Guide

## Coach Manager System - Production Ready

### 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sahidx/saroyar.git
   cd saroyar
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set up PostgreSQL database:**
   ```bash
   # Create database
   createdb saro_db
   
   # Set environment variable
   export DATABASE_URL="postgres://saro:saro@localhost:5432/saro_db"
   ```

5. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

6. **Build and start:**
   ```bash
   npm run build
   npm start
   ```

### 🔧 Environment Configuration

Create `.env` file with these variables:

```env
# Database
DATABASE_URL="postgres://saro:saro@localhost:5432/saro_db"

# Server
PORT=3000
NODE_ENV=production

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_here
SESSION_SECRET=your_super_secure_session_secret_here

# AI Services (Optional)
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_ai_key

# SMS Service (Optional)
SMS_API_KEY=your_sms_api_key
SMS_SECRET=your_sms_secret
```

### 📁 Project Structure

```
coach-manager/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
├── server/                 # Express backend
│   ├── routes.ts           # API routes
│   ├── db.ts              # Database configuration
│   └── index.ts           # Server entry point
├── shared/                 # Shared types/utilities
└── dist/                  # Built files
```

### 🎯 Features

- **Student Management**: Add, track, and manage students
- **Exam System**: Create and grade exams
- **SMS Integration**: Send notifications to students
- **Fee Collection**: Track payments and fees
- **Teacher Dashboard**: Comprehensive management interface
- **Authentication**: Secure login system
- **Data Export**: Download student and exam data

### 🔐 Authentication

The system uses localStorage-based authentication with the following roles:
- **Teacher**: Full access to dashboard and student management
- **Student**: Access to exams and personal data
- **Super User**: Administrative access

### 🗃️ Database

Uses PostgreSQL with the following main tables:
- `users` - User accounts (teachers, students, admins)
- `students` - Student information
- `batches` - Student groups/classes
- `exams` - Exam definitions
- `exam_submissions` - Student exam attempts
- `fees` - Fee collection records

### 🚀 Deployment Options

#### Option 1: VPS Deployment
```bash
# Use the provided deployment script
chmod +x deploy-vps.sh
./deploy-vps.sh
```

#### Option 2: Docker (Coming Soon)
```bash
docker-compose up -d
```

#### Option 3: Manual Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Build the application: `npm run build`
4. Start with PM2: `pm2 start ecosystem.config.cjs`

### 🔧 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Database migrations
npm run db:migrate
```

### 🛠️ API Endpoints

- `GET /api/auth/user` - Get current user
- `POST /api/auth/login` - User login
- `GET /api/students` - List students
- `POST /api/students` - Add student
- `GET /api/exams` - List exams
- `POST /api/exams` - Create exam

### 📱 Frontend Features

- Responsive design for mobile and desktop
- Dark/light theme support
- Real-time SMS credit tracking
- Interactive dashboards
- Professional UI components

### 🔍 Troubleshooting

**Common Issues:**

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL format
   - Ensure database exists

2. **Port Already in Use**
   - Change PORT in .env
   - Kill existing processes: `npm run kill-ports`

3. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version (requires 16+)

### 📞 Support

For technical support or questions:
- Create an issue on GitHub
- Contact: Golam Sarowar Sir
- Phone: 01762602056

### 📄 License

This project is licensed under the MIT License.