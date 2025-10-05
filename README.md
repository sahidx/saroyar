# Student Nursing Center - Coach Manager System

A comprehensive coaching center management system built for **Golam Sarowar Sir's** mathematics and science coaching institute.

## 🎯 Features

### 👨‍🏫 **Teacher Dashboard**
- **Student Management**: Add, edit, and track student progress
- **Exam System**: Create MCQ and written exams with auto-grading
- **SMS Integration**: Send bulk SMS to students and parents
- **Fee Collection**: Track payments and generate receipts
- **AI Question Generator**: Generate questions using Praggo AI
- **Monthly Results**: Automated result compilation and sharing
- **Attendance Tracking**: Monitor student attendance
- **Batch Management**: Organize students into classes

### 👨‍🎓 **Student Portal**
- **Exam Portal**: Take online exams with timer
- **Results & Rankings**: View exam results and class rankings
- **Study Materials**: Access question banks and resources
- **Monthly Reports**: Get automated progress reports
- **AI Study Help**: Get help with mathematics problems
- **Attendance Records**: View attendance history

### 🔐 **Authentication System**
- **Role-based Access**: Teacher, Student, and Admin roles
- **Secure Login**: Session-based authentication
- **Local Storage**: Persistent login state
- **Mock System**: Development-friendly testing

### 📊 **Data Management**
- **PostgreSQL Database**: Production-ready database
- **Data Export**: Download student and exam data
- **Backup System**: Automated data backups
- **Migration Support**: Database version control

## 🚀 **Quick Start**

### Prerequisites
- Node.js 16+ 
- PostgreSQL 12+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/sahidx/saroyar.git
cd saroyar

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Create PostgreSQL database
createdb saro_db

# Run migrations
npm run db:migrate

# Build and start
npm run build
npm start
```

### Development Mode

```bash
# Start development servers
npm run dev

# Or start components separately
npm run dev:frontend  # Frontend only
npm run dev:backend   # Backend only
```

## 📁 **Project Structure**

```
coach-manager/
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and API clients
│   │   └── styles/         # CSS and styling
├── server/                 # Express.js Backend
│   ├── routes.ts           # API route handlers
│   ├── db.ts              # Database configuration
│   ├── index.ts           # Server entry point
│   └── *.ts               # Service modules
├── shared/                 # Shared TypeScript types
├── migrations/             # Database migrations
└── dist/                  # Built production files
```

## 🔧 **Configuration**

### Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL="postgres://username:password@localhost:5432/saro_db"

# Server
PORT=3000
NODE_ENV=production

# Authentication
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# Optional Services
ANTHROPIC_API_KEY=your_anthropic_key    # For AI features
SMS_API_KEY=your_sms_key                # For SMS service
```

### Database Setup

The system uses PostgreSQL with these main tables:
- `users` - Authentication and user profiles
- `students` - Student information and enrollment
- `batches` - Class/batch organization  
- `exams` - Exam definitions and settings
- `exam_submissions` - Student exam attempts
- `fees` - Fee collection and payment tracking

## 🛠️ **API Documentation**

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Student Management
- `GET /api/students` - List all students
- `POST /api/students` - Add new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Remove student

### Exam System
- `GET /api/exams` - List exams
- `POST /api/exams` - Create new exam
- `GET /api/exams/:id` - Get exam details
- `POST /api/exams/:id/submit` - Submit exam attempt

### SMS & Communication
- `POST /api/sms/send` - Send SMS to students
- `GET /api/sms/balance` - Check SMS credit balance
- `POST /api/sms/bulk` - Send bulk SMS campaigns

## 🎨 **UI/UX Features**

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes
- **Professional UI**: Clean, modern interface design
- **Real-time Updates**: Live data synchronization
- **Mobile-First**: Optimized for mobile devices
- **Accessibility**: Screen reader and keyboard friendly

## 🔒 **Security Features**

- **Input Validation**: Server-side data validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Content sanitization
- **CORS Configuration**: Secure cross-origin requests
- **Rate Limiting**: API rate limiting protection
- **Secure Headers**: Security HTTP headers

## 📱 **Mobile Features**

- **Touch-Friendly**: Optimized touch interactions
- **Offline Support**: Basic offline functionality
- **App-like Experience**: PWA capabilities
- **Fast Loading**: Optimized bundle sizes
- **Native Feel**: Mobile-native UI patterns

## 🚀 **Deployment**

### VPS Deployment
```bash
# Use the deployment script
chmod +x deploy-vps.sh
./deploy-vps.sh
```

### Manual Deployment
```bash
# Build production bundle
npm run build

# Start with PM2
pm2 start ecosystem.config.cjs

# Or use Docker
docker-compose up -d
```

### Supported Platforms
- ✅ Ubuntu/Debian VPS
- ✅ CentOS/RHEL
- ✅ Docker containers
- ✅ Heroku/Railway
- ✅ DigitalOcean/Linode

## 📊 **Performance**

- **Fast Loading**: < 2s initial page load
- **Small Bundle**: Optimized JavaScript bundles
- **Efficient Queries**: Optimized database queries
- **Caching**: Redis/memory caching
- **CDN Ready**: Static asset optimization

## 🧪 **Testing**

```bash
# Run all tests
npm test

# Run frontend tests
npm run test:frontend

# Run backend tests  
npm run test:backend

# End-to-end tests
npm run test:e2e
```

## 📈 **Monitoring**

- **Health Checks**: `/api/health` endpoint
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Response time monitoring
- **Database Monitoring**: Query performance tracking

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 **Support**

**Golam Sarowar Sir**
- 📱 Phone: 01762602056
- 🏫 Student Nursing Center
- 📧 Technical Support: Create an issue on GitHub

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Built with ❤️ for mathematics and science education
- Designed for **Student Nursing Center** coaching institute
- Empowering students through technology

---

**Made with 💡 by Golam Sarowar Sir** - *Excellence in Mathematics & Science Education*
