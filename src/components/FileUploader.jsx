import React, { useState, useRef } from 'react';
import { coreApi } from '../api/axios';
import { useToast } from '../contexts/ToastContext';

const FileUploader = ({ onUploadSuccess, onUploadError, allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'], label = "Upload File" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const upload = async (file) => {
    if (!file) return;
    
    // Check type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type) && !file.name.endsWith('.ppt') && !file.name.endsWith('.pptx')) {
      const errorMsg = `Invalid file type. Please upload: ${allowedTypes.join(', ')}`;
      if (onUploadError) onUploadError(errorMsg);
      else addToast(errorMsg, "error");
      return;
    }

    // Check size (20MB)
    const limit = 20 * 1024 * 1024;
    if (file.size > limit) {
      const errorMsg = "File size exceeds the 20MB limit.";
      if (onUploadError) onUploadError(errorMsg);
      else addToast(errorMsg, "error");
      return;
    }

    setFileName(file.name);
    setIsUploading(true);
    setProgress(15);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setProgress(40);
      const response = await coreApi.post('/uploads/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(Math.max(40, percentCompleted));
        }
      });
      
      setProgress(100);
      setIsUploading(false);
      if (onUploadSuccess) onUploadSuccess(response.data.data.url, response.data.data);
    } catch (error) {
      setIsUploading(false);
      const errMsg = error.response?.data?.message || "File upload failed. Please try again.";
      if (onUploadError) onUploadError(errMsg);
      else addToast(errMsg, "error");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      upload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      upload(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[140px] ${
        isDragging
          ? 'border-violet-500 bg-violet-50/50'
          : isUploading
          ? 'border-indigo-400 bg-slate-50/50 cursor-not-allowed'
          : 'border-slate-200 hover:border-violet-400 bg-white hover:bg-slate-50/50'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />

      {isUploading ? (
        <div className="w-full max-w-[240px] flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-3"></div>
          <p className="text-xs text-slate-500 truncate w-full mb-2">Uploading: {fileName}</p>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-violet-600 h-1 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 mb-3 border border-violet-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          <span className="text-xs text-slate-400 mt-1">Drag and drop or click to browse</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
