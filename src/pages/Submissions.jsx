import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiDownload, FiEye, FiFileText, FiRotateCw } from 'react-icons/fi';
import './Submissions.css';

const Submissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/submissions');
            setSubmissions(response.data.submissions);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setMessage({ type: 'error', text: 'Failed to load submissions' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (filename) => {
        try {
            const response = await api.get(`/submissions/download/${filename}`, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setMessage({ type: 'success', text: 'Download started!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error downloading report:', error);
            setMessage({ type: 'error', text: 'Failed to download report' });
        }
    };

    const handleView = async (filename) => {
        try {
            window.open(`${import.meta.env.VITE_API_URL}/submissions/view/${filename}`, '_blank');
        } catch (error) {
            console.error('Error viewing report:', error);
            setMessage({ type: 'error', text: 'Failed to view report' });
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const extractStudentInfo = (filename) => {
        // Filename format: quiz-report-{userId}-{timestamp}.pdf
        const parts = filename.split('-');
        const userId = parts[2] || 'Unknown';
        const timestamp = parts[3]?.replace('.pdf', '') || '';
        return { userId, timestamp };
    };

    if (loading) {
        return (
            <div className="submissions-page">
                <div className="container">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading submissions...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="submissions-page">
            <div className="container">
                <div className="submissions-header fade-in">
                    <div>
                        <h1>📊 Quiz Submissions</h1>
                        <p>View and download student quiz submissions</p>
                    </div>
                    <button className="btn btn-primary" onClick={fetchSubmissions}>
                        <FiRotateCw /> Refresh
                    </button>
                </div>

                {message && (
                    <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
                        {message.text}
                    </div>
                )}

                <div className="submissions-stats fade-in">
                    <div className="stat-card">
                        <FiFileText className="stat-icon" />
                        <div>
                            <h3>{submissions.length}</h3>
                            <p>Total Submissions</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <FiDownload className="stat-icon" />
                        <div>
                            <h3>{submissions.filter(s => new Date(s.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}</h3>
                            <p>Last 24 Hours</p>
                        </div>
                    </div>
                </div>

                {submissions.length === 0 ? (
                    <div className="empty-state fade-in">
                        <FiFileText className="empty-icon" />
                        <h3>No Submissions Yet</h3>
                        <p>Student quiz submissions will appear here</p>
                    </div>
                ) : (
                    <div className="submissions-table-container fade-in">
                        <table className="submissions-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Report Name</th>
                                    <th>File Size</th>
                                    <th>Submitted On</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((submission, index) => {
                                    const { userId, timestamp } = extractStudentInfo(submission.filename);
                                    return (
                                        <tr key={submission.filename} className="submission-row">
                                            <td>{index + 1}</td>
                                            <td>
                                                <div className="file-info">
                                                    <FiFileText className="file-icon" />
                                                    <div>
                                                        <div className="filename">{submission.filename}</div>
                                                        <div className="file-meta">User ID: {userId.substring(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{formatFileSize(submission.size)}</td>
                                            <td>{formatDate(submission.createdAt)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-icon btn-primary"
                                                        onClick={() => handleView(submission.filename)}
                                                        title="View PDF"
                                                    >
                                                        <FiEye />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-success"
                                                        onClick={() => handleDownload(submission.filename)}
                                                        title="Download PDF"
                                                    >
                                                        <FiDownload />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Submissions;
