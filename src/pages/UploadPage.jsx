import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Clock, Copy, AlertCircle, File, X, ShieldCheck } from 'lucide-react';
import apiService from '../services/api';
import { encryptFile } from '../utils/encryptionHandler';
import { ToastContainer, toast } from 'react-toastify';

const UploadPage = () => {
    const [files, setFiles] = useState([]);
    const [expiryValue, setExpiryValue] = useState(1);
    const [expiryUnit, setExpiryUnit] = useState('days');
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

    /**
     * UPDATED: Validates file size and MIME type.
     * Only allows types previewable in the browser.
     */
    const validateFile = (file) => {
        const maxSize = 100 * 1024 * 1024; // 100MB

        if (file.size > maxSize) {
            showToast(`File is too large. Max size is 100MB.`, 'error');
            return false;
        }

        const fileType = file.type;
        const isImage = fileType.startsWith('image/');
        const isPdf = fileType === 'application/pdf';
        const isText = fileType.startsWith('text/');

        // Only allow files that can be previewed in ViewPage.jsx
        if (!isImage && !isPdf && !isText) {
            toast.error(`File type (${fileType || 'unknown'}) is not supported for in-browser preview.`);
            return false;
        }

        return true;
    };

    const handleFiles = useCallback((fileList) => {
        const newFiles = [];
        // Only take the first file from the list
        const file = fileList[0];
        
        if (file && validateFile(file)) {
            newFiles.push({
                file,
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: formatFileSize(file.size),
            });
        }
        // Replace the existing file list with the new single file
        setFiles(newFiles);
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

    const generateLink = async () => {
        if (files.length === 0) return; // No file to upload
        
        const fileToUpload = files[0]; // Get the single file
        
        setIsUploading(true);
        setError('');

        const toastId = toast.loading("Checking storage..."); // Start loading toast
        try {

            // --- 1. NEW: PRE-FLIGHT CHECK ---
            const usage = await apiService.getRedisUsage();

            if (!usage.success) {
                throw new Error(`Storage check failed: ${usage.error}`);
            }

            if (fileToUpload.file.size > usage.available_bytes) {
                const errorMessage = `Not enough storage for ${fileToUpload.name}. Required: ${formatFileSize(fileToUpload.file.size)}, Available: ${formatFileSize(usage.available_bytes)}`;
                toast.update(toastId, { render: errorMessage, type: "error", isLoading: false, autoClose: 5000 });
                removeFile(fileToUpload.id); // Remove from list
                setIsUploading(false); // Stop loading
                return; // Stop this file's upload
            }

            // 2. Encrypt the file in the browser using the handler
           toast.update(toastId, { render: `Encrypting ${fileToUpload.name}...` });
            const { encryptedBlob, base64Key } = await encryptFile(fileToUpload.file);

            // 3. Upload the encrypted blob using your apiService
            toast.update(toastId, { render: `Uploading ${fileToUpload.name}...` });
            const result = await apiService.uploadFile(encryptedBlob, expiryValue, expiryUnit);

            if (result.success) {
                // 4. Construct the frontend URL with the decryption key in the hash
                const encodedFilename = encodeURIComponent(fileToUpload.name);
                const frontendUrl = `${window.location.origin}/view/${result.fileId}#key=${base64Key}&filename=${encodedFilename}`;
                console.log("Frontend url: ", frontendUrl);
                
                setUploadedLinks(prev => [...prev, {
                    id: fileToUpload.id,
                    link: frontendUrl,
                    fileName: fileToUpload.name
                }]);

                toast.update(toastId, { render: `Uploaded ${fileToUpload.name}!`, type: "success", isLoading: false, autoClose: 5000 });
                setFiles([]); // Clear the file list
            } else {
                setError(`Failed to upload ${fileToUpload.name}: ${result.error}`);
            }
        } catch (err) {
            console.error(err);
            setError(`Failed to upload ${fileToUpload.name}. Encryption failed or network error.`);
             toast.update(toastId, { render: `Failed to upload ${fileToUpload.name}.`, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            setIsUploading(false);
        }
    };

    const copyToClipboard = (link, fileId) => {
        // Use a temporary textarea for broader compatibility
        const textArea = document.createElement('textarea');
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setUploadedLinks(prev => prev.map(l => l.id === fileId ? { ...l, copied: true } : l));
            setTimeout(() => {
                setUploadedLinks(prev => prev.map(l => l.id === fileId ? { ...l, copied: false } : l));
            }, 2000);
        } catch (err) {
            console.error('Failed to copy', err);
            toast.error('Failed to copy link.');
        }
        document.body.removeChild(textArea);
    };

    const expiryOptions = [
        { value: '1h', label: '1 Hour' }, { value: '6h', label: '6 Hours' },
        { value: '12h', label: '12 Hours' }, { value: '24h', label: '1 Day' },
        { value: '3d', label: '3 Days' }, { value: '7d', label: '1 Week' },
        { value: '30d', label: '30 Days' }
    ];

    return (
        <div className="upload-page">
            {/* --- Toast Container --- */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
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
                                    <div className="file-details flex gap-3 items-center">
                                        <File size={20} />
                                        <div className='flex gap-3'>
                                            <p className="file-name">{file.name}</p>
                                            <p className="file-size">{file.size}</p>
                                        </div>
                                        <button onClick={() => removeFile(file.id)} className="remove-file-btn">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Expiry Time & Upload Button */}
                    {files.length > 0 && (
                        <div className="my-3">
                            <div className="flex gap-3 items-center">
                                <div className='flex text-[16px] gap-1 items-center mb-1'>
                                    <Clock size={16} />
                                    <p>Link Expires in: </p>
                                </div>
                                <input
                                    type="text"
                                    value={expiryValue}
                                    onChange={(e) => setExpiryValue(e.target.value)}
                                    className="rounded-md text-center w-10 p-0.5 outline-blue-300 "
                                    min="1"
                                />
                                <select value={expiryUnit} onChange={(e) => setExpiryUnit(e.target.value)} className="rounded-md p-0.5 outline-blue-300">
                                    <option value="minutes">Minutes</option>
                                    <option value="hours">Hours</option>
                                    <option value="days">Days</option>
                                </select>
                            </div>
                        </div>
                    )}

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
                                        <div className="flex gap-3 items-center">
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
