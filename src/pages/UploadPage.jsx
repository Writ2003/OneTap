import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import { encryptFile } from '../utils/encryptionHandler';
import { ToastContainer, toast } from 'react-toastify';
import ClickSpark from '../components/ui/clickSpark';
import { 
    Upload, 
    File, 
    X, 
    Clock, 
    AlertCircle, 
    Copy, 
    ShieldCheck,
    CheckCircle
} from 'lucide-react';


const UploadPage = () => {
    const [files, setFiles] = useState([]);
    const [expiryValue, setExpiryValue] = useState(1);
    const [expiryUnit, setExpiryUnit] = useState('days');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedLinks, setUploadedLinks] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
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
            toast.error(`File is too large. Max size is 100MB.`);
            return false;
        }

        const fileType = file.type;
        const isImage = fileType.startsWith('image/');
        const isPdf = fileType === 'application/pdf';
        const isText = fileType.startsWith('text/');

        if (!isImage && !isPdf && !isText) {
            toast.error(`File type (${fileType || 'unknown'}) is not supported for in-browser preview.`);
            return false;
        }

        return true;
    };

    const handleFiles = useCallback((fileList) => {
        const newFiles = [];
        const file = fileList[0];
        
        if (file && validateFile(file)) {
            newFiles.push({
                file,
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: formatFileSize(file.size),
            });
        }
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
        if (files.length === 0) return;
        
        const fileToUpload = files[0];

       if(expiryValue <= 0) {
            toast.error("Expiry time cannot be zero or negative!")
            return;
        }
        
        setIsUploading(true);
        setError('');

        const toastId = toast.loading("Checking storage...");
        try {
            const usage = await apiService.getRedisUsage();

            if (!usage.success) {
                throw new Error(`Storage check failed: ${usage.error}`);
            }

            if (fileToUpload.file.size > usage.available_bytes) {
                const errorMessage = `Not enough storage. Required: ${formatFileSize(fileToUpload.file.size)}, Available: ${formatFileSize(usage.available_bytes)}`;
                toast.update(toastId, { render: errorMessage, type: "error", isLoading: false, autoClose: 5000 });
                removeFile(fileToUpload.id);
                setIsUploading(false);
                return;
            }

            toast.update(toastId, { render: `Encrypting ${fileToUpload.name}...` });
            const { encryptedBlob, base64Key } = await encryptFile(fileToUpload.file);

            toast.update(toastId, { render: `Uploading ${fileToUpload.name}...` });
            const result = await apiService.uploadFile(encryptedBlob, expiryValue, expiryUnit);

            if (result.success) {
                const encodedFilename = encodeURIComponent(fileToUpload.name);
                const frontendUrl = `${window.location.origin}/view/${result.fileId}#key=${base64Key}&filename=${encodedFilename}`;
                
                setUploadedLinks(prev => [...prev, {
                    id: fileToUpload.id,
                    link: frontendUrl,
                    fileName: fileToUpload.name,
                    copied: false // Add 'copied' state for UI
                }]);

                toast.update(toastId, { render: `Uploaded ${fileToUpload.name}!`, type: "success", isLoading: false, autoClose: 5000 });
                setFiles([]);
            } else {
                setError(`Failed to upload ${fileToUpload.name}: ${result.error}`);
                toast.update(toastId, { render: `Failed to upload ${fileToUpload.name}.`, type: "error", isLoading: false, autoClose: 5000 });
            }
        } catch (err) {
            console.error(err);
            const errorMsg = `Failed to upload ${fileToUpload.name}. Encryption failed or network error.`;
            setError(errorMsg);
            toast.update(toastId, { render: errorMsg, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            setIsUploading(false);
        }
    };

    const copyToClipboard = (link, fileId) => {
        navigator.clipboard.writeText(link).then(() => {
            setUploadedLinks(prev => prev.map(l => 
                l.id === fileId ? { ...l, copied: true } : { ...l, copied: false }
            ));
            setTimeout(() => {
                setUploadedLinks(prev => prev.map(l => 
                    l.id === fileId ? { ...l, copied: false } : l
                ));
            }, 2500);
        }).catch(err => {
            console.error('Failed to copy', err);
            toast.error('Failed to copy link.');
        });
    };

    return (
        <div className="min-h-screen p-4 bg-slate-900 text-slate-200 flex items-center justify-center -mt-[4.3rem] selection:bg-blue-500/30">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            
            <div className="w-full max-w-2xl mt-[5rem]">
                <motion.div
                    className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl p-6 md:p-10 border border-slate-700"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                >
                    <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                        Upload & Share Securely
                    </h1>
                    <p className="text-center text-slate-400 mt-2 mb-6">
                        Files are encrypted end-to-end in your browser.
                    </p>

                    <ClickSpark
                      sparkColor='#fff'
                      sparkSize={10}
                      sparkRadius={15}
                      sparkCount={8}
                      duration={400}
                    >
                        <div
                            className={`border-2 border-dashed border-slate-600 rounded-lg p-10 md:p-12 text-center cursor-pointer transition-all duration-300 ease-in-out
                                ${dragActive ? 'border-solid border-blue-500 bg-blue-900/30 ring-2 ring-blue-500' 
                                            : 'hover:border-blue-500 hover:bg-slate-700/50'}`
                            }
                            onDragEnter={handleDrag} onDragLeave={handleDrag}
                            onDragOver={handleDrag} onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mx-auto h-12 w-12 text-blue-400 mb-3" />
                            <p className="text-slate-300 font-medium">
                                Drag and drop a file or click to browse
                            </p>
                            <p className="text-slate-500 text-sm mt-1">
                                Only previewable files (images, text, PDF) up to 100MB
                            </p>
                            <input
                                ref={fileInputRef} type="file"
                                onChange={handleFileInput} style={{ display: 'none' }}
                            />
                        </div>
                    </ClickSpark>

                    {error && (
                        <motion.div
                            className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg p-3 flex items-center gap-3 mt-4"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {files.length > 0 && (
                        <div className="mt-6 space-y-3">
                            {/* We only allow one file, so this map will only run once */}
                            {files.map((file) => (
                                <motion.div
                                    key={file.id} 
                                    className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between transition-all"
                                    initial={{ opacity: 0, x: -20 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <File className="h-6 w-6 text-blue-300 flex-shrink-0" />
                                        <div className="flex flex-col min-w-0">
                                            <p className="font-medium text-slate-100 truncate" title={file.name}>{file.name}</p>
                                            <p className="text-sm text-slate-400">{file.size}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => removeFile(file.id)} 
                                        className="text-slate-500 hover:text-red-400 transition-colors rounded-full p-1"
                                        aria-label="Remove file"
                                    >
                                        <X size={20} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {files.length > 0 && (
                        <div className="mt-6 bg-slate-700/30 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className='flex items-center gap-2 text-slate-300 font-medium'>
                                <Clock size={18} />
                                <span>Link Expires in:</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={expiryValue}
                                    onChange={(e) => setExpiryValue(e.target.value)}
                                    className="bg-slate-800 border border-slate-600 rounded-md p-2 w-20 text-center text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    min="1"
                                />
                                <select 
                                    value={expiryUnit} 
                                    onChange={(e) => setExpiryUnit(e.target.value)} 
                                    className="bg-slate-800 border border-slate-600 rounded-md p-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="minutes">Minutes</option>
                                    <option value="hours">Hours</option>
                                    <option value="days">Days</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {files.length > 0 && (
                        <button
                            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg 
                                       transition-all duration-300 ease-in-out transform 
                                       hover:scale-[1.02] hover:shadow-blue-500/30
                                       active:scale-[0.98]
                                       disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
                            onClick={generateLink} // Changed this: it was looping, but you only upload one file
                            disabled={isUploading}
                        >
                            {isUploading ? 'Uploading...' : 'Generate Secure Link'}
                        </button>
                    )}

                    {uploadedLinks.length > 0 && (
                        <div className="mt-8 space-y-4">
                            <h3 className="text-lg font-semibold text-slate-200">Generated Link:</h3>
                            {uploadedLinks.map(({ id, link, fileName, copied }) => (
                                <motion.div
                                    key={id} 
                                    className="bg-slate-800 border border-slate-700 rounded-lg p-4"
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <p className="font-medium text-slate-200 mb-2 truncate" title={fileName}>{fileName}</p>
                                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={link} 
                                            className="bg-slate-700/50 text-slate-300 rounded-md p-2 w-full truncate border border-slate-600 focus:outline-none" 
                                        />
                                        <button 
                                            className={`font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-all duration-200 w-full sm:w-auto flex-shrink-0
                                                ${copied ? 'bg-green-600 text-white' 
                                                        : 'bg-slate-600 hover:bg-slate-500 text-slate-200'}`
                                            }
                                            onClick={() => copyToClipboard(link, id)}
                                        >
                                            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                             <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 rounded-lg p-4 flex items-start gap-3 mt-6">
                                <AlertCircle size={32} className="flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-yellow-200">Keep this link safe!</strong> It contains the decryption key. Without it, the file cannot be recovered.
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 text-sm text-slate-400 border-t border-slate-700 pt-6">
                        <h4 className="font-semibold text-slate-300 mb-2">How it works:</h4>
                        <ul className="space-y-1 list-inside">
                            <li className='flex gap-2 items-start'><span className='text-blue-400'>•</span>Your file is encrypted in your browser before upload.</li>
                            <li className='flex gap-2 items-start'><span className='text-blue-400'>•</span>Get a secure, one-time access link with the key.</li>
                            <li className='flex gap-2 items-start'><span className='text-blue-400'>•</span>The link expires after the first view or time limit.</li>
                            <li className='flex gap-2 items-start'><span className='text-blue-400'>•</span>Your encrypted files are permanently deleted from our servers.</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UploadPage;
