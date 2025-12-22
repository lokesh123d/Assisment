# QuizMaster - AI-Powered Quiz Platform

A full-stack MERN application for creating and taking quizzes with AI-powered quiz generation. Built specifically for Navgurukul students with Google OAuth authentication.

## 🌟 Features

### For Students
- ✅ **Google OAuth Login** - Secure login with @navgurukul.org email
- ✅ **Interactive Quizzes** - Take quizzes with a beautiful, distraction-free interface
- ✅ **Real-time Timer** - Countdown timer for each quiz
- ✅ **Instant Results** - Get immediate feedback with detailed explanations
- ✅ **Progress Tracking** - View your quiz history and performance statistics
- ✅ **Responsive Design** - Works perfectly on mobile, tablet, and desktop

### For Admins
- ✅ **AI-Powered Quiz Generation** - Upload JSON, PDF, or TXT files to auto-generate quizzes
- ✅ **File Upload** - Support for multiple file formats
- ✅ **Quiz Management** - Create, edit, and delete quizzes
- ✅ **Customization** - Set difficulty, category, time limits, and more

## 🎨 Design

- **Color Scheme**: Beautiful blue and white theme
- **Modern UI**: Glassmorphism, smooth animations, and micro-interactions
- **Fully Responsive**: Mobile-first design that works on all devices
- **Accessibility**: WCAG compliant with proper contrast and semantic HTML

## 🚀 Tech Stack

### Frontend
- React 19
- React Router v6
- Google OAuth (@react-oauth/google)
- Axios for API calls
- React Icons
- CSS3 with CSS Variables

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- Google OAuth 2.0
- Multer for file uploads
- PDF parsing support

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Google Cloud Console project with OAuth 2.0 credentials

### 1. Clone the repository
```bash
cd /home/sama/Desktop/Assiment
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quiz-app
JWT_SECRET=your_jwt_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
NODE_ENV=development
ALLOWED_DOMAIN=navgurukul.org
```

### 3. Setup Frontend

```bash
cd ..
npm install
```

Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 4. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
6. Add authorized redirect URIs:
   - `http://localhost:5173`
7. Copy the Client ID and paste it in both `.env` files

### 5. Start MongoDB

If using local MongoDB:
```bash
mongod
```

Or use MongoDB Atlas and update the `MONGODB_URI` in backend `.env`

### 6. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 📝 Usage

### For Students

1. **Login**: Click "Sign in with Google" using your @navgurukul.org email
2. **Browse Quizzes**: View all available quizzes on the Quizzes page
3. **Take Quiz**: Click "Start Quiz" to begin
4. **Submit**: Answer all questions and submit to see your results
5. **View Dashboard**: Check your progress and quiz history

### For Admins

1. **Create Quiz**: Go to Admin Panel
2. **Upload File**: Choose a JSON, PDF, or TXT file
3. **Configure**: Set title, description, difficulty, etc.
4. **Generate**: Click "Create Quiz" to generate from file
5. **Manage**: View and manage all quizzes

### Quiz JSON Format

```json
{
  "title": "Sample Quiz",
  "description": "A sample quiz about programming",
  "category": "Programming",
  "difficulty": "medium",
  "timeLimit": 30,
  "questions": [
    {
      "question": "What is JavaScript?",
      "options": [
        "A programming language",
        "A coffee brand",
        "A type of Java",
        "A framework"
      ],
      "correctAnswer": 0,
      "explanation": "JavaScript is a programming language used for web development."
    }
  ]
}
```

## 🔐 Security Features

- JWT-based authentication
- Email domain validation (@navgurukul.org only)
- Protected API routes
- Role-based access control (Student/Admin)
- Secure file upload with validation

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quizzes/upload` - Upload file and create quiz (Admin)
- `POST /api/quizzes/create` - Create quiz manually (Admin)
- `POST /api/quizzes/:id/submit` - Submit quiz answers
- `DELETE /api/quizzes/:id` - Delete quiz (Admin)

### Users
- `GET /api/users/history` - Get user's quiz history
- `GET /api/users/stats` - Get user's statistics
- `GET /api/users` - Get all users (Admin)
- `PUT /api/users/role/:userId` - Update user role (Admin)

## 🎨 Color Palette

```css
Primary Blue: #2563eb
Secondary Blue: #60a5fa
Light Blue: #dbeafe
White: #ffffff
Success: #10b981
Error: #ef4444
Warning: #f59e0b
```

## 📱 Responsive Breakpoints

- Mobile: < 480px
- Tablet: 481px - 768px
- Desktop: > 768px

## 🤝 Contributing

This is a project for Navgurukul students. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning purposes.

## 🙏 Acknowledgments

- Built for Navgurukul students
- Designed with modern web development best practices
- Inspired by popular quiz platforms like Kahoot and Quizizz

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Made with ❤️ for Navgurukul Students**
