import { useRef, useState } from 'react';
import { Upload, Download, X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Generate and download CSV template entirely client-side
const downloadTemplate = () => {
  const headers = ['Full Name', 'Class', 'Section', "Father's Name", 'Admission Number'];

  const csvContent = headers.join(',');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'student_upload_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success('Template downloaded!');
};

export default function CSVUpload({ onUpload, isUploading, result }) {
  const inputRef = useRef();
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.endsWith('.csv')) {
      toast.error('Only .csv files are allowed');
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      toast.error('File too large. Max 2MB allowed.');
      return;
    }
    setFile(f);
  };

  const handleInputChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = () => {
    if (!file) { toast.error('Please select a CSV file first'); return; }
    onUpload(file);
  };

  const handleClear = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4">

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">📋 CSV Format Required:</p>
        <p className="font-mono text-xs bg-blue-100 rounded px-2 py-1 mt-1">
          full_name, class, section, father_name, admission_number
        </p>
        <p className="text-xs mt-2 text-blue-600">
          Download the template below, fill it in Excel/Sheets, then upload.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
          ${file ? 'cursor-default' : ''}`}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <CheckCircle size={22} className="text-green-500" />
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="ml-2 text-gray-400 hover:text-red-500 transition"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={32} className="text-gray-300" />
            <p className="text-sm text-gray-500">
              Drag & drop your CSV here, or <span className="text-blue-600 font-medium">click to browse</span>
            </p>
            <p className="text-xs text-gray-400">Max file size: 2MB</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
        >
          <Download size={14} /> Download Template
        </button>

        {file && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isUploading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={14} /> Upload {file.name}
              </>
            )}
          </button>
        )}
      </div>

      {/* Upload Results */}
      {result && (
        <div className="space-y-3 mt-2">
          {result.success?.length > 0 && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
              <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-semibold text-sm">
                  {result.success.length} students uploaded successfully
                </p>
              </div>
            </div>
          )}

          {result.duplicates?.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-yellow-500" />
                <p className="text-yellow-800 font-semibold text-sm">
                  {result.duplicates.length} duplicates skipped
                </p>
              </div>
              <ul className="text-xs text-yellow-700 space-y-0.5 ml-5 list-disc">
                {result.duplicates.map((d, i) => (
                  <li key={i}>Row {d.row}: Admission No. <span className="font-mono">{d.admission_number}</span> already exists</li>
                ))}
              </ul>
            </div>
          )}

          {result.errors?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={16} className="text-red-500" />
                <p className="text-red-800 font-semibold text-sm">
                  {result.errors.length} validation errors
                </p>
              </div>
              <ul className="text-xs text-red-700 space-y-0.5 ml-5 list-disc">
                {result.errors.map((e, i) => (
                  <li key={i}>Row {e.row}: {e.issues.join(', ')}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}