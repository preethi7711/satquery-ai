import React, { useState } from 'react';
import { Maximize2, Crosshair, Layers, Map, Eye } from 'lucide-react';

export default function SatelliteViewer({ result, files }) {
  const [activeTab, setActiveTab] = useState('Side by Side');
  
  if (!result || !result.spatial_outputs) return null;
  
  const tabs = ['Side by Side', 'Original', 'Prediction', 'Change Mask', 'Evidence', 'Overlay', '3D View'];
  
  const maskOutput = result.spatial_outputs.find(sp => sp.type === "mask" && sp.mask_path);
  const bboxOutput = result.spatial_outputs.find(sp => sp.type === "bbox");

  let imgUrl = null;
  if (maskOutput) {
    imgUrl = `http://localhost:8000/api/download?path=${encodeURIComponent(maskOutput.mask_path)}`;
  }

  const safeFiles = files || [];
  const beforeUrl = safeFiles[0] ? `http://localhost:8000/api/download?path=${encodeURIComponent(safeFiles[0])}` : null;
  const afterUrl = safeFiles[1] ? `http://localhost:8000/api/download?path=${encodeURIComponent(safeFiles[1])}` : null;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-8 flex flex-col min-h-[500px]">
      <div className="border-b border-gray-100 p-4 flex flex-col md:flex-row justify-between items-center bg-white">
        <h3 className="font-bold text-gray-800 flex items-center mb-4 md:mb-0 text-base">
          <Map className="w-5 h-5 mr-3 text-blue-600" />
          Satellite Image Viewer
          <span className="font-normal text-sm text-gray-400 ml-2">Visualize input images, predictions, and evidence.</span>
        </h3>
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {tabs.map(t => (
            <button 
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center whitespace-nowrap
                ${activeTab === t ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100'}
              `}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 bg-white relative flex items-center justify-center p-6 border-t border-gray-100">
        
        {/* Floating Mock Controls */}
        <div className="absolute top-8 right-8 flex flex-col space-y-2 z-10">
          <button className="bg-white text-gray-700 shadow-md border border-gray-200 p-2.5 rounded-lg hover:bg-gray-50 transition">
            <Maximize2 className="w-5 h-5" />
          </button>
          <button className="bg-white text-gray-700 shadow-md border border-gray-200 p-2.5 rounded-lg hover:bg-gray-50 transition">
            <Layers className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Rendering */}
        {activeTab === 'Side by Side' ? (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full h-full">
              <div className="flex flex-col">
                 <div className="text-center text-sm font-bold text-gray-700 mb-3">Before</div>
                 <div className="flex-1 border border-gray-200 bg-gray-100 rounded-xl relative overflow-hidden shadow-sm flex items-center justify-center">
                    {beforeUrl ? <img src={beforeUrl} className="w-full h-full object-cover" alt="Before" /> : <span className="text-gray-400 text-sm">No image</span>}
                 </div>
              </div>
              <div className="flex flex-col">
                 <div className="text-center text-sm font-bold text-gray-700 mb-3">After</div>
                 <div className="flex-1 border border-gray-200 bg-gray-100 rounded-xl relative overflow-hidden shadow-sm flex items-center justify-center">
                    {afterUrl ? <img src={afterUrl} className="w-full h-full object-cover" alt="After" /> : <span className="text-gray-400 text-sm">No image</span>}
                 </div>
              </div>
              <div className="flex flex-col">
                 <div className="text-center text-sm font-bold text-gray-700 mb-3">Change Map</div>
                 <div className="flex-1 border border-gray-200 bg-black rounded-xl relative overflow-hidden shadow-sm flex items-center justify-center">
                   {imgUrl ? (
                     <img src={imgUrl} className="w-full h-full object-cover" alt="Mask" />
                   ) : (
                     <div className="text-gray-500 text-sm">No mask available</div>
                   )}
                 </div>
              </div>
           </div>
        ) : (
           <div className="w-full h-full border border-gray-200 bg-gray-50 rounded-xl relative overflow-hidden flex items-center justify-center shadow-sm">
             {imgUrl ? (
                <img src={imgUrl} className="max-w-full max-h-full object-contain" alt="Analysis" />
             ) : (
                <div className="text-gray-500 text-sm">Viewer State: {activeTab}</div>
             )}
             
             {bboxOutput && activeTab !== 'Original' && bboxOutput.bboxes.map((b, i) => (
                <div key={i} className="absolute border-2 border-red-500 bg-red-500/20 flex items-start"
                     style={{
                       left: `${b.xmin}px`, top: `${b.ymin}px`, 
                       width: `${b.xmax - b.xmin}px`, height: `${b.ymax - b.ymin}px`
                     }}>
                   <span className="bg-red-500 text-white text-[9px] px-1 font-bold">{b.label}</span>
                </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}
