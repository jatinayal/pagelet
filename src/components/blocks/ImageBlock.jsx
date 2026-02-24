
'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Trash } from 'lucide-react';

export default function ImageBlock({ block, onChange, readOnly }) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const imageUrl = block.content?.url;
    const caption = block.content?.caption || '';

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (file) await uploadImage(file);
    };

    const handleDragOver = (e) => {
        if (readOnly) return;
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        if (readOnly) return;
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) await uploadImage(file);
    };

    const uploadImage = async (file) => {
        if (readOnly) return;

        // Validate type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid image (JPG, PNG, WebP).');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Upload failed');
            }

            const data = await res.json();

            // Update block content with new image URL
            onChange({
                ...block.content,
                url: data.url,
                width: data.width,
                height: data.height,
                format: data.format
            });
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCaptionChange = (e) => {
        if (readOnly) return;
        onChange({
            ...block.content,
            caption: e.target.value
        });
    };

    const handleRemoveImage = () => {
        if (readOnly) return;
        onChange({ url: null }); // Clear URL to reset to upload state
    };

    // Render: Image View
    if (imageUrl) {
        return (
            <div className="relative group my-2">
                <div className="relative rounded-md overflow-hidden p-1 border border-gray-100">
                    <img
                        src={imageUrl}
                        alt="Block image"
                        className="max-w-full h-auto mx-auto block"
                        style={{ maxHeight: '600px' }}
                    />

                    {!readOnly && (
                        <button
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 p-1  hover:text-red-600 hover:cursor-pointer rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                        >
                            <Trash className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <input
                    type="text"
                    value={caption}
                    onChange={handleCaptionChange}
                    placeholder="Write a caption..."
                    readOnly={readOnly}
                    className="w-full text-sm text-gray-500 bg-transparent outline-none mt-1.5 text-center"
                />
            </div>
        );
    }

    // Render: Empty Read-Only State
    if (readOnly) {
        return (
            <div className="relative group my-2">
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-200 rounded-xl bg-gray-50/30 text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-30" />
                    <span className="text-sm font-medium">Image not available</span>
                </div>
                {caption && (
                    <div className="w-full text-sm text-gray-500 text-center mt-1.5">
                        {caption}
                    </div>
                )}
            </div>
        );
    }

    // Render: Upload State
    return (
        <div
            className={`
        relative flex flex-col items-center justify-center p-8 
        border-2 border-dashed rounded-xl transition-all
        ${isDragging ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-200 hover:bg-gray-50/40'}
        ${error ? 'border-red-300 bg-red-50/50' : ''}
    `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
                onChange={handleFileSelect}
            />

            {/* Mouth Image */}
            <img
                src={isDragging ? "/imageyes.webp" : "/imageno.webp"}
                alt="Upload Character"
                className="w-50 mb-4 transition-all duration-200 select-none pointer-events-none"
            />

            {isUploading ? (
                <div className="flex flex-col items-center gap-3 text-indigo-600">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-sm font-medium">Uploading...</span>
                </div>
            ) : (

                <div className="flex flex-col items-center gap-2 text-gray-500">
                    {error ? (
                        <>
                            <div className="text-red-500 font-medium mb-1">{error}</div>
                            <button
                                onClick={() => setError(null)}
                                className="text-xs text-indigo-600 hover:underline"
                            >
                                Try again
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="text-sm font-medium text-gray-700">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-indigo-600 hover:underline hover:cursor-pointer"
                                >
                                    Click to upload
                                </button>
                                {' '}or drag and drop
                            </div>
                            <div className="text-xs text-gray-400">
                                JPG, PNG, WebP (max 5MB)
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
