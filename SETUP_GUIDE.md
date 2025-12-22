# QuizMaster Setup Guide

## 📋 Complete Setup Instructions

### Step 1: Install Prerequisites

#### 1.1 Install Node.js
```bash
# Check if Node.js is installed
node --version

# If not installed, download from: https://nodejs.org/
# Recommended: v18 or higher
```

#### 1.2 Install MongoDB
```bash
# Check if MongoDB is installed
mongod --version

# If not installed:
# Ubuntu/Debian:
sudo apt-get install mongodb

# Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas
```

### Step 2: Get Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project**
   - Click "Select a project" → "New Project"
   - Name it "QuizMaster" or any name you prefer
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - If prompted, configure OAuth consent screen:
     - User Type: External
     - App name: QuizMaster
     - User support email: your email
     - Developer contact: your email
     - Save and continue through all steps

5. **Configure OAuth Client**
   - Application type: Web application
   - Name: QuizMaster Web Client
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:5173
     ```
   - Click "Create"

6. **Copy Client ID**
   - You'll see a popup with your Client ID
   - Copy this - you'll need it in the next step

### Step 3: Configure Environment Variables

#### 3.1 Backend Configuration
Create `/home/sama/Desktop/Assiment/backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quiz-app
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
NODE_ENV=development
ALLOWED_DOMAIN=navgurukul.org
```

**Replace:**
- `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Google Client ID from Step 2

#### 3.2 Frontend Configuration
Create `/home/sama/Desktop/Assiment/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

**Replace:**
- `YOUR_GOOGLE_CLIENT_ID_HERE` with the same Google Client ID

### Step 4: Install Dependencies

```bash
# Navigate to project directory
cd /home/sama/Desktop/Assiment

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 5: Start MongoDB

#### Option A: Local MongoDB
```bash
# Start MongoDB service
mongod

# Keep this terminal open
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in backend/.env with your connection string

### Step 6: Run the Application

#### Option A: Using the start script (Recommended)
```bash
# Make sure MongoDB is running first!
./start.sh
```

#### Option B: Manual start (Two terminals)

**Terminal 1 - Backend:**
```bash
cd /home/sama/Desktop/Assiment/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /home/sama/Desktop/Assiment
npm run dev
```

### Step 7: Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api

### Step 8: Create Admin User

By default, all users are created as "student" role. To make yourself an admin:

1. **Login with your @navgurukul.org email**
2. **Get your user ID from MongoDB:**
   ```bash
   mongosh
   use quiz-app
   db.users.find()
   # Copy your user's _id
   ```

3. **Update your role to admin:**
   ```bash
   db.users.updateOne(
     { email: "your-email@navgurukul.org" },
     { $set: { role: "admin" } }
   )
   ```

4. **Logout and login again** to see admin features

### Step 9: Test the Application

1. **Login** with your @navgurukul.org email
2. **As Admin:**
   - Go to Admin Panel
   - Upload the sample quiz: `sample-quiz.json`
   - Click "Create Quiz"

3. **As Student:**
   - Go to Quizzes page
   - Click "Start Quiz" on any quiz
   - Answer questions
   - Submit and view results
   - Check Dashboard for statistics

## 🔧 Troubleshooting

### Issue: "MongoDB connection failed"
**Solution:**
- Make sure MongoDB is running: `pgrep mongod`
- Check MongoDB URI in backend/.env
- Try: `mongod --dbpath /path/to/data/db`

### Issue: "Google OAuth not working"
**Solution:**
- Verify Google Client ID in both .env files
- Check authorized origins in Google Cloud Console
- Make sure you're using @navgurukul.org email
- Clear browser cache and try again

### Issue: "Port already in use"
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000
# Kill the process
kill -9 <PID>

# Or change PORT in backend/.env
```

### Issue: "Cannot find module"
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Same for backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Issue: "CORS error"
**Solution:**
- Make sure backend is running on port 5000
- Check VITE_API_URL in frontend .env
- Restart both servers

## 📝 Creating Quizzes

### JSON Format
```json
{
  "title": "Your Quiz Title",
  "description": "Quiz description",
  "category": "Category Name",
  "difficulty": "easy|medium|hard",
  "timeLimit": 30,
  "questions": [
    {
      "question": "Your question?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "Why this is correct"
    }
  ]
}
```

### Tips:
- `correctAnswer` is 0-indexed (0 = first option)
- Include 2-4 options per question
- Add explanations for better learning
- Test your JSON at https://jsonlint.com/

## 🎯 Next Steps

1. **Customize the app:**
   - Change colors in `src/index.css`
   - Update branding in components
   - Add more features

2. **Deploy to production:**
   - Use MongoDB Atlas for database
   - Deploy backend to Heroku/Railway
   - Deploy frontend to Vercel/Netlify
   - Update environment variables

3. **Add more features:**
   - Quiz categories
   - Leaderboards
   - Timed challenges
   - Certificate generation

## 📞 Need Help?

- Check the main README.md
- Review the code comments
- Test with sample-quiz.json
- Check browser console for errors

---

**Happy Learning! 🎓**
