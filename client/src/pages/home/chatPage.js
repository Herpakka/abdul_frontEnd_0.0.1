// src/components/FileUpload.js
import React, { useState, useRef } from 'react';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const FileUpload = ({
  onFilesSelected,
  maxFiles = 5,
  maxSize = 25, // MB
  acceptedTypes = [
    'application/pdf',
    '.doc', '.docx', '.txt', '.rtf',
    '.xlsx', '.xls', '.csv',
    '.ppt', '.pptx',
    '.odt', '.ods', '.odp', // OpenDocument formats
    '.pages', '.numbers', '.keynote', // Apple formats
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'text/plain', 'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  uploadUrl = 'http://localhost:3001/upload'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(''); // 'success', 'error', 'cancelled'
  const inputRef = useRef(null);
  const [currentSource, setCurrentSource] = useState(null);

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
    setUploadStatus('');
    setUploadProgress(0);
    const newFiles = Array.from(fileList);

    // Validate file count
    if (files.length + newFiles.length > maxFiles) {
      setError(`สามารถอัปโหลดได้สูงสุด ${maxFiles} ไฟล์`);
      return;
    }

    // Validate file size
    const oversizedFiles = newFiles.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`ขนาดไฟล์ต้องไม่เกิน ${maxSize}MB`);
      return;
    }

    // Check file types (more comprehensive check)
    const invalidFiles = newFiles.filter(file => {
      const fileName = file.name.toLowerCase();
      const mimeType = file.type.toLowerCase();
      
      // Check by MIME type first
      if (acceptedTypes.some(type => type.startsWith('application/') || type.startsWith('text/') || type.startsWith('image/'))) {
        if (acceptedTypes.includes(mimeType)) return false;
      }
      
      // Check by file extension
      const hasValidExtension = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileName.endsWith(type.toLowerCase());
        }
        return false;
      });
      
      return !hasValidExtension;
    });

    if (invalidFiles.length > 0) {
      setError(`ไฟล์ที่ไม่รддерживается: ${invalidFiles.map(f => f.name).join(', ')}`);
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
    
    // Reset upload state when files are removed
    if (updatedFiles.length === 0) {
      setUploadProgress(0);
      setUploadStatus('');
    }
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
    const fileName = file.name.toLowerCase();
    const mimeType = file.type.toLowerCase();
    
    if (mimeType.startsWith('image/')) {
      return <PhotoIcon className="h-5 w-5 text-blue-500" />;
    } else if (fileName.endsWith('.pdf') || mimeType === 'application/pdf') {
      return <DocumentIcon className="h-5 w-5 text-red-500" />;
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || 
               mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <DocumentIcon className="h-5 w-5 text-green-500" />;
    } else if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx') || 
               mimeType.includes('presentation')) {
      return <DocumentIcon className="h-5 w-5 text-orange-500" />;
    } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx') || 
               mimeType.includes('document') || mimeType.includes('word')) {
      return <DocumentIcon className="h-5 w-5 text-blue-600" />;
    }
    return <DocumentIcon className="h-5 w-5 text-gray-500" />;
  };

  const upload = async () => {
    if (!files.length) {
      setError('กรุณาเลือกไฟล์สำหรับอัปโหลด');
      return;
    }

    // Log file information with Thai filename support
    console.log('ชื่อไฟล์:', files[0].name);
    console.log('ประเภทไฟล์:', files[0].type);
    console.log('ขนาดไฟล์:', files[0].size);

    const formData = new FormData();
    
    // Ensure proper encoding for Thai filenames
    formData.append('file', files[0], files[0].name);
    
    // Add additional metadata for Thai support
    formData.append('filename', encodeURIComponent(files[0].name));
    formData.append('originalName', files[0].name);

    // Create a new cancel token
    const source = axios.CancelToken.source();
    setCurrentSource(source);
    setIsUploading(true);
    setUploadStatus('');
    setError('');

    try {
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        onUploadProgress: function(progressEvent) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
        cancelToken: source.token,
      });

      setUploadStatus('success');
      setIsUploading(false);
      console.log('อัปโหลดสำเร็จ:', response.data);
    } catch (error) {
      setIsUploading(false);
      if (axios.isCancel(error)) {
        console.log('การอัปโหลดถูกยกเลิก');
        setUploadStatus('cancelled');
        setUploadProgress(0);
      } else {
        console.error('ข้อผิดพลาดในการอัปโหลด:', error);
        setError('เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
        setUploadStatus('error');
      }
    }
  };

  const cancelUpload = () => {
    if (currentSource) {
      currentSource.cancel('User cancelled the upload');
      setCurrentSource(null);
    }
  };

  const getProgressBarColor = () => {
    if (uploadStatus === 'success') return 'bg-green-500';
    if (uploadStatus === 'error') return 'bg-red-500';
    if (uploadStatus === 'cancelled') return 'bg-gray-400';
    return 'bg-blue-500';
  };

  const getStatusMessage = () => {
    if (uploadStatus === 'success') return 'อัปโหลดสำเร็จแล้ว!';
    if (uploadStatus === 'error') return 'การอัปโหลดล้มเหลว กรุณาลองใหม่อีกครั้ง';
    if (uploadStatus === 'cancelled') return 'การอัปโหลดถูกยกเลิก';
    if (isUploading) return `กำลังอัปโหลด... ${uploadProgress}%`;
    return '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${dragActive
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
              {dragActive ? 'วางไฟล์ที่นี่' : 'ลากและวางไฟล์ที่นี่'}
            </p>
            <p className="text-sm text-gray-500">
              หรือ{' '}
              <button
                onClick={openFileExplorer}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
                disabled={isUploading}
              >
                เลือกไฟล์
              </button>
            </p>
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>รองรับไฟล์: PDF, DOC, DOCX, TXT, RTF, XLSX, XLS, CSV, PPT, PPTX, รูปภาพ</p>
            <p>สูงสุด {maxFiles} ไฟล์ • ขนาดไฟล์ละไม่เกิน {maxSize}MB</p>
            <p>รองรับการตั้งชื่อไฟล์ภาษาไทย</p>
          </div>
        </div>

        {/* Drag Overlay */}
        {dragActive && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-50 rounded-lg flex items-center justify-center">
            <div className="text-blue-600 font-medium">ปล่อยเพื่ออัปโหลด</div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Upload Progress */}
      {(isUploading || uploadStatus) && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">ความคืบหน้าการอัปโหลด</span>
            <span className="text-sm text-gray-600">{uploadProgress}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className={`h-2.5 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          
          {getStatusMessage() && (
            <p className={`text-sm ${
              uploadStatus === 'success' ? 'text-green-600' : 
              uploadStatus === 'error' ? 'text-red-600' : 
              uploadStatus === 'cancelled' ? 'text-gray-600' : 
              'text-blue-600'
            }`}>
              {getStatusMessage()}
            </p>
          )}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              ไฟล์ที่เลือก ({files.length})
            </h3>
            
            {/* Upload Controls */}
            <div className="flex items-center space-x-2">
              {isUploading ? (
                <button
                  onClick={cancelUpload}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  <StopIcon className="h-4 w-4" />
                  <span>ยกเลิก</span>
                </button>
              ) : (
                <button
                  onClick={upload}
                  disabled={uploadStatus === 'success'}
                  className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-md transition-colors ${
                    uploadStatus === 'success' 
                      ? 'bg-green-500 text-white cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  <span>{uploadStatus === 'success' ? 'อัปโหลดแล้ว' : 'อัปโหลด'}</span>
                </button>
              )}
            </div>
          </div>

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
                  disabled={isUploading}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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