# 🚀 QuizMaster - Quick Reference

## ⚡ Quick Start Commands

```bash
# Start MongoDB
mongod

# Start both servers
./start.sh

# OR manually:
# Terminal 1
cd backend && npm run dev

# Terminal 2
npm run dev
```

## 🔗 URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## 🔑 Important Files

### Configuration
- `backend/.env` - Backend environment variables
- `.env` - Frontend environment variables

### Sample Data
- `sample-quiz.json` - Test quiz file

### Documentation
- `README.md` - Main documentation
- `SETUP_GUIDE.md` - Detailed setup instructions
- `PROJECT_SUMMARY.md` - Complete feature list

## 📧 Email Requirement

**Only @navgurukul.org emails are allowed!**

## 👥 User Roles

### Student (Default)
- Take quizzes
- View results
- Track progress
- View dashboard

### Admin
- All student features
- Create quizzes
- Upload files
- Manage quizzes

## 🎯 Main Features

### For Students
1. Login with Google (@navgurukul.org)
2. Browse quizzes (filter by difficulty)
3. Take quiz (with timer)
4. View instant results
5. Check dashboard & history

### For Admins
1. Go to Admin Panel
2. Upload JSON/PDF/TXT file
3. Configure quiz settings
4. Create quiz
5. Quiz available to all students

## 📝 Quiz JSON Structure

```json
{
  "title": "Quiz Title",
  "description": "Description",
  "category": "Category",
  "difficulty": "easy|medium|hard",
  "timeLimit": 30,
  "questions": [
    {
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why correct"
    }
  ]
}
```

## 🛠️ Common Commands

### Install Dependencies
```bash
npm install
cd backend && npm install
```

### Database
```bash
# Connect to MongoDB
mongosh

# Use quiz database
use quiz-app

# View users
db.users.find()

# Make user admin
db.users.updateOne(
  { email: "user@navgurukul.org" },
  { $set: { role: "admin" } }
)
```

### Troubleshooting
```bash
# Kill port 5000
lsof -i :5000
kill -9 <PID>

# Kill port 5173
lsof -i :5173
kill -9 <PID>

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🎨 Color Codes

```css
--primary-blue: #2563eb
--secondary-blue: #60a5fa
--light-blue: #dbeafe
--success: #10b981
--error: #ef4444
--warning: #f59e0b
```

## 📱 Responsive Breakpoints

- **Mobile:** < 480px
- **Tablet:** 481px - 768px
- **Desktop:** > 768px

## 🔐 API Endpoints

### Auth
- `POST /api/auth/google` - Login
- `GET /api/auth/me` - Get user

### Quizzes
- `GET /api/quizzes` - List all
- `GET /api/quizzes/:id` - Get one
- `POST /api/quizzes/upload` - Create (Admin)
- `POST /api/quizzes/:id/submit` - Submit answers
- `DELETE /api/quizzes/:id` - Delete (Admin)

### Users
- `GET /api/users/history` - Quiz history
- `GET /api/users/stats` - Statistics
- `GET /api/users` - All users (Admin)
- `PUT /api/users/role/:id` - Update role (Admin)

## ⚠️ Important Notes

1. **Google OAuth Setup Required**
   - Get Client ID from Google Cloud Console
   - Add to both .env files

2. **MongoDB Must Be Running**
   - Start with `mongod` command
   - Or use MongoDB Atlas

3. **Email Domain Restriction**
   - Only @navgurukul.org emails work
   - Configured in backend

4. **Default Role is Student**
   - Manually change to admin in database
   - Use MongoDB commands above

## 🎯 Testing Checklist

- [ ] MongoDB running
- [ ] Backend server started (port 5000)
- [ ] Frontend server started (port 5173)
- [ ] Google OAuth configured
- [ ] Can login with @navgurukul.org email
- [ ] Can view quizzes
- [ ] Can take quiz
- [ ] Can see results
- [ ] Can view dashboard
- [ ] Admin can upload quiz
- [ ] Admin can create quiz

## 📞 Need Help?

1. Check `SETUP_GUIDE.md` for detailed instructions
2. Review `README.md` for features
3. Check browser console for errors
4. Check backend terminal for API errors
5. Verify .env files are configured

---

**Quick Tip:** Use `sample-quiz.json` to test quiz creation!
