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

    // Upload file to OneTap backend
    async uploadFile(file, expiryTime = '24h') {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const expiryMinutes = this.convertExpiryToMinutes(expiryTime);
            formData.append('expiryMinutes', expiryMinutes);

            const response = await fetch(`${this.baseURL}/files/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${errorText}`);
            }

            const link = await response.text();
            return {
                success: true,
                link: link,
                fileId: link.split('/').pop() // Extract file ID from the link
            };
        } catch (error) {
            console.error('Upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Download file from OneTap backend
    async downloadFile(fileId) {
        try {
            const response = await fetch(`${this.baseURL}/files/view/${fileId}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Download failed: ${errorText}`);
            }

            // Get the filename from Content-Disposition header if available
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'downloaded-file';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            const blob = await response.blob();
            return {
                success: true,
                blob: blob,
                filename: filename
            };
        } catch (error) {
            console.error('Download error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Helper method to trigger file download
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

export default new ApiService();
