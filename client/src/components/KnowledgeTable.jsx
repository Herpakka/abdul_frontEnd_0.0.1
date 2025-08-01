import axios from "axios";   // Correct import for axios default export
import Swal from "sweetalert2";

export default function KnowledgeTable({ paginatedKnowledge, selectedRow, setSelectedRow, setKnowledge }) {
    const handleRowSelect = (item, index) => {
        if (item.embeded) return; // Don't allow selecting embedded rows
        setSelectedRow({ ...item, index });
    };

    const handleDeleteAll = async () => {
        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will delete all knowledge base items permanently.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (confirm.isConfirmed) {
            try {
                await axios.delete(process.env.REACT_APP_DELETE_URL || 'http://localhost:5678/webhook/delete_allprogram');
                Swal.fire({
                    title: 'Deleted!',
                    text: 'All knowledge base items have been deleted.',
                    icon: 'success'
                });
                // Refresh knowledge
                const refreshResponse = await axios.get(
                    process.env.REACT_APP_PROGRAM_URL || 'http://localhost:5678/webhook/getkprog'
                );
                if (Array.isArray(refreshResponse.data)) {
                    setKnowledge(refreshResponse.data);
                }
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: `Failed to delete items: ${error.message}`,
                    icon: 'error'
                });
            }
        }
    };


    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 mb-4"
                onClick={handleDeleteAll}
            >
                Delete All
            </button>
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
                            onClick={() => handleRowSelect(item, index)}
                            className={`transition-colors duration-150 ${item.embeded
                                ? 'bg-green-100 cursor-not-allowed opacity-75'
                                : selectedRow && selectedRow.index === index
                                    ? 'bg-blue-100 border-l-4 border-blue-500 cursor-pointer'
                                    : 'hover:bg-gray-50 cursor-pointer'
                                }`}
                        >
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate">
                                {item.filename}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                {item.filesize}{item.embeded ? ' (Embedded)' : ''}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{item.degree_name}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{item.revision_year}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{item.campus}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{item.faculty}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{item.department}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{item.thai_name}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{item.english_name}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{item.program_type}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
