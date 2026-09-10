import React from 'react';
import { useAuth } from '../../AuthContext';
import { LogOut, Activity, Bell, ChevronDown, Map, LayoutDashboard, History, BarChart2, Cpu, PlayCircle, BookOpen, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Header({ health }) {
  const { user, logout } = useAuth();
  const isHealthy = health?.status === 'healthy';
  const gpuActive = health?.gpu_available;

  const navItems = [
    { name: 'Workspace', icon: <Map className="w-4 h-4 mr-2" />, path: '/dashboard' },
    { name: 'History', icon: <History className="w-4 h-4 mr-2" />, path: '/dashboard/history' },
    { name: 'Evaluation', icon: <BarChart2 className="w-4 h-4 mr-2" />, path: '/dashboard/evaluation' },
    { name: 'Models', icon: <Cpu className="w-4 h-4 mr-2" />, path: '/dashboard/models' },
    { name: 'Demo', icon: <PlayCircle className="w-4 h-4 mr-2" />, path: '/dashboard/demo' },
    { name: 'Docs', icon: <BookOpen className="w-4 h-4 mr-2" />, path: '/dashboard/docs' },
    { name: 'System', icon: <Settings className="w-4 h-4 mr-2" />, path: '/dashboard/system' },
  ];

  return (
    <header className="h-16 bg-[#0a192f] text-white border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-50 shadow-md">
      {/* Brand */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-3">
          <Map className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wide">SatQuery AI</h1>
            <p className="text-[10px] text-blue-200">See Earth. Ask More. Know Better.</p>
          </div>
        </div>

        {/* Top Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-[#112240] hover:text-white'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center text-sm border-r border-gray-700 pr-6">
          <div className="flex flex-col items-end mr-3">
            <span className="font-semibold flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${isHealthy ? 'bg-green-400' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]'}`}></span>
              System {isHealthy ? 'Ready' : 'Offline'}
            </span>
            <span className="text-xs text-gray-400">
              {gpuActive ? `GPU Inference (${health.vram_total_mb}MB)` : 'Local Inference (CPU)'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Bell className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer transition" />
          <div className="flex items-center cursor-pointer group">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-2 shadow-sm border border-blue-400">
              {user?.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left mr-1">
              <div className="text-sm font-medium leading-none">{user?.email?.split('@')[0] || 'User'}</div>
              <div className="text-xs text-gray-400 mt-1">Team Member</div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <button 
            onClick={logout} 
            className="text-gray-400 hover:text-red-400 transition ml-2 bg-[#112240] p-2 rounded-md"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
