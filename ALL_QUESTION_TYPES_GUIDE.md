# 📚 Complete Question Types Guide

## 🎯 **14 Question Types Supported!**

Admin ab **14 alag-alag types ke questions** add kar sakta hai! Har type ka apna format hai.

---

## 📝 **All Question Types:**

### **1. MCQ (Multiple Choice Question)** 
Single correct answer

```json
{
  "type": "mcq",
  "question": "What is 2 + 2?",
  "options": ["3", "4", "5", "6"],
  "correctAnswer": 1,
  "explanation": "2 + 2 = 4",
  "points": 1,
  "difficulty": "easy"
}
```

---

### **2. Multiple-Select**
Multiple correct answers

```json
{
  "type": "multiple-select",
  "question": "Which are programming languages?",
  "options": ["Python", "HTML", "Java", "CSS", "C++"],
  "correctAnswer": [0, 2, 4],
  "explanation": "Python, Java, and C++ are programming languages",
  "points": 2
}
```

---

### **3. True-False**
Binary choice

```json
{
  "type": "true-false",
  "question": "JavaScript is compiled language",
  "options": ["True", "False"],
  "correctAnswer": 1,
  "explanation": "JavaScript is interpreted, not compiled",
  "points": 1
}
```

---

### **4. Short Answer**
Brief text response (2-10 words)

```json
{
  "type": "short-answer",
  "question": "What does CPU stand for?",
  "sampleAnswer": "Central Processing Unit",
  "keywords": ["central", "processing", "unit"],
  "maxWords": 5,
  "points": 2
}
```

---

### **5. Long Answer**
Essay/Paragraph (30-500 words)

```json
{
  "type": "long-answer",
  "question": "Explain Object-Oriented Programming with examples",
  "sampleAnswer": "OOP is a programming paradigm based on objects...",
  "keywords": ["class", "object", "inheritance", "polymorphism"],
  "minWords": 50,
  "maxWords": 200,
  "points": 5,
  "hints": ["Discuss 4 main principles", "Give code examples"]
}
```

---

### **6. Fill in the Blanks**
Complete sentence with missing words

```json
{
  "type": "fill-blank",
  "question": "HTML stands for ___ Text Markup ___",
  "blanks": [
    {
      "position": 0,
      "correctAnswer": "Hyper",
      "alternateAnswers": ["HYPER", "hyper"]
    },
    {
      "position": 1,
      "correctAnswer": "Language",
      "alternateAnswers": ["LANGUAGE", "language"]
    }
  ],
  "points": 2
}
```

---

### **7. Matching**
Match pairs correctly

```json
{
  "type": "matching",
  "question": "Match programming languages with their creators:",
  "leftItems": ["Python", "Java", "C", "JavaScript"],
  "rightItems": ["Dennis Ritchie", "Guido van Rossum", "James Gosling", "Brendan Eich"],
  "correctPairs": [
    {"left": 0, "right": 1},
    {"left": 1, "right": 2},
    {"left": 2, "right": 0},
    {"left": 3, "right": 3}
  ],
  "points": 4
}
```

---

### **8. Ordering**
Arrange in correct sequence

```json
{
  "type": "ordering",
  "question": "Arrange HTTP methods in order of safety (safest to least safe):",
  "items": ["DELETE", "GET", "POST", "PUT"],
  "correctOrder": [1, 2, 3, 0],
  "explanation": "GET > POST > PUT > DELETE",
  "points": 3
}
```

---

### **9. Code Output Prediction**
Predict what code will output

```json
{
  "type": "code-output",
  "question": "What is the output?",
  "codeSnippet": "for(let i=0; i<3; i++) {\n  console.log(i);\n}",
  "language": "javascript",
  "options": ["0 1 2", "1 2 3", "0 1 2 3", "Error"],
  "correctAnswer": 0,
  "explanation": "Loop runs from 0 to 2",
  "points": 2,
  "tags": ["loops", "javascript"]
}
```

---

### **10. Code Debug**
Find and fix errors

```json
{
  "type": "code-debug",
  "question": "Find the error in this code:",
  "codeSnippet": "function add(a, b) {\n  return a + b\n}\nconsole.log(add(5, 10))",
  "language": "javascript",
  "sampleAnswer": "Missing semicolon after return statement (optional in JS but good practice)",
  "keywords": ["semicolon", "syntax"],
  "points": 3,
  "hints": ["Check for syntax issues"]
}
```

---

### **11. Code Completion**
Fill in missing code

```json
{
  "type": "code-complete",
  "question": "Complete the function to find maximum:",
  "codeSnippet": "function findMax(arr) {\n  return Math.___(  ...arr  );\n}",
  "language": "javascript",
  "sampleAnswer": "return Math.max(...arr);",
  "keywords": ["max", "spread"],
  "testCases": [
    {
      "input": "[1, 5, 3]",
      "expectedOutput": "5"
    }
  ],
  "points": 4
}
```

---

### **12. Code Writing**
Write complete function/program

```json
{
  "type": "code-write",
  "question": "Write a function to check if a string is palindrome",
  "language": "javascript",
  "sampleAnswer": "function isPalindrome(str) {\n  const reversed = str.split('').reverse().join('');\n  return str === reversed;\n}",
  "keywords": ["split", "reverse", "join", "palindrome"],
  "testCases": [
    {
      "input": "\"madam\"",
      "expectedOutput": "true"
    },
    {
      "input": "\"hello\"",
      "expectedOutput": "false"
    }
  ],
  "points": 5,
  "hints": ["Compare string with its reverse"]
}
```

