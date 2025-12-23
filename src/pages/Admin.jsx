import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FiUpload, FiFileText, FiPlus, FiEye, FiKey, FiCode, FiUsers, FiShield } from 'react-icons/fi';
import './Admin.css';

const Admin = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('upload');
    const [file, setFile] = useState(null);
    const [quizType, setQuizType] = useState('mcq');
    const [jsonPreview, setJsonPreview] = useState(null);
    const [apiKey, setApiKey] = useState('');
    const [jsonInput, setJsonInput] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'General',
        difficulty: 'medium',
        numberOfQuestions: 10,
        timeLimit: 30
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data.users);
        } catch (error) {
            console.error('Error fetching users:', error);
            setMessage({ type: 'error', text: 'Failed to load users' });
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'student' : 'admin';
        try {
            await api.put(`/users/role/${userId}`, { role: newRole });
            setMessage({ type: 'success', text: `User role updated to ${newRole}` });
            fetchUsers();
        } catch (error) {
            console.error('Error updating role:', error);
            setMessage({ type: 'error', text: 'Failed to update user role' });
        }
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const validTypes = ['application/json', 'application/pdf', 'text/plain'];
            if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.json')) {
                setFile(selectedFile);
                setMessage(null);

                // If JSON file, show preview
                if (selectedFile.name.endsWith('.json') || selectedFile.type === 'application/json') {
                    try {
                        const text = await selectedFile.text();
                        const jsonData = JSON.parse(text);
                        setJsonPreview(jsonData);

                        // Auto-fill form data from JSON
                        if (jsonData.title) setFormData(prev => ({ ...prev, title: jsonData.title }));
                        if (jsonData.description) setFormData(prev => ({ ...prev, description: jsonData.description }));
                        if (jsonData.category) setFormData(prev => ({ ...prev, category: jsonData.category }));
                        if (jsonData.difficulty) setFormData(prev => ({ ...prev, difficulty: jsonData.difficulty }));
                        if (jsonData.timeLimit) setFormData(prev => ({ ...prev, timeLimit: jsonData.timeLimit }));

                    } catch (error) {
                        setMessage({ type: 'error', text: 'Invalid JSON file format' });
                        setJsonPreview(null);
                    }
                } else {
                    setJsonPreview(null);
                }
            } else {
                setMessage({ type: 'error', text: 'Please upload a JSON, PDF, or TXT file' });
                setFile(null);
                setJsonPreview(null);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleJsonInputChange = (e) => {
        setJsonInput(e.target.value);

        // Try to parse and preview
        try {
            const parsed = JSON.parse(e.target.value);
            setJsonPreview(parsed);
            setMessage(null);
        } catch (error) {
            setJsonPreview(null);
            // Don't show error while typing
        }
    };

    const validateJsonAndPreview = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            setJsonPreview(parsed);
            setMessage({ type: 'success', text: 'JSON is valid! Preview updated.' });
            return true;
        } catch (error) {
            setMessage({ type: 'error', text: 'Invalid JSON format: ' + error.message });
            setJsonPreview(null);
            return false;
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();

        if (!jsonInput.trim()) {
            setMessage({ type: 'error', text: 'Please paste JSON content' });
            return;
        }

        try {
            const quizData = JSON.parse(jsonInput);

            // Validate required fields
            if (!quizData.title || !quizData.questions || !Array.isArray(quizData.questions)) {
                setMessage({ type: 'error', text: 'JSON must have "title" and "questions" array' });
                return;
            }

            setLoading(true);
            setMessage(null);

            const response = await api.post('/quizzes/create', quizData);

            setMessage({ type: 'success', text: 'Quiz created successfully!' });
            setJsonInput('');
            setJsonPreview(null);

            setTimeout(() => {
                navigate('/quizzes');
            }, 2000);
        } catch (error) {
            console.error('Error creating quiz:', error);
            if (error instanceof SyntaxError) {
                setMessage({ type: 'error', text: 'Invalid JSON format' });
            } else {
                setMessage({
                    type: 'error',
                    text: error.response?.data?.message || 'Failed to create quiz'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file' });
            return;
        }

        setLoading(true);
        setMessage(null);

        const uploadData = new FormData();
        uploadData.append('quizFile', file);
        uploadData.append('title', formData.title);
        uploadData.append('description', formData.description);
        uploadData.append('category', formData.category);
        uploadData.append('difficulty', formData.difficulty);
        uploadData.append('numberOfQuestions', formData.numberOfQuestions);
        uploadData.append('timeLimit', formData.timeLimit);

        // Add API key if provided
        if (apiKey) {
            uploadData.append('apiKey', apiKey);
        }

        try {
            const response = await api.post('/quizzes/upload', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage({ type: 'success', text: 'Quiz created successfully!' });
            setFile(null);
            setJsonPreview(null);
            setApiKey('');
            setFormData({
                title: '',
                description: '',
                category: 'General',
                difficulty: 'medium',
                numberOfQuestions: 10,
                timeLimit: 30
            });

            setTimeout(() => {
                navigate('/quizzes');
            }, 2000);
        } catch (error) {
            console.error('Error uploading quiz:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to create quiz'
            });
        } finally {
            setLoading(false);
        }
    };

    const getSampleJsonString = (type) => {
        const base = {
            "title": type === 'mcq' ? "General Knowledge Quiz" :
                type === 'long-answer' ? "Essay Writing Test" :
                    type === 'code-output' ? "JS Output Challenge" : "Python Coding Test",
            "description": "A sample quiz to demonstrate the format.",
            "category": type === 'code-write' || type === 'code-output' ? "Programming" : "General",
            "difficulty": "medium",
            "timeLimit": 30
        };

        let questions = [];

        if (type === 'mcq') {
            questions = [{
                "type": "mcq",
                "question": "What is the capital of France?",
                "options": ["London", "Paris", "Berlin", "Madrid"],
                "correctAnswer": 1,
                "explanation": "Paris is the capital of France"
            }];
        } else if (type === 'long-answer') {
            questions = [{
                "type": "long-answer",
                "question": "Explain the impact of AI on modern society.",
                "minWords": 50,
                "maxWords": 500,
                "sampleAnswer": "AI impacts society by automating tasks..."
            }];
        } else if (type === 'code-output') {
            questions = [{
                "type": "code-output",
                "question": "What will be the output of this code?",
                "codeSnippet": "console.log(2 + '2');",
                "language": "javascript",
                "correctAnswer": "22",
                "explanation": "String concatenation happens."
            }];
        } else if (type === 'code-write') {
            questions = [{
                "type": "code-write",
                "question": "Write a function to add two numbers.",
                "language": "javascript",
                "testCases": [
                    { "input": "2, 3", "expectedOutput": "5" },
                    { "input": "10, 20", "expectedOutput": "30" }
                ]
            }];
        } else if (type === 'mixed') {
            questions = [
                {
                    "type": "mcq",
                    "question": "Which of the following is a valid variable name in JavaScript?",
                    "options": ["2names", "_first_name", "var-name", "@name"],
                    "correctAnswer": 1,
                    "marks": 2
                },
                {
                    "type": "long-answer",
                    "question": "Explain the difference between 'let' and 'var' in one sentence.",
                    "maxWords": 50,
                    "marks": 5
                },
                {
                    "type": "code-output",
                    "question": "What will be the output?",
                    "codeSnippet": "console.log(typeof NaN);",
                    "correctAnswer": "number",
                    "marks": 3
                },
                {
                    "type": "code-write",
                    "question": "Write a function 'sum' that adds two numbers.",
                    "language": "javascript",
                    "marks": 10
                }
            ];
        }

        return JSON.stringify({ ...base, questions }, null, 2);
    };

    const getPlaceholder = (type) => {
        return `Paste your ${type.toUpperCase()} JSON here...\n` + getSampleJsonString(type);
    };

    const loadSampleJson = () => {
        const jsonStr = getSampleJsonString(quizType);
        setJsonInput(jsonStr);
        setJsonPreview(JSON.parse(jsonStr));
    };

    return (
        <div className="admin-page">
            <div className="container-sm">
                <div className="admin-header fade-in">
                    <div>
                        <h1>Admin Panel</h1>
                        <p>Create and manage quizzes with AI</p>
                    </div>
                </div>

                <div className="admin-tabs">
                    <button
                        className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upload')}
                    >
                        <FiUpload /> Upload File
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
                        onClick={() => setActiveTab('manual')}
                    >
                        <FiCode /> Paste JSON
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('users'); fetchUsers(); }}
                    >
                        <FiUsers /> Manage Users
                    </button>
                </div>

                {message && (
                    <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
                        {message.text}
                    </div>
                )}

                {activeTab === 'upload' && (
                    <div className="admin-card fade-in">
                        <div className="card-header">
                            <h2>Upload Quiz File</h2>
                            <p>Upload a JSON, PDF, or TXT file to generate a quiz automatically</p>
                        </div>

                        <form onSubmit={handleUploadSubmit}>
                            {/* OpenAI API Key Field */}
                            <div className="form-group">
                                <label className="form-label">
                                    <FiKey /> OpenAI API Key (Optional)
                                </label>
                                <input
                                    type="password"
                                    name="apiKey"
                                    className="form-input"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-... (for AI-powered quiz generation)"
                                />
                                <small className="form-hint">
                                    💡 Add your OpenAI API key to generate quizzes from PDF/TXT files automatically
                                </small>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Quiz Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter quiz title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    name="description"
                                    className="form-textarea"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter quiz description"
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        className="form-input"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Mathematics, Science"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Difficulty</label>
                                    <select
                                        name="difficulty"
                                        className="form-select"
                                        value={formData.difficulty}
                                        onChange={handleInputChange}
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Number of Questions</label>
                                    <input
                                        type="number"
                                        name="numberOfQuestions"
                                        className="form-input"
                                        value={formData.numberOfQuestions}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="50"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Time Limit (minutes)</label>
                                    <input
                                        type="number"
                                        name="timeLimit"
                                        className="form-input"
                                        value={formData.timeLimit}
                                        onChange={handleInputChange}
                                        min="5"
                                        max="180"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Upload File *</label>
                                <div className="file-upload-area">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        accept=".json,.pdf,.txt"
                                        onChange={handleFileChange}
                                        className="file-input"
                                    />
                                    <label htmlFor="file-upload" className="file-upload-label">
                                        <FiFileText className="upload-icon" />
                                        <span>{file ? file.name : 'Choose a file or drag it here'}</span>
                                        <span className="file-types">Supported: JSON, PDF, TXT</span>
                                    </label>
                                </div>
                            </div>

                            {/* JSON Preview */}
                            {jsonPreview && activeTab === 'upload' && (
                                <div className="json-preview-section">
                                    <div className="preview-header">
                                        <FiEye /> JSON File Preview
                                    </div>
                                    <div className="preview-stats">
                                        <div className="stat-item">
                                            <strong>Title:</strong> {jsonPreview.title || 'N/A'}
                                        </div>
                                        <div className="stat-item">
                                            <strong>Questions:</strong> {jsonPreview.questions?.length || 0}
                                        </div>
                                        <div className="stat-item">
                                            <strong>Category:</strong> {jsonPreview.category || 'N/A'}
                                        </div>
                                        <div className="stat-item">
                                            <strong>Difficulty:</strong> {jsonPreview.difficulty || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="preview-content">
                                        <pre>{JSON.stringify(jsonPreview, null, 2)}</pre>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary btn-large btn-block"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span>
                                        <span className="spinner-small"></span> Creating Quiz...
                                    </span>
                                ) : (
                                    'Create Quiz'
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'manual' && (
                    <div className="admin-card fade-in">
                        <div className="card-header">
                            <h2><FiCode /> Paste JSON to Create Quiz</h2>
                            <p>Copy and paste your quiz JSON here - instant quiz creation!</p>
                        </div>

                        <form onSubmit={handleManualSubmit}>
                            <div className="form-group">
                                <div className="json-editor-header">
                                    <div className="json-controls-left">
                                        <label className="form-label">Quiz Type</label>
                                        <select
                                            className="form-select quiz-type-select"
                                            value={quizType}
                                            onChange={(e) => {
                                                setQuizType(e.target.value);
                                                // Optional: Auto-load sample when type changes? 
                                                // Better to let user click "Load Sample" to avoid overwriting work.
                                            }}
                                        >
                                            <option value="mcq">Multiple Choice (Standard)</option>
                                            <option value="long-answer">Written Test (Essay/Subjective)</option>
                                            <option value="code-output">Output Based (Predict Output)</option>
                                            <option value="code-write">Code Written Test (Programming)</option>
                                            <option value="mixed">Mixed / Bulk Upload (All Types)</option>
                                        </select>
                                    </div>

                                    <div className="json-actions">
                                        <button
                                            type="button"
                                            className="btn-small btn-secondary"
                                            onClick={loadSampleJson}
                                        >
                                            Load {quizType === 'mcq' ? 'MCQ' :
                                                quizType === 'long-answer' ? 'Written' :
                                                    quizType === 'code-output' ? 'Output' : 'Code'} Sample
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-small btn-primary"
                                            onClick={validateJsonAndPreview}
                                        >
                                            <FiEye /> Validate & Preview
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    className="json-input"
                                    value={jsonInput}
                                    onChange={handleJsonInputChange}
                                    placeholder={getPlaceholder(quizType)}
                                    rows="15"
                                    required
                                />
                                <small className="form-hint">
                                    💡 Select a Quiz Type and click "Load Sample" to see the correct format!
                                </small>
                            </div>

                            {/* JSON Preview for Manual Tab */}
                            {jsonPreview && activeTab === 'manual' && (
                                <div className="json-preview-section">
                                    <div className="preview-header">
                                        <FiEye /> Quiz Preview ({quizType.toUpperCase()})
                                    </div>
                                    <div className="preview-stats">
                                        <div className="stat-item">
                                            <strong>Title:</strong> {jsonPreview.title || 'N/A'}
                                        </div>
                                        <div className="stat-item">
                                            <strong>Questions:</strong> {jsonPreview.questions?.length || 0}
                                        </div>
                                        <div className="stat-item">
                                            <strong>Category:</strong> {jsonPreview.category || 'N/A'}
                                        </div>
                                        <div className="stat-item">
                                            <strong>Difficulty:</strong> {jsonPreview.difficulty || 'N/A'}
                                        </div>
                                        <div className="stat-item">
                                            <strong>Time Limit:</strong> {jsonPreview.timeLimit || 30} mins
                                        </div>
                                    </div>
                                    <div className="questions-preview">
                                        <h4>Questions Preview:</h4>
                                        {jsonPreview.questions?.slice(0, 3).map((q, idx) => (
                                            <div key={idx} className="question-preview-item">
                                                <div className="q-header">
                                                    <strong>Q{idx + 1} ({q.type || 'mcq'}):</strong>
                                                    <span className="q-text">{q.question}</span>
                                                </div>

                                                {/* Preview based on Type */}
                                                <div className="q-body-preview">
                                                    {/* MCQ Options */}
                                                    {(!q.type || q.type === 'mcq') && (
                                                        <div className="options-preview">
                                                            {q.options?.map((opt, i) => (
                                                                <div key={i} className={i === q.correctAnswer ? 'correct-opt' : ''}>
                                                                    {String.fromCharCode(65 + i)}. {opt}
                                                                    {i === q.correctAnswer && ' ✓'}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Written / Short Answer */}
                                                    {(q.type === 'short-answer' || q.type === 'long-answer') && (
                                                        <div className="written-preview">
                                                            <em>Sample Answer:</em> {q.sampleAnswer || 'N/A'}
                                                            <br />
                                                            <small>Max Words: {q.maxWords || 'Unlimited'}</small>
                                                        </div>
                                                    )}

                                                    {/* Output Based */}
                                                    {q.type === 'code-output' && (
                                                        <div className="code-preview">
                                                            <pre className="code-block">{q.codeSnippet}</pre>
                                                            <div className="correct-opt">Expected: {q.correctAnswer}</div>
                                                        </div>
                                                    )}

                                                    {/* Code Write */}
                                                    {q.type === 'code-write' && (
                                                        <div className="code-write-preview">
                                                            <div>Language: {q.language || 'Any'}</div>
                                                            <div>Test Cases: {q.testCases?.length || 0}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {jsonPreview.questions?.length > 3 && (
                                            <p className="more-questions">... and {jsonPreview.questions.length - 3} more questions</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-success btn-large btn-block"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span>
                                        <span className="spinner-small"></span> Creating Quiz...
                                    </span>
                                ) : (
                                    '🚀 Create Quiz from JSON'
                                )}
                            </button>
                        </form>

                        <div className="json-example">
                            <h3>📝 {quizType === 'mcq' ? 'MCQ' : quizType.replace('-', ' ').toUpperCase()} Format Guide:</h3>
                            <pre>{getSampleJsonString(quizType)}</pre>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="admin-card fade-in">
                        <div className="card-header">
                            <h2><FiUsers /> User Management</h2>
                            <p>Manage user roles and permissions</p>
                        </div>

                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Joined</th>
                                        <th>Role</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar-small">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    {u.name}
                                                </div>
                                            </td>
                                            <td>{u.email}</td>
                                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`role-badge ${u.role}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className={`btn-small ${u.role === 'admin' ? 'btn-danger' : 'btn-success'}`}
                                                    onClick={() => handleRoleUpdate(u._id, u.role)}
                                                    disabled={loading}
                                                >
                                                    <FiShield />
                                                    {u.role === 'admin' ? ' Remove Admin' : ' Make Admin'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
