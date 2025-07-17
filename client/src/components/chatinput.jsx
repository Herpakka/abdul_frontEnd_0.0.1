import { useRef }     from "react";
import { PDFDocument } from 'pdf-lib';
import { PaperClipIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function ChatInput({ fileData, setFileData }) {
    const inputRef = useRef(null);

    async function handleFile(e){
        const file = e.target.files[0];
        if(!file || file.type !== 'application/pdf' || file.size > 25 * 1024 * 1024) {
            alert('Please upload a valid PDF file (max 25MB)');
            return;
        }

        const buffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(buffer);
        const base64 = await pdf.saveAsBase64({ dataUri: true });

        setFileData({
            name: file.name,
            size: file.size,
            mime: file.type,
            dataUri: base64,
            size64: base64.length
        });
    }

    return (
        <div className='flex flex-col'>
            {/* attached file */}
            <div>
                {fileData && (
                    <div className="flex items-center justify-between bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 mb-2">
                        <div className="flex items-center gap-3">
                            <PaperClipIcon className="h-5 w-5 text-gray-500" />
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-800 text-sm truncate max-w-xs">{fileData.name}</span>
                                <span className="text-xs text-gray-500">{(fileData.size / 1024).toFixed(2)} KB</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setFileData(null)}
                            className="p-1 rounded-full hover:bg-red-100 text-red-500 hover:text-red-700 transition"
                            title="Remove file"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-3 px-4 py-3 relative bg-white border-t border-gray-200 shadow-sm">
                <label className="flex items-center cursor-pointer">
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFile}
                    />
                    <span className="inline-flex items-center px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition">
                        <PlusIcon className="h-5 w-5 mr-1" />
                    </span>
                </label>
                <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
                <button className="inline-flex items-center px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Send
                </button>
            </div>
        </div>
    );
}