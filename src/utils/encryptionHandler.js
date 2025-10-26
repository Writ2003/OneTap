export const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};

/**
 * Converts a URL-safe Base64 string back to an ArrayBuffer.
 * @param {string} base64 The Base64 string to convert.
 * @returns {ArrayBuffer} The resulting ArrayBuffer.
 */
const base64ToArrayBuffer = (base64) => {
    // Replace URL-safe characters with standard Base64 characters
    const standardBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    const binary_string = window.atob(standardBase64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
};

export const encryptFile = async (file) => {
    const key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV is recommended for AES-GCM
    const fileData = await file.arrayBuffer();
    
    const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        fileData
    );

    // Prepend the IV to the ciphertext for storage
    const encryptedData = new Uint8Array(iv.length + ciphertext.byteLength);
    encryptedData.set(iv, 0);
    encryptedData.set(new Uint8Array(ciphertext), iv.length);

    const exportedKey = await window.crypto.subtle.exportKey('raw', key);
    const base64Key = arrayBufferToBase64(exportedKey);
    
    return {
        encryptedBlob: new Blob([encryptedData]),
        base64Key: base64Key,
    };
};

/**
 * Decrypts data using a given key.
 * @param {ArrayBuffer} encryptedData The data to decrypt (IV prepended).
 * @param {string} base64Key The encryption key in Base64 format.
 * @returns {Promise<ArrayBuffer>} The decrypted file data as an ArrayBuffer.
 */
export const decryptFile = async (encryptedData, base64Key) => {
    const keyData = base64ToArrayBuffer(base64Key);
    const key = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        true,
        ['decrypt']
    );

    // The IV is the first 12 bytes of the encrypted data.
    const iv = encryptedData.slice(0, 12);
    const ciphertext = encryptedData.slice(12);

    // Decrypt the ciphertext.
    const decryptedData = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        ciphertext
    );

    return decryptedData;
};