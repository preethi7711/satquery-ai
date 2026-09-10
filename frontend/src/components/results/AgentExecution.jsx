import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export default function AgentExecution({ trace }) {
  if (!trace) return null;

  const steps = [
    { name: "Input validation", active: true },
    { name: `Query intent classification → ${trace.task}`, active: true },
    { name: `Specialist model selection (${trace.selected_tool})`, active: true },
    { name: `${trace.model_used} executed`, active: true },
    { name: "Evidence extraction", active: true },
    { name: "Confidence calculation", active: true },
    { name: "Response synthesis", active: true }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="border-b border-gray-100 p-4 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
        <h3 className="font-bold text-gray-800 flex items-center">
          <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-md flex items-center justify-center mr-2">🤖</span>
          Agent Execution
        </h3>
        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full flex items-center">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed in {trace.runtime_seconds.toFixed(1)}s
        </span>
      </div>
      
      <div className="p-5 flex-1 flex flex-col justify-center">
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start">
              <div className="flex flex-col items-center mr-3 mt-0.5">
                {step.active ? (
                   <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                   <Circle className="w-4 h-4 text-gray-300" />
                )}
                {idx !== steps.length - 1 && (
                  <div className={`w-0.5 h-6 my-0.5 ${step.active ? 'bg-green-200' : 'bg-gray-100'}`}></div>
                )}
              </div>
              <div className="flex-1 flex justify-between items-center text-sm">
                <span className={step.active ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                  {step.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-3 border-t border-gray-100 text-center">
        <button className="text-xs font-bold text-blue-600 hover:text-blue-800">
          View Full Execution Trace &rarr;
        </button>
      </div>
    </div>
  );
}
