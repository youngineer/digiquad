import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DisplayData from './DisplayData';

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [startRow, setStartRow] = useState(0);
  const [showRowEntryBar, setShowRowEntryBar] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (file) {
      setShowRowEntryBar(getFileExtension(file.name) !== 'xml');
      setStatus('idle');
    } else {
      setShowRowEntryBar(false);
    }
  }, [file]);

  function handleFileChange(e) {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  function handleStartRowChange(e) {
    if (e.target.value) {
        setStartRow(e.target.value);
    }
  }

  function getFileExtension(fileName) {
    const fileLength = fileName.length;
    let i = fileLength - 1;
    let extension = "";

    while(i >= 0) {
      if(fileName[i] === '.') break;

      extension += fileName[i];
      i--;
    }

    extension = extension.split('').reverse().join('');

    if (extension === "xml") {
        return 'xml';
    } else {
        return 'non-xml';
    }
  }

  function getFileName(fileName) {
    const fileLength = fileName.length;
    let newFileName = "";
    let i = fileLength - 1;

    while(i >= 0) {
      if( fileName[i] === '.') break;
      i--;
    };

    for(let j = 0; j < i; j++) {
      newFileName += fileName[j];
    }

    newFileName += ".json";
    return newFileName
  }

  async function handleFileUpload() {
    if (!file) {
      console.error("No file selected");
      return;
    };

    setStatus('uploading');
    setUploadProgress(0);
    let targetUrl = "";

    if (getFileExtension(file.name) === 'xml') {
        targetUrl = "http://localhost:8080/upload/generateJSON";
    } else {
        targetUrl = "http://localhost:8080/upload/parseFile";
    }

    const formData = new FormData();
    formData.append('startRow', startRow);
    formData.append('file', file); 
    try {
      const response = await axios.post(targetUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      setResult(response);
      setStatus('success');
      setUploadProgress(100);
      
      if(response !== null && getFileExtension(file.name) === 'xml'){
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
          JSON.stringify(response.data)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = getFileName(file.name);

        link.click();
      };

      
    } catch (error) {
      setStatus('error');
      setUploadProgress(0);
      console.error(error);
    }
  }

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow-lg max-w-full mx-auto flex justify-center">
      <input
        type="file"
        onChange={handleFileChange}
        className="block max-w-md flex justify-center text-sm text-black border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      {file && (
        <div className="mt-4 text-sm text-gray-700">
          <p className="font-medium">File Information:</p>
          <p>Name: {file.name}</p>
          <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
          <p>Type: {file.type}</p>
        </div>
      )}

      {file && showRowEntryBar && (
        <input
          type="number"
          onChange={handleStartRowChange}
          placeholder="Enter the start row number"
          className="block w-full text-sm text-black border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}


      {status === 'uploading' && (
        <div className="mt-4 space-y-2">
          <div className="h-2.5 w-full rounded-full bg-gray-200">
            <div
              className="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">{uploadProgress}% uploaded</p>
        </div>
      )}

      {file && status !== 'uploading' && (
        <button
          onClick={handleFileUpload}
          className="w-full py-2 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Upload
        </button>
      )}

      {status === 'success' && (
        <p className="mt-4 text-sm text-green-600">File uploaded successfully!</p>
      )}

      {status === 'error' && (
        <p className="mt-4 text-sm text-red-600">Upload failed. Please try again.</p>
      )}
      
      {file && <h3 className='flex justify-center'>{file.name} preview</h3>}

      {result !== null && file && getFileExtension(file.name) === 'non-xml' && (
        <DisplayData data={result.data}/>
      )}
    </div>
  );
};

export default FileUploader;