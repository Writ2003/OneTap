import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
    File, 
    Eye, 
    ArrowLeft, 
    XCircle, 
    Loader2 // A dedicated loader icon
} from 'lucide-react';
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
            return <img src={url} alt={filename} className="max-w-full max-h-[75vh] object-contain rounded-md" />;
        }
        if (type === 'application/pdf') {
            return <embed src={url} type="application/pdf" className="w-full h-[75vh] border-none rounded-md" />;
        }
        if (type.startsWith('text/')) {
            return <pre className="bg-slate-800 text-slate-300 p-4 rounded-md w-full h-full text-left whitespace-pre-wrap break-words overflow-auto">{textContent}</pre>;
        }
        return (
            <div className="flex flex-col items-center gap-4 text-slate-500 p-10">
                <File size={60} />
                <p>Preview is not available for this file type.</p>
                <span className="font-medium text-slate-300">{filename}</span>
            </div>
        );
    };

    const renderContent = () => {
        switch (status) {
            case 'processing':
                return (
                    <div className="flex flex-col items-center text-center p-8 md:p-12 min-h-[300px] justify-center">
                        <Loader2 size={60} className="text-blue-400 animate-spin" />
                        <p className="text-slate-300 text-lg font-medium mt-6">
                            Processing File...
                        </p>
                    </div>
                );
            case 'viewing':
                return (
                    <div className="w-full">
                        <div className="flex items-center gap-3 p-4 bg-slate-900/50 border-b border-slate-700">
                            <File className="h-5 w-5 text-blue-300 flex-shrink-0" />
                            <span className="font-medium text-slate-100 truncate mr-auto" title={decryptedFile.filename}>
                                {decryptedFile.filename}
                            </span>
                            <button 
                                onClick={handleGoBack} 
                                className="flex items-center gap-1.5 py-1 px-3 rounded-md font-medium text-sm text-slate-200 bg-slate-600 hover:bg-slate-500 transition-colors"
                            >
                                <ArrowLeft size={16} /> Back
                            </button>
                        </div>
                        <div className="bg-slate-900 p-1 md:p-4 min-h-[60vh] max-h-[80vh] overflow-y-auto flex items-center justify-center">
                            {renderPreview()}
                        </div>
                    </div>
                );
            case 'error':
                 return (
                    <div className="flex flex-col items-center text-center p-8 md:p-12">
                        <XCircle size={60} className="text-red-500 mb-5" />
                        <h2 className="text-3xl font-bold text-red-400">Action Failed</h2>
                        <p className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg p-3 mt-6 w-full text-center">
                            {error}
                        </p>
                        <button 
                            onClick={handleGoBack} 
                            className="w-full sm:w-auto mt-6 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={16} /> Back to Home
                        </button>
                    </div>
                );
            default: // 'ready'
                return (
                    <div className="flex flex-col items-center text-center p-8 md:p-12">
                        <File size={60} className="text-blue-400 mb-5" />
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                            Secure File Access
                        </h1>
                        <p className="text-slate-400 mt-3 mb-8 max-w-md">
                            This is a secure, one-time access link. The file will be decrypted and shown in your browser.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <button 
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                onClick={handleProcessFile}
                            >
                                <Eye size={20} /> View File
                            </button>
                            <button 
                                className="w-full sm:w-auto bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
                                onClick={handleGoBack}
                            >
                                <ArrowLeft size={20} /> Cancel
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center p-4 -mt-[4.3rem] selection:bg-blue-500/30">
            <motion.div
                className={`w-full bg-slate-800/70 backdrop-blur-md rounded-xl mt-[5rem] shadow-2xl border border-slate-700
                    ${status === 'viewing' ? 'max-w-4xl overflow-hidden' : 'max-w-xl'}
                `}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            >
                {renderContent()}
            </motion.div>
            
            {/* The entire <style> block is now gone! */}
        </div>
    );
};

export default ViewPage;