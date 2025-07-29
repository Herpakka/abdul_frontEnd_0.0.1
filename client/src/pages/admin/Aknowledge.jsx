import { useEffect, useState, useMemo } from 'react';
import Axios from 'axios';

export default function Aknowledge() {
    const [knowledge, setKnowledge] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

    // Upload states
    const [selectedFiles, setSelectedFiles] = useState(null); // Changed to handle multiple files
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const [responseText, setResponseText] = useState('');
    const [uploadMode, setUploadMode] = useState(1); // 0 for test, 1 for production
    const [cancelSource, setCancelSource] = useState(null);

    // URLs from your index.js
    const n8nTest = "http://localhost:5678/webhook-test/splitpage";

    useEffect(() => {
        const fetchKnowledge = async () => {
            try {
                const response = await Axios.get(process.env.REACT_APP_PROGRAM_URL || 'http://localhost:5678/webhook/getkprog');
                if (Array.isArray(response.data)) {
                    setKnowledge(response.data);
                } else {
                    setKnowledge([]);
                }
            } catch (err) {
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };
        fetchKnowledge();
    }, []);

    // Handle file selection (adapted from your index.js)
    const handleFileSelect = (event) => {
        const files = event.target.files;
        setSelectedFiles(files);
        setUploadStatus('');
        setResponseText('');
        setUploadProgress(0);

        // Log file info like in your original code
        if (files.length > 0) {
            console.log('type', files[0].type);
            console.log('size', files[0].size);
        }
    };

    // Handle file upload (adapted from your uploadFile function)
    const handleUpload = async () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            setUploadStatus('Please choose a file to upload');
            return;
        }

        // Check if test mode has valid URL (like in your original code)
        if (uploadMode === 0 && !n8nTest) {
            setUploadStatus('Test URL is not configured');
            return;
        }

        const targetUrl = uploadMode === 0 ? n8nTest : process.env.REACT_APP_UPLOAD_URL;

        // Create FormData and append files with "test" key (exactly like your index.js)
        const formData = new FormData();
        formData.append('test', selectedFiles[0]);

        // Add additional files if multiple selected
        for (let i = 1; i < selectedFiles.length; i++) {
            formData.append('test', selectedFiles[i]);
        }

        // Create cancel token source
        const source = Axios.CancelToken.source();
        setCancelSource(source);

        setUploading(true);
        setUploadProgress(0);
        setUploadStatus(`Starting upload to ${uploadMode === 0 ? 'Test' : 'Production'}...`);
        setResponseText('');

        console.log('Uploading to:', targetUrl, '(Mode:', uploadMode === 0 ? 'Test' : 'Production', ')');

        try {
            const response = await Axios.post(targetUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
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

            // Success response (adapted from your success handling)
            setUploadStatus('Upload successful!');
            setResponseText(`URL: ${targetUrl}

Status: ${response.status} ${response.statusText}

Response Data:
${JSON.stringify(response.data, null, 2)}`);

            console.log('Upload response:', response);

            // Refresh the knowledge list after successful upload
            const refreshResponse = await Axios.get(process.env.REACT_APP_PROGRAM_URL || 'http://localhost:5678/webhook/getkprog');
            if (Array.isArray(refreshResponse.data)) {
                setKnowledge(refreshResponse.data);
            }

            // Reset form
            setSelectedFiles(null);
            const fileInput = document.getElementById('file-upload');
            if (fileInput) fileInput.value = '';

        } catch (err) {
            if (Axios.isCancel(err)) {
                setUploadStatus('Upload was cancelled by user');
                setResponseText('Upload was cancelled');
                console.log('Upload was cancelled');
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

    // Cancel upload function
    const cancelUpload = () => {
        if (cancelSource) {
            cancelSource.cancel('User cancelled upload');
            setUploadStatus('Upload cancelled');
        } else {
            setUploadStatus('No active upload to cancel');
        }
    };

    // Filtered data based on search term
    const filteredKnowledge = useMemo(() => {
        if (!searchTerm) return knowledge;
        return knowledge.filter((item) =>
            Object.values(item).some((val) =>
                val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [knowledge, searchTerm]);

    // Calculate pagination data
    const pageCount = Math.ceil(filteredKnowledge.length / itemsPerPage);
    const paginatedKnowledge = filteredKnowledge.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Handle page change
    const goToPage = (page) => {
        if (page < 1 || page > pageCount) return;
        setCurrentPage(page);
    };

    if (loading)
        return (
            <p className="text-center text-gray-500 mt-10 text-lg">Loading...</p>
        );
    if (error)
        return (
            <p className="text-center text-red-500 mt-10 text-lg font-semibold">
                {error}
            </p>
        );

    return (
        <div className="max-w-7xl mx-auto p-4">
            <h2 className="text-3xl font-bold mb-6 text-center">Knowledge Base Management</h2>

            {/* Upload Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Upload New Knowledge Base Files</h3>

                <div className="flex flex-col space-y-4">
                    {/* Mode Selection */}
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

                    {/* File Input */}
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

                    {/* Progress Bar */}
                    {uploading && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    )}

                    {/* Status */}
                    {uploadStatus && (
                        <div className={`p-3 rounded-md ${uploadStatus.includes('successful')
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

                    {/* Response Text */}
                    {responseText && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Server Response:
                            </label>
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

            {/* Search and Count Section */}
            <div className="mb-4 flex justify-between items-center">
                <input
                    type="search"
                    className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search knowledge base..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    aria-label="Search knowledge"
                />

                <p className="ml-4 text-gray-700">
                    Showing{' '}
                    <span className="font-semibold">
                        {paginatedKnowledge.length}
                    </span>{' '}
                    of <span className="font-semibold">{filteredKnowledge.length}</span> items
                </p>
            </div>

            {/* Data Table */}
            {knowledge.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">No knowledge base files found.</p>
                    <p className="text-gray-400 text-sm mt-2">Upload some files to get started.</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 table-auto">
                            <thead className="bg-gray-100">
                                <tr>
                                    {[
                                        'Filename',
                                        'File Size',
                                        'Degree Name',
                                        'Revision Year',
                                        'Campus',
                                        'Faculty',
                                        'Department',
                                        'Thai Name',
                                        'English Name',
                                        'Program Type',
                                    ].map((header) => (
                                        <th
                                            key={header}
                                            className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-300"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedKnowledge.map((item, index) => (
                                    <tr
                                        key={`${item.filename}-${index}`}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate">
                                            {item.filename}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                            {item.filesize}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                            {item.degree_name}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                            {item.revision_year}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                            {item.campus}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                            {item.faculty}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                            {item.department}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                            {item.thai_name}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                            {item.english_name}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                            {item.program_type}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <nav
                        className="flex justify-center items-center space-x-2 mt-6 select-none"
                        aria-label="Pagination"
                    >
                        <button
                            className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            aria-label="Previous page"
                        >
                            &laquo;
                        </button>

                        {[...Array(pageCount).keys()].map((num) => {
                            const page = num + 1;
                            return (
                                <button
                                    key={page}
                                    className={`px-3 py-1 rounded-md border ${page === currentPage
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                        }`}
                                    onClick={() => goToPage(page)}
                                    aria-current={page === currentPage ? 'page' : undefined}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === pageCount || pageCount === 0}
                            aria-label="Next page"
                        >
                            &raquo;
                        </button>
                    </nav>
                </>
            )}
        </div>
    );
}
