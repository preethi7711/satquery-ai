import React, { useState } from 'react';
import { Target, MapPin, Maximize, FileText, Download, Share2, Building2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export default function AnalysisResultCard({ result, files, query }) {
  const [showConfidenceDetails, setShowConfidenceDetails] = useState(false);
  
  if (!result) return null;
  const isChange = result.task === 'CHANGE_ANALYSIS' || result.task === 'CHANGE_DETECTION';
  
  const conf = result.confidence || { available: false, type: "unavailable", reason: "Missing confidence object." };
  
  const handleDownloadReport = () => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      const safeFiles = files || [];
      const fileNames = safeFiles.map(f => typeof f === 'string' ? f.split(/[/\\]/).pop() : (f.name || 'unknown'));
      
      doc.setFontSize(22);
      doc.setTextColor(10, 25, 47);
      doc.text('SatQuery AI - Analysis Report', 20, 20);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 28);
      
      doc.setDrawColor(200);
      doc.line(20, 32, 190, 32);
      
      doc.setFontSize(14);
      doc.setTextColor(20, 50, 100);
      doc.text('1. Request Metadata', 20, 42);
      
      doc.setFontSize(11);
      doc.setTextColor(50);
      doc.text(`Task Executed: ${result.task}`, 25, 50);
      
      const confStr = conf.available ? `${conf.percentage}% (${conf.type})` : "Unavailable";
      doc.text(`Model Confidence: ${confStr}`, 25, 57);
      
      doc.text('Input Query:', 25, 68);
      doc.setTextColor(0);
      const queryLines = doc.splitTextToSize(`"${query || 'N/A'}"`, 160);
      doc.text(queryLines, 30, 75);
      
      let yPos = 75 + (queryLines.length * 6) + 10;
      
      doc.setFontSize(11);
      doc.setTextColor(50);
      doc.text('Uploaded Imagery:', 25, yPos);
      fileNames.forEach((f, i) => {
        doc.text(`• ${f}`, 30, yPos + 7 + (i * 6));
      });
      
      yPos = yPos + 7 + (fileNames.length * 6) + 15;
      
      doc.setFontSize(14);
      doc.setTextColor(20, 50, 100);
      doc.text('2. Analysis Findings', 20, yPos);
      
      doc.setFontSize(12);
      doc.setTextColor(0);
      const answerLines = doc.splitTextToSize(result.answer || "No textual description returned.", 170);
      doc.text(answerLines, 25, yPos + 10);
      
      yPos = yPos + 10 + (answerLines.length * 7) + 15;
      
      doc.setFontSize(14);
      doc.setTextColor(20, 50, 100);
      doc.text('3. Execution Trace', 20, yPos);
      
      doc.setFontSize(11);
      doc.setTextColor(50);
      doc.text(`Selected Tool: ${result.execution_trace?.selected_tool || 'Unknown'}`, 25, yPos + 10);
      doc.text(`Model Used: ${result.execution_trace?.model_used || 'Unknown'}`, 25, yPos + 17);
      doc.text(`Runtime: ${result.execution_trace?.runtime_seconds?.toFixed(2)} seconds`, 25, yPos + 24);
      
      doc.save(`SatQuery_Analysis_${Date.now()}.pdf`);
    });
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 h-full flex flex-col">
      <div className="border-b border-gray-100 p-5 flex justify-between items-center bg-gray-50/80 rounded-t-xl">
        <h3 className="font-bold text-gray-800 flex items-center text-lg">
          <Target className="w-5 h-5 mr-3 text-green-600" />
          Analysis Result
        </h3>
        
        {conf.available ? (
          <span className="text-sm font-bold text-white bg-green-500 px-4 py-1.5 rounded-full flex items-center shadow-sm cursor-pointer" onClick={() => setShowConfidenceDetails(!showConfidenceDetails)}>
            {conf.percentage}% Confidence
            {showConfidenceDetails ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </span>
        ) : (
          <span className="text-sm font-bold text-gray-700 bg-gray-200 px-4 py-1.5 rounded-full flex items-center shadow-sm cursor-pointer" onClick={() => setShowConfidenceDetails(!showConfidenceDetails)}>
            <AlertCircle className="w-4 h-4 mr-1.5" /> Confidence Unavailable
            {showConfidenceDetails ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </span>
        )}
      </div>
      
      {showConfidenceDetails && (
        <div className="bg-gray-50 border-b border-gray-200 p-5 text-sm">
          <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">How is this measured?</h4>
          {conf.available ? (
             <ul className="space-y-2 text-gray-700">
               <li><span className="font-semibold">Type:</span> {conf.type}</li>
               <li><span className="font-semibold">Source:</span> {conf.source}</li>
               <li><span className="font-semibold">Methodology:</span> {conf.method}</li>
               <li><span className="font-semibold">Calibration:</span> {conf.calibrated ? "Calibrated Probability" : "Uncalibrated Signal Score"}</li>
             </ul>
          ) : (
             <p className="text-gray-600">
                <span className="font-bold text-red-600">Reason:</span> {conf.reason}
             </p>
          )}
        </div>
      )}
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 mb-6">
          <h4 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
            <Building2 className="w-6 h-6 mr-3 text-blue-600" /> 
            {isChange ? "Change Analysis" : "Scene Understanding"}
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {result.answer || "No text description returned by the model."}
          </p>
        </div>

        {/* Removed fabricated hardcoded Change Ratio and Region counts to preserve scientific integrity */}
        
        <div className="mt-auto grid grid-cols-3 gap-4 pt-4">
          <button className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm hover:shadow">
            <FileText className="w-4 h-4 mr-2" /> View Detailed Report
          </button>
          <button onClick={handleDownloadReport} className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition shadow-sm hover:shadow">
            <Download className="w-4 h-4 mr-2" /> Download Report
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition shadow-sm hover:shadow">
            <Share2 className="w-4 h-4 mr-2" /> Share Result
          </button>
        </div>
      </div>
    </div>
  );
}
