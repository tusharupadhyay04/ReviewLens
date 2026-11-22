import React, { useCallback, useRef, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Sparkles, Cpu } from 'lucide-react';
import { uploadCSV } from '../utils/api.js';

export default function UploadZone({ onUploadStart, onUploadComplete, onError, isUploading, onProgressChange }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName]     = useState(null);
  const [done, setDone]             = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      onError('Please upload a CSV file (.csv extension required)');
      return;
    }
    setFileName(file.name);
    setDone(false);
    onUploadStart();
    try {
      const result = await uploadCSV(file, onProgressChange);
      setDone(true);
      onUploadComplete(result);
    } catch (err) {
      onError(err.response?.data?.error || err.message || 'Upload failed. Please try again.');
    }
  }, [onUploadStart, onUploadComplete, onError, onProgressChange]);

  const onDrop      = useCallback(e => { e.preventDefault(); setIsDragOver(false); handleFile(e.dataTransfer.files[0]); }, [handleFile]);
  const onDragOver  = e => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = () => setIsDragOver(false);
  const onClick     = () => !isUploading && inputRef.current?.click();
  const onChange    = e => handleFile(e.target.files[0]);

  return (
    <div
      className={`upload-zone p-10 text-center cursor-pointer select-none transition-all duration-300
        ${isDragOver ? 'drag-over' : ''}
        ${isUploading ? 'opacity-80 cursor-wait' : ''}
        ${done ? '!border-emerald-400 dark:!border-emerald-600 !bg-emerald-50 dark:!bg-emerald-900/20' : ''}`}
      onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onClick={onClick}
    >
      <input ref={inputRef} type="file" accept=".csv" onChange={onChange} className="hidden" disabled={isUploading} />

      {/* Icon */}
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg transition-all duration-300
        ${done ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-white dark:bg-gray-800 shadow-violet-200 dark:shadow-violet-900/50 border border-gray-100 dark:border-gray-700'}`}>
        {isUploading
          ? <Cpu className="w-8 h-8 text-violet-500 dark:text-violet-400 animate-pulse" />
          : done
            ? <CheckCircle2 className="w-8 h-8 text-white" />
            : <Upload className={`w-8 h-8 text-violet-500 dark:text-violet-400 transition-transform duration-300 ${isDragOver ? 'scale-125' : ''}`} />}
      </div>

      {/* Text */}
      {isUploading ? (
        <>
          <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-1">Analysing with AI…</h3>
          <p className="text-sm text-indigo-400 dark:text-indigo-500">Processing in batches · rate-limit aware · caching results</p>
        </>
      ) : done ? (
        <>
          <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-1">Analysis complete! 🎉</h3>
          <p className="text-sm text-emerald-500 dark:text-emerald-400 flex items-center justify-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> {fileName}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Drop a new file to re-analyse</p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
            Drop your <span className="text-gradient">reviews.csv</span> here
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            or click to browse · auto-detects columns · handles messy data
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs mb-3">
            {['Empty rows ✓', 'Missing ratings ✓', 'Duplicates ✓', 'Hinglish ✓', 'Prompt injection ✓'].map(tag => (
              <span key={tag} className="bg-violet-50 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-700/50 rounded-full px-3 py-1 font-medium">{tag}</span>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Needs: <code className="bg-violet-100 dark:bg-gray-800 text-violet-700 dark:text-violet-400 px-1.5 py-0.5 rounded font-mono">text/review</code> column · optional: <code className="bg-violet-100 dark:bg-gray-800 text-violet-700 dark:text-violet-400 px-1.5 py-0.5 rounded font-mono">id, product, rating</code>
          </p>
        </>
      )}
    </div>
  );
}
