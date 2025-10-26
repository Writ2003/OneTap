const API_BASE_URL = 'https://respectable-jaclyn-koyebuser1-38d6aeac.koyeb.app/api';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Convert expiry time string to minutes
    convertExpiryToMinutes(expiryTime) {
        const timeMap = {
            '1h': 60,
            '6h': 360,
            '12h': 720,
            '24h': 1440,
            '3d': 4320,
            '7d': 10080,
            '30d': 43200
        };
        return timeMap[expiryTime] || 1440; // default to 24 hours
    }

    // Upload file to the backend
    async uploadFile(file, expiryTime = '24h') {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const expiryMinutes = this.convertExpiryToMinutes(expiryTime);
            
            const response = await fetch(`${this.baseURL}/files/upload?expiryMinutes=${expiryMinutes}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${errorText}`);
            }

            // Expecting JSON response: { "fileId": "...", "viewUrl": "..." }
            const link = await response.text(); 
            const fileId = link.split('/').pop();

            return {
                success: true,
                link, 
                fileId
            };
        } catch (error) {
            console.error('Upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }


    // Download file from the backend
    async downloadFile(fileId) {
        try {
            const response = await fetch(`${this.baseURL}/files/view/${fileId}`, {
                method: 'GET',
            });

            if (!response.ok) {
                 if (response.status === 404) {
                    throw new Error('File not found. It may have expired or already been downloaded.');
                }
                const errorText = await response.text();
                throw new Error(`Download failed: ${errorText}`);
            }
            
            // Filename is no longer read from Content-Disposition.
            // It will be passed via the URL hash.
            const blob = await response.blob();
            return {
                success: true,
                blob: blob,
            };
        } catch (error) {
            console.error('Download error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Helper method to trigger file download in the browser
    downloadFileFromBlob(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}
const apiService = new ApiService();
export default apiService