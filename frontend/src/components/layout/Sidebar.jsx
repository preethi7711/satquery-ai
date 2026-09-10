import React from 'react';
import { 
  Map, LayoutDashboard, History, BarChart2, 
  Cpu, PlayCircle, Activity, BookOpen, Settings
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const navItems = [
    { name: 'New Analysis', icon: <Map className="w-5 h-5" />, path: '/dashboard' },
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard/overview' },
    { name: 'Analysis History', icon: <History className="w-5 h-5" />, path: '/dashboard/history' },
    { name: 'Evaluation & Benchmarks', icon: <BarChart2 className="w-5 h-5" />, path: '/dashboard/evaluation' },
    { name: 'Model Details', icon: <Cpu className="w-5 h-5" />, path: '/dashboard/models' },
    { name: 'Demo Scenarios', icon: <PlayCircle className="w-5 h-5" />, path: '/dashboard/demo' },
    { name: 'System Status', icon: <Activity className="w-5 h-5" />, path: '/dashboard/status' },
    { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/dashboard/settings' },
  ];

  return (
    <div className="w-64 bg-[#0a192f] text-gray-300 flex flex-col h-screen fixed border-r border-gray-800">
      <div className="p-6 flex items-center space-x-3 text-white border-b border-gray-800">
        <Map className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="font-bold text-lg leading-tight">SatQuery AI</h1>
          <p className="text-[10px] text-gray-400">See Earth. Ask More. Know Better.</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'hover:bg-[#112240] hover:text-white'
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
        SatQuery AI v1.0<br/>SIH 26167 | ISRO
      </div>
    </div>
  );
}
