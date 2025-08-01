import { useState, useEffect } from 'react';

export default function ImageInput({ imageFile, setImageFile }) {
  const [preview, setPreview] = useState("./logo192.png"); // Set default preview

  useEffect(() => {
    if (!imageFile) {
      setPreview("./logo192.png"); // Show default when no file
      return;
    }
    
    // If imageFile is a string path, use it directly
    if (typeof imageFile === 'string') {
      setPreview(imageFile);
      return;
    }
    
    // If imageFile is a File object, create object URL
    const objectUrl = URL.createObjectURL(imageFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    } else {
      setImageFile("./logo192.png"); // Reset to default
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="w-32 h-32 rounded-full border-4 border-blue-600 overflow-hidden bg-white shadow-md">
        <img
          src={preview}
          alt="Selected"
          className="object-cover w-full h-full"
        />
      </div>
      <label
        htmlFor="image-upload"
        className="cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
      >
        Choose Image
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
