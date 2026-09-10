import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AnalysisWorkspace from './components/analysis/AnalysisWorkspace';
import SatelliteViewer from './components/results/SatelliteViewer';
import AnalysisResultCard from './components/results/AnalysisResultCard';
import InputValidation from './components/results/InputValidation';
import AgentExecution from './components/results/AgentExecution';
import EvidencePanel from './components/results/EvidencePanel';
import { RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const { token } = useAuth();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentQuery, setCurrentQuery] = useState('');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => console.error("API not available:", err));
  }, []);

  const handleAnalyzeWorkflow = async ({ analysisType, query, files }) => {
    if (!query) { setError("Please enter a query."); return; }
    if (files.length === 0) { setError("Please upload required imagery."); return; }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    setCurrentQuery(query);

    try {
      // 1. Upload files
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      
      const uploadText = await uploadRes.text();
      let uploadData;
      try { uploadData = JSON.parse(uploadText); } catch(e){}
      
      if (!uploadRes.ok) throw new Error(uploadData?.detail || "Upload failed");
      
      setUploadedFiles(uploadData.files);

      // 2. Analyze
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: query,
          image_paths: uploadData.files 
        })
      });
      
      const analyzeText = await analyzeRes.text();
      let analyzeData;
      try { analyzeData = JSON.parse(analyzeText); } catch(e){}

      if (!analyzeRes.ok) throw new Error(analyzeData?.detail || "Analysis failed");
      
      setAnalysisResult(analyzeData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout health={health}>
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
        
        <AnalysisWorkspace 
          onAnalyze={handleAnalyzeWorkflow} 
          loading={loading} 
          error={error}
          health={health}
        />

        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center space-y-4">
             <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
             <h3 className="font-bold text-gray-800">ANALYSING IMAGERY...</h3>
             <p className="text-gray-500 text-sm">Agent is validating inputs and selecting specialist tools.</p>
          </div>
        )}

        {!loading && !analysisResult && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center text-center">
             <div className="bg-blue-50 p-3 rounded-full mb-3">
               <Map className="w-6 h-6 text-blue-400" />
             </div>
             <h3 className="text-base font-bold text-gray-800 mb-1">READY FOR ANALYSIS</h3>
             <p className="text-gray-500 text-sm max-w-md">
               Upload satellite imagery and ask a question. SatQuery's agents will autonomously select the right remote-sensing workflow.
             </p>
          </div>
        )}

        {analysisResult && (
          <>
            <SatelliteViewer result={analysisResult} files={uploadedFiles} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="grid grid-cols-1 gap-6">
                 <InputValidation files={uploadedFiles} trace={analysisResult.execution_trace} />
                 <AgentExecution trace={analysisResult.execution_trace} />
               </div>
               
               <div className="grid grid-cols-1 gap-6">
                 <AnalysisResultCard result={analysisResult} files={uploadedFiles} query={currentQuery} />
                 <EvidencePanel evidence={analysisResult.evidence} spatial_outputs={analysisResult.spatial_outputs} />
               </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

import { Map } from 'lucide-react';
