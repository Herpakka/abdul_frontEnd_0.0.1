import { useState, useEffect, useMemo } from 'react';
import Axios from 'axios';
import KnowledgeTable from '../../components/KnowledgeTable';
import Pagination from '../../components/Pagination';
import SearchAndPagination from '../../components/SearchAndPagination';
import UploadSection from '../../components/UploadSection';
import EmbedSection from '../../components/EmbedSection';

export default function Aknowledge() {
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Shared states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState('');

  // Upload states
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [responseText, setResponseText] = useState('');
  const [uploadMode, setUploadMode] = useState(1);
  const [cancelSource, setCancelSource] = useState(null);

  // Embed states
  const [selectedRow, setSelectedRow] = useState(null);
  const [embedProgress, setEmbedProgress] = useState(0);
  const [embedStatus, setEmbedStatus] = useState('');
  const [embedResponseText, setEmbedResponseText] = useState('');
  const [embedCancelSource, setEmbedCancelSource] = useState(null);

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const response = await Axios.get(
          process.env.REACT_APP_PROGRAM_URL || 'http://localhost:5678/webhook/getkprog'
        );
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

  // Filtered knowledge based on search term
  const filteredKnowledge = useMemo(() => {
    if (!searchTerm) return knowledge;
    return knowledge.filter((item) =>
      Object.values(item).some((val) =>
        val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [knowledge, searchTerm]);

  // Pagination logic
  const pageCount = Math.ceil(filteredKnowledge.length / itemsPerPage);
  const paginatedKnowledge = filteredKnowledge.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      <p className="text-center text-red-500 mt-10 text-lg font-semibold">{error}</p>
    );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">จัดการคลังความรู้หลักสูตร</h2>

      <UploadSection
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        uploading={uploading}
        uploadProgress={uploadProgress}
        uploadStatus={uploadStatus}
        responseText={responseText}
        uploadMode={uploadMode}
        setUploadMode={setUploadMode}
        setUploadStatus={setUploadStatus}
        setResponseText={setResponseText}
        setUploading={setUploading}
        setUploadProgress={setUploadProgress}
        cancelSource={cancelSource}
        setCancelSource={setCancelSource}
        setKnowledge={setKnowledge}
      />

      <EmbedSection
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        embedProgress={embedProgress}
        setEmbedProgress={setEmbedProgress}
        embedStatus={embedStatus}
        setEmbedStatus={setEmbedStatus}
        embedResponseText={embedResponseText}
        setEmbedResponseText={setEmbedResponseText}
        embedCancelSource={embedCancelSource}
        setEmbedCancelSource={setEmbedCancelSource}
        setKnowledge={setKnowledge}
      />

      <SearchAndPagination
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        paginatedItemsCount={paginatedKnowledge.length}
        filteredItemsCount={filteredKnowledge.length}
      />

      {knowledge.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No knowledge base files found.</p>
          <p className="text-gray-400 text-sm mt-2">Upload some files to get started.</p>
        </div>
      ) : (
        <>
          <KnowledgeTable
            paginatedKnowledge={paginatedKnowledge}
            selectedRow={selectedRow}
            setSelectedRow={setSelectedRow}
            setKnowledge={setKnowledge}
          />
          <Pagination
            currentPage={currentPage}
            pageCount={pageCount}
            goToPage={goToPage}
          />
        </>
      )}
    </div>
  );
}