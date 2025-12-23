import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
    FiDownload,
    FiEye,
    FiFileText,
    FiFolder,
    FiArrowRight,
    FiArrowLeft,
    FiCalendar,
    FiUser,
    FiClock
} from 'react-icons/fi';
import './Submissions.css';

const Submissions = () => {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

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

    const handleDownload = async (report) => {
        try {
            const response = await api.get('/submissions/download', {
                params: { file: report.path },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', report.filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading report:', error);
            setMessage({ type: 'error', text: 'Failed to download report' });
        }
    };

    const handleView = async (report) => {
        try {
            const response = await api.get('/submissions/view', {
                params: { file: report.path },
                responseType: 'blob'
            });

            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');
        } catch (error) {
            console.error('Error viewing report:', error);
            setMessage({ type: 'error', text: 'Failed to view report' });
        }
    };

    // Group reports by Quiz Title
    const groupedReports = submissions.reduce((acc, report) => {
        const title = report.quizTitle || 'Uncategorized';
        if (!acc[title]) acc[title] = [];
        acc[title].push(report);
        return acc;
    }, {});

    const handleQuizClick = (quizTitle) => {
        setSelectedQuiz(quizTitle);
    };

    return (
        <div className="submissions-page fade-in">
            <div className="container">
                {/* Header Section */}
                <div className="submissions-header">
                    <div>
                        {selectedQuiz ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button className="btn-icon" onClick={() => setSelectedQuiz(null)}>
                                    <FiArrowLeft />
                                </button>
                                <div>
                                    <h1>{selectedQuiz}</h1>
                                    <p>Viewing {groupedReports[selectedQuiz]?.length || 0} submissions</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h1>Student Submissions</h1>
                                <p>Select a quiz to view student reports</p>
                            </div>
                        )}
                    </div>
                    {!selectedQuiz && (
                        <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
                            Back to Admin
                        </button>
                    )}
                </div>

                {message && (
                    <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
                        {message.text}
                    </div>
                )}

                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading submissions...</p>
                    </div>
                ) : (
                    <div className="submissions-content">
                        {/* Empty State */}
                        {submissions.length === 0 && (
                            <div className="empty-state">
                                <FiFileText className="empty-icon" />
                                <h3>No Submissions Yet</h3>
                                <p>Student quiz submissions will appear here</p>
                            </div>
                        )}

                        {/* Grid View of Quizzes */}
                        {!selectedQuiz && submissions.length > 0 && (
                            <div className="folder-grid">
                                {Object.entries(groupedReports).map(([quizTitle, reports]) => {
                                    const latestReport = reports.reduce((latest, current) =>
                                        new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
                                        , reports[0]);

                                    return (
                                        <div key={quizTitle} className="folder-card" onClick={() => handleQuizClick(quizTitle)}>
                                            <div className="folder-header">
                                                <div className="folder-icon-wrapper">
                                                    <FiFolder />
                                                </div>
                                                <span className="folder-count-badge">
                                                    {reports.length} Reports
                                                </span>
                                            </div>

                                            <div className="folder-info">
                                                <h3>{quizTitle}</h3>
                                                <div className="folder-meta">
                                                    <div className="meta-row">
                                                        <FiClock />
                                                        Latest: {new Date(latestReport.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="folder-actions">
                                                <button className="btn btn-primary btn-block">
                                                    View Submissions <FiArrowRight />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Detail View (Table) */}
                        {selectedQuiz && groupedReports[selectedQuiz] && (
                            <div className="submissions-table-container fade-in">
                                <table className="submissions-table">
                                    <thead>
                                        <tr>
                                            <th>Student / File</th>
                                            <th>Submitted On</th>
                                            <th>Size</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groupedReports[selectedQuiz].map((report, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div className="file-info">
                                                        <FiFileText className="file-icon" />
                                                        <div>
                                                            <span className="filename">{report.filename}</span>
                                                            {/* Try to extract name if possible, else just filename */}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{new Date(report.createdAt).toLocaleString()}</td>
                                                <td>{(report.size / 1024).toFixed(2)} KB</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="text-btn"
                                                            onClick={() => handleView(report)}
                                                            title="View Report"
                                                        >
                                                            <FiEye /> View
                                                        </button>
                                                        <button
                                                            className="text-btn download-btn"
                                                            onClick={() => handleDownload(report)}
                                                            title="Download PDF"
                                                        >
                                                            <FiDownload /> Download
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Submissions;
