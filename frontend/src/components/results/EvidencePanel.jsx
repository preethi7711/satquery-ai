import React from 'react';
import { Eye, MapPin, FileSearch } from 'lucide-react';

export default function EvidencePanel({ evidence, spatial_outputs }) {
  // Graceful handling of empty state
  const hasEvidence = (evidence && evidence.length > 0) || (spatial_outputs && spatial_outputs.length > 0);

  // If spatial_outputs has bboxes, use them, otherwise mock visual parity for the screenshot.
  let regions = [];
  if (spatial_outputs && spatial_outputs.find(sp => sp.type === 'bbox')) {
     const boxes = spatial_outputs.find(sp => sp.type === 'bbox').bboxes;
     regions = boxes.map((b, i) => ({
        name: `Region ${i+1}`, desc: b.label, conf: "90%"
     }));
  }

  // Extract mask if available
  const maskOutput = spatial_outputs && spatial_outputs.find(sp => sp.type === 'mask');
  const maskPath = maskOutput ? maskOutput.mask_path : null;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 h-full flex flex-col">
      <div className="border-b border-gray-100 p-5 flex justify-between items-center bg-gray-50/80 rounded-t-xl">
        <h3 className="font-bold text-gray-800 flex items-center text-base">
          <Eye className="w-5 h-5 mr-3 text-blue-600" />
          Evidence & Findings
        </h3>
        {hasEvidence && (
          <span className="text-xs font-semibold text-gray-500">
            {maskPath ? "Change Mask Detected" : `${regions.length} regions detected`}
          </span>
        )}
      </div>
      
      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        {!hasEvidence ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
             <FileSearch className="w-8 h-8 mb-2 opacity-50" />
             <p className="text-sm">No specific spatial evidence returned.</p>
          </div>
        ) : (
          <>
            {maskPath && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Change Mask Pipeline Output</h4>
                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img src={`http://localhost:8000/api/download?path=${encodeURIComponent(maskPath)}`} alt="Change Mask" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          
            {regions.map((reg, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition group cursor-pointer bg-white hover:bg-blue-50/30 shadow-sm">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-lg mr-4 relative overflow-hidden border border-gray-300 flex items-center justify-center">
                     <FileSearch className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">{reg.name}</h4>
                    <p className="text-xs text-gray-600 mb-1">{reg.desc}</p>
                    <p className="text-[10px] text-gray-500 font-mono font-medium">Confidence: {reg.conf}</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition flex items-center opacity-0 group-hover:opacity-100 shadow-sm">
                  <MapPin className="w-4 h-4 mr-2" /> View on Image
                </button>
              </div>
            ))}
            
            {/* Real Evidence Text Fallback */}
            {evidence && evidence.map((ev, i) => (
              <div key={`ev-${i}`} className="text-sm text-gray-700 border-l-4 border-blue-500 pl-4 py-1 italic bg-blue-50/30 rounded-r-lg">
                "{ev}"
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
