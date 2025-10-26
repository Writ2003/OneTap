import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Clock, Copy, AlertCircle, File, X, ShieldCheck } from 'lucide-react';
import apiService from '../services/api';
import { encryptFile } from '../utils/encryptionHandler';

const UploadPage = () => {
    const [files, setFiles] = useState([]);
    const [expiryTime, setExpiryTime] = useState('24h');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedLinks, setUploadedLinks] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [copiedLink, setCopiedLink] = useState(null);
    const fileInputRef = useRef(null);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validateFile = (file) => {
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            setError('File size must be less than 100MB');
            return false;
        }
        setError('');
        return true;
    };

    const handleFiles = useCallback((fileList) => {
        const newFiles = [];
        Array.from(fileList).forEach(file => {
            if (validateFile(file)) {
                const uploadedFile = {
                    file,
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    size: formatFileSize(file.size),
                    type: file.type
                };
                newFiles.push(uploadedFile);
            }
        });
        setFiles(prev => [...prev, ...newFiles]);
    }, []);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    }, [handleFiles]);

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const removeFile = (id) => {
        setFiles(prev => prev.filter(file => file.id !== id));
    };

    const generateLink = async (file) => {
        setIsUploading(true);
        setError('');

        try {
            // 1. Encrypt the file in the browser using the handler
            const { encryptedBlob, base64Key } = await encryptFile(file.file);

            // 2. Upload the encrypted blob using your apiService
            const result = await apiService.uploadFile(encryptedBlob, expiryTime);

            if (result.success) {
                // 3. Construct the frontend URL with the decryption key in the hash
                const encodedFilename = encodeURIComponent(file.name);
                const frontendUrl = `${window.location.origin}/view/${result.fileId}#key=${base64Key}&filename=${encodedFilename}`;
                
                setUploadedLinks(prev => [...prev, {
                    id: file.id,
                    link: frontendUrl,
                    fileName: file.name
                }]);
                
                // Remove file from upload list after successful upload
                setFiles(prev => prev.filter(f => f.id !== file.id));
            } else {
                setError(`Failed to upload ${file.name}: ${result.error}`);
            }
        } catch (err) {
            console.error(err);
            setError(`Failed to upload ${file.name}. Encryption failed or network error.`);
        } finally {
            setIsUploading(false);
        }
    };

    const copyToClipboard = async (link, id) => {
        try {
            await navigator.clipboard.writeText(link);
            setCopiedLink(id);
            setTimeout(() => setCopiedLink(null), 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy link');
        }
    };

    const expiryOptions = [
        { value: '1h', label: '1 Hour' }, { value: '6h', label: '6 Hours' },
        { value: '12h', label: '12 Hours' }, { value: '24h', label: '1 Day' },
        { value: '3d', label: '3 Days' }, { value: '7d', label: '1 Week' },
        { value: '30d', label: '30 Days' }
    ];

    return (
        <div className="upload-page">
            <div className="upload-container">
                <motion.div
                    className="upload-card"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="upload-title">Upload & Share Securely</h1>
                    <p className="upload-subtitle">Files are encrypted end-to-end in your browser.</p>

                    <div
                        className={`upload-area ${dragActive ? 'dragover' : ''}`}
                        onDragEnter={handleDrag} onDragLeave={handleDrag}
                        onDragOver={handleDrag} onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="upload-icon" />
                        <p className="upload-text">Drag and drop files here or click to browse</p>
                        <p className="upload-hint">Supports any file type up to 100MB</p>
                        <input
                            ref={fileInputRef} type="file" multiple
                            onChange={handleFileInput} style={{ display: 'none' }}
                        />
                    </div>

                    {error && (
                        <motion.div
                            className="error-box"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <AlertCircle size={20} />
                            {error}
                        </motion.div>
                    )}

                    {files.length > 0 && (
                        <div className="file-list-container">
                            <h3 className="list-title">Selected Files:</h3>
                            {files.map((file) => (
                                <motion.div
                                    key={file.id} className="file-item"
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                >
                                    <div className="file-details">
                                        <File size={20} />
                                        <div>
                                            <p className="file-name">{file.name}</p>
                                            <p className="file-size">{file.size}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => removeFile(file.id)} className="remove-file-btn">
                                        <X size={20} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="expiry-section">
                        <label className="expiry-label">
                            <Clock size={16} /> Link Expiry Time
                        </label>
                        <select
                            className="expiry-select" value={expiryTime}
                            onChange={(e) => setExpiryTime(e.target.value)}
                        >
                            {expiryOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>

                    {files.length > 0 && (
                        <button
                            className="upload-button"
                            onClick={() => files.forEach(file => generateLink(file))}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Uploading...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
                        </button>
                    )}

                    {uploadedLinks.length > 0 && (
                        <div className="links-container">
                            <h3 className="list-title">Generated Links:</h3>
                            {uploadedLinks.map(({ id, link, fileName }) => (
                                <motion.div
                                    key={id} className="link-result"
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="link-details">
                                        <p className="link-filename">{fileName}</p>
                                        <div className="flex flex gap-3 items-center">
                                            <input type="text" readOnly value={link} className="link-text" />
                                            <button className="copy-button flex gap-3 justify-center items-center" onClick={() => copyToClipboard(link, id)}>
                                                {copiedLink === id ? <ShieldCheck size={16} /> : <Copy size={16} />}
                                                {copiedLink === id ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                             <div className="warning-box">
                                <AlertCircle size={32} />
                                <div>
                                    <strong>Keep this link safe!</strong> It contains the decryption key. Without it, the file cannot be recovered. The link is valid for one view only.
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="info-section">
                        <h4>How it works:</h4>
                        <ul>
                            <li>• Your file is encrypted in your browser before upload.</li>
                            <li>• Get a secure, one-time access link with the key.</li>
                            <li>• The link expires after the first download or time limit.</li>
                            <li>• Your encrypted files are permanently deleted from our servers after expiry.</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UploadPage;
