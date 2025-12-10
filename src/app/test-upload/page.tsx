'use client';

import React, { useState } from 'react';
import { ImageUploader } from '@/components/ui/image-upload';

export default function TestUploadPage() {
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

    return (
        <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                Image Uploader Test
            </h1>

            <p style={{ marginBottom: '2rem', color: '#666' }}>
                Test the reusable image uploader component below. Images will be uploaded to the 'test' folder in Vercel Blob.
            </p>

            <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <ImageUploader
                    folder="test"
                    maxFiles={5}
                    onUploadComplete={(urls) => {
                        console.log('Upload complete:', urls);
                        setUploadedUrls(prev => [...prev, ...urls]);
                        alert(`Successfully uploaded ${urls.length} images!`);
                    }}
                    onUploadError={(err) => {
                        console.error('Upload error:', err);
                        alert('Upload failed. Check console.');
                    }}
                />
            </div>

            {uploadedUrls.length > 0 && (
                <div style={{ marginTop: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Uploaded Results</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {uploadedUrls.map((url, i) => (
                            <div key={i} style={{ border: '1px solid #ccc', padding: '0.5rem', borderRadius: '4px' }}>
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                    <img src={url} alt="Uploaded" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                                </a>
                                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', wordBreak: 'break-all' }}>
                                    {url.split('/').pop()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
