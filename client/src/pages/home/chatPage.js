// src/components/FileUpload.js
import React, { useState, useRef } from 'react';
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  XMarkIcon,
  PhotoIcon 
} from '@heroicons/react/24/outline';

const FileUpload = ({ 
  onFilesSelected, 
  maxFiles = 5, 
  maxSize = 25, // MB
  acceptedTypes = ['application/pdf', '.doc', '.docx', '.txt', 'xlsx', 'csv']
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    setError('');
    const newFiles = Array.from(fileList);
    
    // Validate file count
    if (files.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file size
    const oversizedFiles = newFiles.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesSelected?.(updatedFiles);
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesSelected?.(updatedFiles);
  };

  const openFileExplorer = () => {
    inputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="h-5 w-5 text-blue-500" />;
    }
    return <DocumentIcon className="h-5 w-5 text-gray-500" />;
  };

  const upload = async(file) => {
    if(!file.length){
      return alert('Please choose a file to upload')
    }

    const formData = new FormData()
    
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleChange}
          accept={acceptedTypes.join(',')}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-4">
          <div className={`p-3 rounded-full ${dragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <CloudArrowUpIcon className={`h-8 w-8 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>

          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              {dragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-500">
              or{' '}
              <button
                onClick={openFileExplorer}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                browse files
              </button>
            </p>
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>Supports: PDF, DOC, DOCX, TXT, XLSX, CSV</p>
            <p>Max {maxFiles} files • Up to {maxSize}MB each</p>
          </div>
        </div>

        {/* Drag Overlay */}
        {dragActive && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-50 rounded-lg flex items-center justify-center">
            <div className="text-blue-600 font-medium">Release to upload</div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-gray-700">
            Uploaded Files ({files.length})
          </h3>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
