import Axios from 'axios';

export default function EmbedSection({
  selectedRow,
  setSelectedRow,
  embedProgress,
  setEmbedProgress,
  embedStatus,
  setEmbedStatus,
  embedResponseText,
  setEmbedResponseText,
  embedCancelSource,
  setEmbedCancelSource,
  setKnowledge,
}) {
  const handleEmbed = async () => {
    if (!selectedRow || !selectedRow.thai_name) {
      setEmbedStatus('Please select a row from the table to embed');
      return;
    }

    const targetUrl = process.env.REACT_APP_EMBED_URL || 'http://localhost:5678/webhook/embed';

    const payload = {
      id: selectedRow.prog_id, // Assuming prog_id is available
      thai_name: selectedRow.thai_name.trim(),
    };

    const source = Axios.CancelToken.source();
    setEmbedCancelSource(source);

    setEmbedProgress(0);
    setEmbedStatus('Starting embed process...');
    setEmbedResponseText('');

    try {
      const response = await Axios.post(targetUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setEmbedProgress(percentCompleted);
          if (percentCompleted < 100) {
            setEmbedStatus(`Processing embed... ${percentCompleted}%`);
          }
        },
        cancelToken: source.token,
      });

      setEmbedStatus('Embed successful!');
      setEmbedResponseText(`URL: ${targetUrl}
Thai Name: ${selectedRow.thai_name}
Status: ${response.status} ${response.statusText}
Response Data: ${JSON.stringify(response.data, null, 2)}`);

      // Refresh knowledge after embed
      const refreshResponse = await Axios.get(
        process.env.REACT_APP_PROGRAM_URL || 'http://localhost:5678/webhook/getkprog'
      );
      if (Array.isArray(refreshResponse.data)) {
        setKnowledge(refreshResponse.data);
      }

      setSelectedRow(null);

    } catch (err) {
      if (Axios.isCancel(err)) {
        setEmbedStatus('Embed was cancelled by user');
        setEmbedResponseText('Embed was cancelled');
      } else {
        const errorMessage = `URL: ${targetUrl}
Thai Name: ${selectedRow.thai_name}
${err.response ? `Error: ${err.message}` : ''}
${err.response && err.response.data ? `Status: ${err.response.status}` : ''}
${err.response && err.response.data ? `Server Response: ${JSON.stringify(err.response.data, null, 2)}` : ''}`;
        setEmbedStatus('Embed failed!');
        setEmbedResponseText(errorMessage);
      }
    } finally {
      setEmbedProgress(0);
      setEmbedCancelSource(null);
    }
  };

  const cancelEmbed = () => {
    if (embedCancelSource) {
      embedCancelSource.cancel('User cancelled embed');
      setEmbedStatus('Embed cancelled');
    } else {
      setEmbedStatus('No active embed to cancel');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Embed Thai Name</h3>

      <div className="flex flex-col space-y-4">
        {/* Selected Item */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {selectedRow ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Selected:</span> {selectedRow.thai_name}
                </p>
                <p className="text-xs text-gray-500 mt-1">Filename: {selectedRow.filename}</p>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-500">
                  No row selected. Click on a row in the table below to select it for embedding.
                </p>
              </div>
            )}
          </div>
          <div className="flex space-x-2 ml-4">
            <button
              onClick={handleEmbed}
              disabled={embedProgress > 0 || !selectedRow}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {embedProgress > 0 ? 'Processing...' : 'Embed'}
            </button>
            {embedProgress > 0 && (
              <button
                onClick={cancelEmbed}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                Cancel
              </button>
            )}
            {selectedRow && (
              <button
                onClick={() => setSelectedRow(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {embedProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${embedProgress}%` }}
            ></div>
          </div>
        )}

        {/* Status */}
        {embedStatus && (
          <div
            className={`p-3 rounded-md ${
              embedStatus.includes('successful')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : embedStatus.includes('failed') || embedStatus.includes('cancelled')
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            <p className="font-medium">{embedStatus}</p>
            {embedProgress > 0 && (
              <p className="text-sm mt-1">{embedProgress}% completed</p>
            )}
          </div>
        )}

        {/* Response Text */}
        {embedResponseText && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Embed Response:
            </label>
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
              value={embedResponseText}
              readOnly
              placeholder="Embed response will appear here..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
