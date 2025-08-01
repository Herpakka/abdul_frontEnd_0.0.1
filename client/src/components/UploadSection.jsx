import Axios from 'axios';

export default function UploadSection({
  selectedFiles,
  setSelectedFiles,
  uploading,
  uploadProgress,
  uploadStatus,
  responseText,
  uploadMode,
  setUploadMode,
  setUploadStatus,
  setResponseText,
  setUploading,
  setUploadProgress,
  cancelSource,
  setCancelSource,
  setKnowledge,
}) {
  const n8nTest = "http://localhost:5678/webhook-test/splitpage";

  const handleFileSelect = (event) => {
    const files = event.target.files;
    setSelectedFiles(files);
    setUploadStatus('');
    setResponseText('');
    setUploadProgress(0);

    if (files.length > 0) {
      console.log('type', files[0].type);
      console.log('size', files[0].size);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setUploadStatus('Please choose a file to upload');
      return;
    }

    if (uploadMode === 0 && !n8nTest) {
      setUploadStatus('Test URL is not configured');
      return;
    }

    const targetUrl = uploadMode === 0
      ? n8nTest
      : process.env.REACT_APP_UPLOAD_URL;

    const formData = new FormData();
    formData.append('test', selectedFiles[0]);
    for (let i = 1; i < selectedFiles.length; i++) {
      formData.append('test', selectedFiles[i]);
    }

    const source = Axios.CancelToken.source();
    setCancelSource(source);

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus(`Starting upload to ${uploadMode === 0 ? 'Test' : 'Production'}...`);
    setResponseText('');

    try {
      const response = await Axios.post(targetUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
          if (percentCompleted < 100) {
            setUploadStatus(`Uploading to ${uploadMode === 0 ? 'Test' : 'Production'}... ${percentCompleted}%`);
          }
        },
        cancelToken: source.token,
      });

      setUploadStatus('Upload successful!');
      setResponseText(`URL: ${targetUrl}
Status: ${response.status} ${response.statusText}
Response Data: ${JSON.stringify(response.data, null, 2)}`);

      // Refresh knowledge
      const refreshResponse = await Axios.get(
        process.env.REACT_APP_PROGRAM_URL || 'http://localhost:5678/webhook/getkprog'
      );
      if (Array.isArray(refreshResponse.data)) {
        setKnowledge(refreshResponse.data);
      }

      setSelectedFiles(null);
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';

    } catch (err) {
      if (Axios.isCancel(err)) {
        setUploadStatus('Upload was cancelled by user');
        setResponseText('Upload was cancelled');
      } else {
        const errorMessage = `URL: ${targetUrl}
${err.response ? `Error: ${err.message}` : ''}
${err.response && err.response.data ? `Status: ${err.response.status}` : ''}
${err.response && err.response.data ? `Server Response: ${JSON.stringify(err.response.data, null, 2)}` : ''}`;
        setUploadStatus('Upload failed!');
        setResponseText(errorMessage);
      }
    } finally {
      setUploading(false);
      setCancelSource(null);
    }
  };

  const cancelUpload = () => {
    if (cancelSource) {
      cancelSource.cancel('User cancelled upload');
      setUploadStatus('Upload cancelled');
    } else {
      setUploadStatus('No active upload to cancel');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Upload ไฟล์หลักสูตร</h3>

      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Upload Mode:</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="uploadMode"
                value={0}
                checked={uploadMode === 0}
                onChange={() => setUploadMode(0)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Test</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="uploadMode"
                value={1}
                checked={uploadMode === 1}
                onChange={() => setUploadMode(1)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Production</span>
            </label>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <input
            id="file-upload"
            type="file"
            multiple
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-md"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.txt"
          />
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFiles}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          {uploading && (
            <button
              onClick={cancelUpload}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
            >
              Cancel
            </button>
          )}
        </div>

        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {uploadStatus && (
          <div className={`p-3 rounded-md ${
            uploadStatus.includes('successful')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : uploadStatus.includes('failed') || uploadStatus.includes('cancelled')
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <p className="font-medium">{uploadStatus}</p>
            {uploading && uploadProgress > 0 && (
              <p className="text-sm mt-1">{uploadProgress}% completed</p>
            )}
          </div>
        )}

        {responseText && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Server Response:</label>
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
              value={responseText}
              readOnly
              placeholder="Server response will appear here..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
