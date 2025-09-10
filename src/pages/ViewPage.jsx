import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, AlertCircle, File, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import apiService from '../services/api';

const ViewPage = () => {
    // In a real SPA with react-router-dom, you'd use useParams().
    // For this single-file component, we parse the URL manually.
    const getFileIdFromPath = () => {
        const pathSegments = window.location.pathname.split('/');
        return pathSegments[pathSegments.length - 1];
    };

    const fileId = getFileIdFromPath();
    const [status, setStatus] = useState('ready'); // ready, downloading, success, error
    const [error, setError] = useState('');

    const handleGoBack = () => {
        window.location.href = '/'; // Navigate back to the root
    };

    const handleDownload = useCallback(async () => {
        setStatus('downloading');
        setError('');

        try {
            // 1. Extract the encryption key from the URL hash (#key=...)
            const key = window.location.hash.substring(5); // Remove '#key='
            if (!key) {
                throw new Error('Decryption key is missing from the URL.');
            }

            // 2. Download the encrypted file from the backend
            const result = await apiService.downloadFile(fileId);

            if (!result.success) {
                throw new Error(result.error);
            }

            // 3. Decrypt the file in the browser
            const encryptedData = await result.blob.arrayBuffer();
            const decryptedBlob = await decryptFile(encryptedData, key);

            // 4. Trigger the download of the decrypted file
            apiService.downloadFileFromBlob(decryptedBlob, result.filename);

            setStatus('success');
            setTimeout(() => handleGoBack(), 3000); // Redirect after success

        } catch (err) {
            console.error(err);
             if (err instanceof DOMException) {
                setError('Decryption failed. The key is incorrect or the file is corrupted.');
            } else {
                setError(err.message || 'An unknown error occurred.');
            }
            setStatus('error');
        }
    }, [fileId]);

    const renderContent = () => {
        switch (status) {
            case 'downloading':
                return (
                    <div className="status-container">
                        <div className="spinner"></div>
                        <p>Downloading & Decrypting...</p>
                    </div>
                );
            case 'success':
                return (
                     <div className="status-container">
                        <CheckCircle size={60} className="success-icon" />
                        <h2>Download Complete!</h2>
                        <p>Your file has been downloaded successfully. This link is now expired.</p>
                        <button onClick={handleGoBack} className="back-button">
                            <ArrowLeft size={16} /> Back to Home
                        </button>
                    </div>
                );
            case 'error':
                 return (
                    <div className="status-container">
                        <XCircle size={60} className="error-icon" />
                        <h2>Download Failed</h2>
                         <p className="error-message">{error}</p>
                        <button onClick={handleGoBack} className="back-button">
                            <ArrowLeft size={16} /> Back to Home
                        </button>
                    </div>
                );
            case 'ready':
            default:
                return (
                     <div className="status-container">
                        <File size={80} style={{ marginBottom: '2rem' }} />
                        <h1>Secure File Download</h1>
                        <p className="subtitle">
                            This is a secure, one-time download link. Once you download the file, this link will expire.
                        </p>
                        <div className="button-group">
                            <button onClick={handleDownload} className="download-button">
                                <Download size={20} /> Download File
                            </button>
                            <button onClick={handleGoBack} className="cancel-button">
                                <ArrowLeft size={20} /> Cancel
                            </button>
                        </div>
                         <div className="info-section">
                            <h4>Security Features:</h4>
                            <ul>
                                <li>• File was encrypted in the sender's browser.</li>
                                <li>• The server never had access to the decryption key.</li>
                                <li>• This link is single-use and will be invalid after this download.</li>
                                <li>• Your decrypted file is never stored on the server.</li>
                            </ul>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="view-page">
            <div className="view-container">
                <motion.div
                    className="view-card"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                   {renderContent()}
                </motion.div>
            </div>
            <style jsx>{`
                // Basic styles to make the component look good. 
                // In a real app, these would be in a global CSS file.
                .view-page {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background-color: #1a1a2e;
                    color: white;
                    font-family: 'Inter', sans-serif;
                }
                .view-container {
                    width: 100%;
                    max-width: 600px;
                    padding: 1rem;
                }
                .view-card {
                    background: #16213e;
                    border-radius: 20px;
                    padding: 2rem 3rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }
                .status-container {
                    text-align: center;
                    padding: 2rem;
                }
                .subtitle {
                    opacity: 0.8;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }
                .button-group {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                .download-button, .cancel-button, .back-button {
                    border: none;
                    border-radius: 10px;
                    padding: 1rem 2rem;
                    color: white;
                    cursor: pointer;
                    font-size: 1.1rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                }
                .download-button {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .download-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                }
                .cancel-button, .back-button {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                .cancel-button:hover, .back-button:hover {
                     background: rgba(255, 255, 255, 0.2);
                }
                .info-section {
                    margin-top: 3rem;
                    padding: 1.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    text-align: left;
                }
                .info-section h4 {
                    margin-bottom: 1rem;
                }
                .info-section ul {
                    list-style: none;
                    padding: 0;
                    opacity: 0.9;
                    line-height: 1.6;
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }
                .success-icon { color: #4CAF50; margin-bottom: 1rem; }
                .error-icon { color: #ff6b6b; margin-bottom: 1rem; }
                .error-message {
                     background: rgba(255, 0, 0, 0.1);
                     border: 1px solid rgba(255, 0, 0, 0.3);
                     border-radius: 10px;
                     padding: 1rem;
                     margin-bottom: 2rem;
                     color: #ff6b6b;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ViewPage;
