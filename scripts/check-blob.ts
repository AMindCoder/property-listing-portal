import * as BlobMain from '@vercel/blob';
import * as BlobClient from '@vercel/blob/client';

console.log('Main exports keys:', Object.keys(BlobMain));
// console.log('Client exports keys:', Object.keys(BlobClient)); // Might fail if it's not a module

try {
    const { handleUpload } = require('@vercel/blob');
    console.log('require handleUpload type:', typeof handleUpload);
} catch (e) {
    console.log('require failed');
}
