import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Map, Zap, Layers, RefreshCw, X, Rocket } from 'lucide-react';

export default function AnalysisWorkspace({
  onAnalyze,
  loading,
  error,
  health
}) {
  const [analysisType, setAnalysisType] = useState('change'); 
  const [query, setQuery] = useState('');
  
  const [singleFile, setSingleFile] = useState(null);
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [opticalFile, setOpticalFile] = useState(null);
  const [sarFile, setSarFile] = useState(null);

  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);

  const analysisOptions = [
    { id: 'single', title: 'Single Image VQA', desc: 'Describe and analyse one image', icon: <ImageIcon className="w-5 h-5"/> },
    { id: 'grounding', title: 'Region Grounding', desc: 'Identify and locate regions', icon: <Map className="w-5 h-5"/> },
    { id: 'change', title: 'Change Detection', desc: 'Analyse before/after images', icon: <RefreshCw className="w-5 h-5"/> },
    { id: 'fusion', title: 'Optical + SAR Analysis', desc: 'Use both modalities together', icon: <Layers className="w-5 h-5"/> },
  ];

  const suggestedQueries = {
    single: "Describe the land-cover and major objects visible in this image.",
    grounding: "Highlight the water body referred to in the query.",
    change: "What changed between these two dates, and where did the change occur?",
    fusion: "Use the optical and SAR images together to identify built-up and water-covered regions."
  };

  const handleFileChange = (e, setter) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleRun = () => {
    let filesToUpload = [];
    if (analysisType === 'single' || analysisType === 'grounding') {
      if (singleFile) filesToUpload.push(singleFile);
    } else if (analysisType === 'change') {
      if (beforeFile) filesToUpload.push(beforeFile);
      if (afterFile) filesToUpload.push(afterFile);
    } else if (analysisType === 'fusion') {
      if (opticalFile) filesToUpload.push(opticalFile);
      if (sarFile) filesToUpload.push(sarFile);
    }
    
    onAnalyze({ analysisType, query, files: filesToUpload });
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
      {/* ISRO Mission Control Hero Banner */}
      <div className="bg-gradient-to-r from-[#071324] via-[#0a2342] to-[#123e75] p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/e/e1/Earth_from_Space.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="bg-blue-500/20 p-3 rounded-xl backdrop-blur-md border border-blue-400/30">
              <Rocket className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-wide">New Analysis</h2>
              <p className="text-sm text-blue-100/80 mt-1">Upload satellite imagery, ask a question, and let our AI agents analyse it.</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-blue-200 flex items-center font-medium"><Zap className="w-4 h-4 mr-1 text-yellow-400"/> Try example queries:</span>
            {['Detect built-up area', 'What changed between two dates?', 'Identify water bodies', 'Use optical and SAR together'].map((q,i)=>(
              <button key={i} onClick={() => setQuery(q)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-white transition backdrop-blur-sm truncate max-w-[200px]">
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* 1. Analysis Type */}
        <div className="lg:col-span-3 p-5 border-r border-gray-100 flex flex-col">
          <div className="flex items-center mb-4">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 shadow-sm">1</span>
            <h3 className="text-sm font-bold text-gray-800">Analysis Type</h3>
          </div>
          <div className="space-y-2 flex-1">
            {analysisOptions.map(opt => (
              <div 
                key={opt.id}
                onClick={() => {
                  setAnalysisType(opt.id);
                  setQuery(suggestedQueries[opt.id]);
                }}
                className={`p-3 rounded-lg border cursor-pointer transition flex items-center space-x-3
                  ${analysisType === opt.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
                `}
              >
                <div className={`${analysisType === opt.id ? 'text-blue-600' : 'text-gray-400'}`}>
                  {opt.icon}
                </div>
                <div>
                  <div className={`text-sm font-bold ${analysisType === opt.id ? 'text-blue-900' : 'text-gray-700'}`}>{opt.title}</div>
                  <div className="text-[10px] text-gray-500 leading-tight">{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Upload Imagery */}
        <div className="lg:col-span-5 p-5 border-r border-gray-100 bg-gray-50/50 flex flex-col">
          <div className="flex items-center mb-4">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 shadow-sm">2</span>
            <h3 className="text-sm font-bold text-gray-800">Upload Imagery</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            {(analysisType === 'single' || analysisType === 'grounding') && (
              <UploadZone 
                label="Image (Optical or SAR)"
                file={singleFile}
                onChange={(e) => handleFileChange(e, setSingleFile)}
                onClear={() => setSingleFile(null)}
                refObj={fileInputRef1}
              />
            )}
            {analysisType === 'change' && (
              <div className="grid grid-cols-2 gap-3 h-full">
                <UploadZone label="Before Image" file={beforeFile} onChange={(e) => handleFileChange(e, setBeforeFile)} onClear={() => setBeforeFile(null)} refObj={fileInputRef1} />
                <UploadZone label="After Image" file={afterFile} onChange={(e) => handleFileChange(e, setAfterFile)} onClear={() => setAfterFile(null)} refObj={fileInputRef2} />
              </div>
            )}
            {analysisType === 'fusion' && (
              <div className="grid grid-cols-2 gap-3 h-full">
                <UploadZone label="Optical / Multispectral" file={opticalFile} onChange={(e) => handleFileChange(e, setOpticalFile)} onClear={() => setOpticalFile(null)} refObj={fileInputRef1} />
                <UploadZone label="SAR Image" file={sarFile} onChange={(e) => handleFileChange(e, setSarFile)} onClear={() => setSarFile(null)} refObj={fileInputRef2} />
              </div>
            )}
          </div>
        </div>

        {/* 3. Query */}
        <div className="lg:col-span-4 p-5 flex flex-col">
          <div className="flex items-center mb-4">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 shadow-sm">3</span>
            <h3 className="text-sm font-bold text-gray-800">Ask Your Query</h3>
          </div>
          
          <textarea
            className="flex-1 w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none mb-2 bg-white shadow-inner"
            placeholder="Describe what you want to analyse..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="text-right text-[10px] text-gray-400 mb-3">{query.length}/500</div>
          
          {error && <div className="text-red-600 text-xs mb-3 font-medium bg-red-50 border border-red-200 p-2 rounded flex items-start"><span className="mr-1">⚠️</span>{error}</div>}
          
          <button 
            onClick={handleRun}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? (
              <><RefreshCw className="animate-spin w-4 h-4 mr-2" /> Analysing...</>
            ) : (
              <><Rocket className="w-4 h-4 mr-2" /> Run Analysis</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

function UploadZone({ label, file, onChange, onClear, refObj }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (file) {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
      } else {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  }, [file]);

  return (
    <div className="flex flex-col h-full">
      <span className="text-sm font-bold text-gray-700 mb-2">{label}</span>
      <div 
        className={`relative flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition overflow-hidden min-h-[120px]
          ${file ? 'border-green-400 bg-white' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 bg-white cursor-pointer'}
        `}
        onClick={() => !file && refObj.current.click()}
      >
        <input type="file" className="hidden" ref={refObj} onChange={onChange} accept=".tif,.tiff,.png,.jpg,.jpeg" />
        
        {file ? (
          <div className="w-full h-full flex flex-col">
            {preview ? (
              <div className="flex-1 w-full bg-black/5 flex items-center justify-center p-2">
                <img src={preview} alt="preview" className="max-h-24 object-contain rounded" />
              </div>
            ) : (
              <div className="flex-1 w-full flex items-center justify-center bg-green-50">
                <div className="bg-green-100 p-3 rounded-full">
                  <Upload className="w-6 h-6 text-green-600" />
                </div>
              </div>
            )}
            <div className="bg-white border-t border-gray-100 p-3 flex items-center justify-between">
               <div className="flex items-center overflow-hidden">
                 <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-white text-[10px] font-bold">✓</span>
                 </div>
                 <div className="flex flex-col text-left truncate">
                    <span className="text-xs font-bold text-gray-800 truncate pr-2">{file.name}</span>
                    <span className="text-[10px] text-gray-500">{(file.size/1024/1024).toFixed(1)} MB</span>
                 </div>
               </div>
               <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500">
                 <X className="w-4 h-4" />
               </button>
            </div>
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center">
            <Upload className="w-8 h-8 text-blue-500 mb-3" />
            <span className="text-sm font-semibold text-gray-700">Click or drag GeoTIFF</span>
            <span className="text-xs text-gray-400 mt-1">Optical / SAR supported</span>
          </div>
        )}
      </div>
    </div>
  );
}
