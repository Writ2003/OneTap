import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, AlertCircle, File, ArrowLeft, CheckCircle, XCircle, Eye } from 'lucide-react';
import apiService from '../services/api';
import { decryptFile } from "../utils/encryptionHandler" 

const getMimeTypeFromFilename = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
        'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 'webp': 'image/webp', 'svg': 'image/svg+xml',
        'pdf': 'application/pdf',
        'txt': 'text/plain', 'html': 'text/html', 'css': 'text/css', 'js': 'application/javascript', 'json': 'application/json', 'md': 'text/markdown',
        // Added document mime types
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    };
    return mimeTypes[extension] || 'application/octet-stream';
};

const getParamsFromHash = () => {
    const hash = window.location.hash.substring(1); // Remove '#'
    const params = new URLSearchParams(hash);
    const key = params.get('key') || '';
    const filename = decodeURIComponent(params.get('filename') || 'downloaded-file');
    return { key, filename };
};

const ViewPage = () => {
    const getFileIdFromPath = () => window.location.pathname.split('/').pop();

    const fileId = getFileIdFromPath();
    const [status, setStatus] = useState('ready'); // ready, processing, viewing, error
    const [error, setError] = useState('');
    const [decryptedFile, setDecryptedFile] = useState(null); // { blob, filename, type, url }
    const [textContent, setTextContent] = useState('');

    useEffect(() => {
        if (status === 'viewing' && decryptedFile?.type.startsWith('text/')) {
            const reader = new FileReader();
            reader.onload = (e) => setTextContent(e.target.result);
            reader.readAsText(decryptedFile.blob);
        }
    }, [status, decryptedFile]);

    const handleGoBack = () => { window.location.href = '/'; };

    const handleProcessFile = useCallback(async () => {
        setStatus('processing');
        setError('');

        try {
            const { key, filename } = getParamsFromHash();
            if (!key) throw new Error('Decryption key is missing from the URL.');
            if (filename === 'downloaded-file') {
                 console.warn('Filename not found in URL hash, defaulting to "downloaded-file".');
            }

            const result = await apiService.downloadFile(fileId);
            if (!result.success) throw new Error(result.error);

            const encryptedData = await result.blob.arrayBuffer();
            const decryptedData = await decryptFile(encryptedData, key);

            const mimeType = getMimeTypeFromFilename(filename);
            const finalBlob = new Blob([decryptedData], { type: mimeType });
            const finalUrl = URL.createObjectURL(finalBlob);

            setDecryptedFile({
                blob: finalBlob,
                filename: filename,
                type: mimeType,
                url: finalUrl,
            });

            setStatus('viewing');

        } catch (err) {
            console.error(err);
            setError(err instanceof DOMException ? 'Decryption failed. The key is incorrect or the file is corrupted.' : err.message);
            setStatus('error');
        }
    }, [fileId]);

    const renderPreview = () => {
        if (!decryptedFile) return null;

        const { type, url, filename } = decryptedFile;

        if (type.startsWith('image/')) {
            return <img src={url} alt={filename} className="preview-content-image" />;
        }
        if (type === 'application/pdf') {
            return <embed src={url} type="application/pdf" className="preview-content-embed" />;
        }
        if (type.startsWith('text/')) {
            return <pre className="preview-content-text">{textContent}</pre>;
        }
        return (
            <div className="preview-fallback">
                <File size={60} />
                <p>Preview is not available for this file type.</p>
                <span>{filename}</span>
            </div>
        );
    };

    const renderContent = () => {
        switch (status) {
            case 'processing':
                return (
                    <div className="status-container">
                        <div className="spinner"></div>
                        <p>Processing File...</p>
                    </div>
                );
            case 'viewing':
                return (
                    <div className="viewing-container">
                        <div className="view-header">
                            <File size={20} />
                            <span className="filename">{decryptedFile.filename}</span>
                            <div className="header-buttons">
                                <button onClick={() => apiService.downloadFileFromBlob(decryptedFile.blob, decryptedFile.filename)} className="header-button">
                                    <Download size={16} /> Download
                                </button>
                                <button onClick={handleGoBack} className="header-button">
                                    <ArrowLeft size={16} /> Back
                                </button>
                            </div>
                        </div>
                        <div className="preview-area">{renderPreview()}</div>
                    </div>
                );
            case 'error':
                 return (
                    <div className="status-container">
                        <XCircle size={60} className="error-icon" />
                        <h2>Action Failed</h2>
                         <p className="error-message">{error}</p>
                        <button onClick={handleGoBack} className="back-button">
                            <ArrowLeft size={16} /> Back to Home
                        </button>
                    </div>
                );
            default: // ready
                return (
                     <div className="status-container">
                        <File size={80} style={{ marginBottom: '2rem' }} />
                        <h1>Secure File Access</h1>
                        <p className="subtitle">
                            This is a secure, one-time access link. The file will be decrypted and shown in your browser.
                        </p>
                        <div className="button-group">
                            <button onClick={handleProcessFile} className="download-button">
                                <Eye size={20} /> View File
                            </button>
                            <button onClick={handleGoBack} className="cancel-button">
                                <ArrowLeft size={20} /> Cancel
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="view-page">
            <div className={`view-container ${status === 'viewing' ? 'viewing-mode' : ''}`}>
                <motion.div
                    className="view-card"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                   {renderContent()}
                </motion.div>
            </div>
            <style>{`
                .view-page {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background-color: #1a1a2e;
                    color: white;
                    font-family: 'Inter', sans-serif;
                    padding: 1rem 0;
                }
                .view-container {
                    width: 100%;
                    max-width: 600px;
                    padding: 1rem;
                    transition: max-width 0.5s ease;
                }
                .view-container.viewing-mode {
                    max-width: 1000px;
                }
                .view-card {
                    background: #16213e;
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                }
                .status-container { text-align: center; padding: 4rem; }
                .subtitle { opacity: 0.8; margin-bottom: 2rem; line-height: 1.6; }
                .button-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
                .download-button, .cancel-button, .back-button, .header-button {
                    border: none; border-radius: 10px; padding: 0.8rem 1.5rem; color: white; cursor: pointer;
                    font-size: 1rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; transition: all 0.3s ease;
                }
                .download-button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                .download-button:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
                .cancel-button, .back-button, .header-button { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); }
                .cancel-button:hover, .back-button:hover, .header-button:hover { background: rgba(255, 255, 255, 0.2); }
                .spinner {
                    width: 40px; height: 40px; border: 3px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;
                }
                .error-icon { color: #ff6b6b; margin-bottom: 1rem; }
                .error-message {
                     background: rgba(255, 0, 0, 0.1); border: 1px solid rgba(255, 0, 0, 0.3);
                     border-radius: 10px; padding: 1rem; margin: 1rem 0 2rem 0; color: #ff6b6b;
                }
                .viewing-container {
                    width: 100%;
                }
                .view-header {
                    display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem;
                    background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .filename { font-weight: 600; margin-right: auto; }
                .header-buttons { display: flex; gap: 0.5rem; }
                .preview-area {
                    padding: 1rem; background-color: #0f172a; min-height: 60vh; max-height: 80vh;
                    display: flex; align-items: center; justify-content: center; overflow-y: auto;
                }
                .preview-content-image { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px; }
                .preview-content-embed { width: 100%; height: 100%; min-height: 70vh; border: none; }
                .preview-content-text {
                    white-space: pre-wrap; word-wrap: break-word; text-align: left;
                    background-color: #1e293b; color: #cbd5e1; padding: 1.5rem;
                    border-radius: 8px; width: 100%; height: 100%; overflow: auto;
                }
                .preview-fallback {
                    text-align: center; color: #94a3b8; display: flex; flex-direction: column;
                    align-items: center; gap: 1rem;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ViewPage;