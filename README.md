# Hospital Appointment Booking System

A comprehensive hospital appointment booking system built with React, Node.js, Express, and MongoDB. Features role-based authentication, email notifications, and separate dashboards for admins, doctors, and patients.

## Features

### 🏥 Core Functionality
- **Patient Registration & Login**: Secure authentication system
- **Doctor Registration & Login**: Specialized doctor accounts with profiles
- **Admin Dashboard**: Complete system management and oversight
- **Appointment Booking**: Intuitive booking system with doctor selection
- **Email Notifications**: Automated emails for appointments and status updates

### 👨‍⚕️ Doctor Features
- Personal dashboard with appointment management
- View patient details and appointment history
- Update appointment status (completed, no-show, cancelled)
- Manage availability and profile information

### 👨‍💼 Admin Features
- Complete user management (patients, doctors, admins)
- Appointment oversight and management
- System statistics and analytics
- User activation/deactivation controls
- Email notification history

### 🏥 Patient Features
- Easy appointment booking with doctor selection
- Personal dashboard with appointment history
- View upcoming and past appointments
- Receive email confirmations and updates

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Nodemailer** for email notifications

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Gmail account for email notifications (optional)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hospital-booking-system
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/hospital_booking
JWT_SECRET=your_jwt_secret_key_here_make_it_very_secure

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL=admin@hospital.com

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB installation
mongod
```

### 5. Run the Application

#### Development Mode
```bash
# Terminal 1: Start the backend server
npm run server:dev

# Terminal 2: Start the frontend development server
npm run dev
```

#### Production Mode
```bash
# Start the backend server
npm run server

# Build and serve the frontend
npm run build
npm run preview
```

## Default Accounts

The system creates default accounts on first run:

### Admin Account
- **Email**: admin@hospital.com
- **Password**: admin123

### Doctor Accounts
- **Dr. Sarah Johnson**: sarah.johnson@hospital.com / doctor123
- **Dr. Michael Chen**: michael.chen@hospital.com / doctor123
- **Dr. Emily Rodriguez**: emily.rodriguez@hospital.com / doctor123

### Patient Account
Register as a new patient through the registration form.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/doctors` - Get all doctors
- `GET /api/users` - Get all users (Admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user (Admin only)

### Appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - Get appointments (filtered by role)
- `PUT /api/appointments/:id/status` - Update appointment status
- `DELETE /api/appointments/:id` - Cancel appointment

## Email Configuration

To enable email notifications:

1. **Gmail Setup**:
   - Enable 2-factor authentication
   - Generate an app password
   - Use the app password in `EMAIL_PASS`

2. **Other Email Providers**:
   - Update `EMAIL_HOST` and `EMAIL_PORT`
   - Configure authentication credentials

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: ['admin', 'doctor', 'patient'],
  specialty: String (doctors only),
  department: String (doctors only),
  experience: String (doctors only),
  image: String,
  available: Boolean,
  isActive: Boolean
}
```

### Appointment Model
```javascript
{
  patient: ObjectId (ref: User),
  doctor: ObjectId (ref: User),
  date: Date,
  time: String,
  status: ['scheduled', 'completed', 'cancelled', 'no-show'],
  symptoms: String,
  notes: String,
  department: String,
  appointmentType: ['consultation', 'follow-up', 'emergency', 'routine']
}
```

## Features in Detail

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Secure password hashing
- Token expiration handling

### 📧 Email Notifications
- Appointment confirmation emails
- Status update notifications
- Admin notifications for new bookings
- HTML email templates

### 📊 Dashboard Analytics
- Appointment statistics
- User management metrics
- Real-time data updates
- Visual status indicators

### 🎨 Modern UI/UX
- Responsive design for all devices
- Smooth animations and transitions
- Intuitive navigation
- Professional healthcare theme

## Deployment

### Frontend Deployment
```bash
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Backend Deployment
1. Set up MongoDB Atlas or your preferred database
2. Configure environment variables for production
3. Deploy to services like Heroku, Railway, or DigitalOcean

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Note**: This is a demonstration project. For production use, implement additional security measures, error handling, and testing.