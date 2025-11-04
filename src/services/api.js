const API_BASE_URL = 'https://respectable-jaclyn-koyebuser1-38d6aeac.koyeb.app/api';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Convert expiry time string to minutes
    convertExpiryToMinutes(value, unit) {
        const numericValue = parseInt(value, 10) || 1;
        
        if (unit === 'hours') {
            return numericValue * 60;
        }
        if (unit === 'days') {
            return numericValue * 24 * 60;
        }
        // Default is minutes
        return numericValue;
    }

    async getRedisUsage() {
        try {
            const response = await fetch(`${this.baseURL}/redis/usage`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch usage: ${errorText}`);
            }
            const data = await response.json();
            console.log("Redis usage: ", data);
            
            // --- IMPORTANT ---
            // Assuming the API returns an object like: { "available_bytes": 50000000 }
            // If your API returns something else (e.g., used_memory, max_memory),
            // you must adjust this logic.
            if (data?.peakMemoryMB === undefined || data.usedMemoryMB === undefined) {
                console.warn('API did not return available_bytes. Assuming 15MB free.');
                // Fallback to a large number if the API is not as expected
                return { success: true, available_bytes: 15*1024*1024 }; 
            }
            
            return { success: true, available_bytes: (data.peakMemoryMB - data.usedMemoryMB)*1024*1024 };
        } catch (error) {
            console.error('Redis usage error:', error);
            return { success: false, error: error.message };
        }
    }

    // Upload file to the backend
    async uploadFile(file, expiryValue = 1, expiryUnit = "days") {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const expiryMinutes = this.convertExpiryToMinutes(expiryValue, expiryUnit);
            
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