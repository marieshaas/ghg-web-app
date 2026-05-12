import React from 'react';

const FileUploadZone = ({ uploadedFile, onFileUpload, isCategory21, isCategory13, manualInputMode }) => {
 if ((isCategory21 || isCategory13) && manualInputMode) {
  return null;
}

  return (
    <div>
      <label className="flex items-center text-base font-semibold text-gray-900 mb-4">
        <div className="w-2 h-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mr-3"></div>
        Upload File {isCategory21 && '(Excel with Electricity Usage Data)'}
      </label>
      <label className="flex items-center justify-center w-full px-6 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gradient-to-br from-gray-50 to-white hover:border-yellow-400 hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 group">
        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="text-center">
            <span className="text-base font-medium text-gray-800 group-hover:text-yellow-700 transition-colors">
              {uploadedFile ? uploadedFile.name : 'Drop files here or click to browse'}
            </span>
            <p className="text-sm text-gray-500 mt-1">
              {isCategory21 ? 'Excel files with electricity usage data' : 'CSV, Excel files supported'}
            </p>
          </div>
        </div>
        <input type="file" className="hidden" onChange={onFileUpload} accept=".csv,.xlsx,.xls" />
      </label>
    </div>
  );
};

export default FileUploadZone;