---

### **13. Numerical Answer**
Number-based answer

```json
{
  "type": "numerical",
  "question": "How many bytes are in 1 Kilobyte?",
  "correctAnswer": 1024,
  "explanation": "1 KB = 1024 bytes",
  "points": 2,
  "difficulty": "easy"
}
```

---

### **14. File Upload**
Upload assignment file

```json
{
  "type": "file-upload",
  "question": "Upload your project zip file",
  "sampleAnswer": "Student uploads project.zip file",
  "explanation": "Will be manually reviewed",
  "points": 10,
  "tags": ["assignment", "project"]
}
```

---

## 🎨 **Student View (How Each Type Looks):**

### **MCQ:**
```
┌────────────────────────────┐
│ Q: What is 2 + 2?          │
│                            │
│ ○ A) 3                     │
│ ● B) 4   ← Selected        │
│ ○ C) 5                     │
│ ○ D) 6                     │
└────────────────────────────┘
```

### **Multiple-Select:**
```
┌────────────────────────────┐
│ Q: Select all fruits:      │
│                            │
│ ☑ Apple   ← Selected       │
│ ☐ Carrot                   │
│ ☑ Banana  ← Selected       │
│ ☐ Potato                   │
└────────────────────────────┘
```

### **Long Answer:**
```
┌────────────────────────────┐
│ Q: Explain OOP             │
│                            │
│ ┌────────────────────────┐ │
│ │ [Type your answer...]  │ │
│ │                        │ │
│ │                        │ │
│ └────────────────────────┘ │
│ Words: 0/200               │
└────────────────────────────┘
```

### **Code Output:**
```
┌────────────────────────────┐
│ Q: What is the output?     │
│                            │
│ Code:                      │
│ ┌────────────────────────┐ │
│ │ let x = 5;             │ │
│ │ console.log(x + 2);    │ │
│ └────────────────────────┘ │
│                            │
│ ○ A) 5                     │
│ ● B) 7   ← Selected        │
│ ○ C) 52                    │
└────────────────────────────┘
```

### **Matching:**
```
┌────────────────────────────┐
│ Match items:               │
│                            │
│ Python    ━━━  James       │
│ Java      ━━━  Guido       │
│ C         ━━━  Dennis      │
│                            │
│ (Drag to connect)          │
└────────────────────────────┘
```

### **Code Write:**
```
┌────────────────────────────┐
│ Q: Write isPalindrome()    │
│                            │
│ Code Editor:               │
│ ┌────────────────────────┐ │
│ │ function isPalindrome  │ │
│ │ (str) {                │ │
│ │   // Your code here    │ │
│ │ }                      │ │
│ └────────────────────────┘ │
│                            │
│ [Run Tests]  [Submit]      │
└────────────────────────────┘
```

---

## 📊 **Points System:**

| Question Type | Default Points | Difficulty |
|---------------|----------------|------------|
| MCQ | 1 | Easy |
| Multiple-Select | 2 | Easy-Medium |
| True-False | 1 | Easy |
| Short Answer | 2 | Easy-Medium |
| Long Answer | 5 | Medium-Hard |
| Fill Blanks | 2 | Easy |
| Matching | 4 | Medium |
| Ordering | 3 | Medium |
| Code Output | 2 | Medium |
| Code Debug | 3 | Medium |
| Code Complete | 4 | Medium-Hard |
| Code Write | 5 | Hard |
| Numerical | 2 | Easy-Medium |
| File Upload | 10 | Hard |

---

## 🎯 **Use Cases:**

### **Theory Quiz:**
```json
{
  "questions": [
    {"type": "mcq", ...},
    {"type": "true-false", ...},
    {"type": "short-answer", ...},
    {"type": "long-answer", ...}
  ]
}
```

### **Programming Quiz:**
```json
{
  "questions": [
    {"type": "code-output", ...},
    {"type": "code-debug", ...},
    {"type": "code-complete", ...},
    {"type": "code-write", ...}
  ]
}
```

### **Mixed Quiz:**
```json
{
  "questions": [
    {"type": "mcq", ...},
    {"type": "code-output", ...},
    {"type": "long-answer", ...},
    {"type": "matching", ...}
  ]
}
```

---

## 📁 **Sample Files:**

1. **`sample-quiz.json`** - Basic MCQ
2. **`sample-mixed-quiz.json`** - MCQ + Written
3. **`sample-all-types-quiz.json`** - All 14 types! ⭐

---

## ✅ **How to Use:**

### **Method 1: Copy Sample**
```
1. Open sample-all-types-quiz.json
2. Copy content
3. Admin Panel → Paste JSON
4. Create Quiz
```

### **Method 2: Create Custom**
```
1. Choose question types you need
2. Follow format from this guide
3. Create JSON
4. Paste in admin panel
```

---

## 🎨 **Responsive UI:**

All question types are **fully responsive**:
- ✅ Mobile (< 480px)
- ✅ Tablet (480px - 768px)
- ✅ Desktop (> 768px)

---

**Ab admin kisi bhi type ka question add kar sakta hai! 🚀**

**Sample file ready: `sample-all-types-quiz.json` ✨**
