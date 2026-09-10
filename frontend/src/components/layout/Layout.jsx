import React from 'react';
import Header from './Header';

export default function Layout({ children, health }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#f4f7f9] font-sans">
      <Header health={health} />
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="w-full max-w-[1600px] mx-auto p-6 border-t border-gray-200 mt-auto flex justify-between items-center text-xs text-gray-500">
        <div>SatQuery AI v1.0 &nbsp;|&nbsp; SIH 26167 &nbsp;|&nbsp; ISRO</div>
        <div className="space-x-4">
          <a href="#" className="hover:text-blue-600">About</a>
          <a href="#" className="hover:text-blue-600">Privacy</a>
          <a href="#" className="hover:text-blue-600">Contact</a>
          <a href="#" className="hover:text-blue-600">Help</a>
        </div>
      </footer>
    </div>
  );
}
