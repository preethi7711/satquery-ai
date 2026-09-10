import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Cpu, Zap, Eye, BarChart2, Shield } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2 text-blue-900">
          <Map className="h-6 w-6" />
          <h1 className="text-xl font-bold">SatQuery AI</h1>
        </div>
        <div className="space-x-6 text-sm font-medium text-gray-600 hidden md:flex items-center">
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#how-it-works" className="hover:text-blue-600 transition">How It Works</a>
          <Link to="/login" className="hover:text-blue-600 transition">Login</Link>
          <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold text-blue-900 tracking-tight leading-tight">
          Ask Your Satellite Data.<br />
          <span className="text-blue-600">Get Intelligent Answers.</span>
        </h2>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          An interactive, agentic vision-language assistant for multimodal remote sensing image analysis. Simply ask questions in plain English and let AI do the rest.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/register" className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-semibold shadow hover:bg-blue-700 transition w-full sm:w-auto">
            Start Analyzing
          </Link>
          <a href="#features" className="text-blue-600 bg-blue-50 px-8 py-3 rounded-md text-lg font-semibold hover:bg-blue-100 transition w-full sm:w-auto">
            Explore Features
          </a>
        </div>
        <div className="mt-4 text-xs text-gray-400 font-mono">Developed for SIH 26167</div>
      </header>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center text-blue-900 mb-12">Powerful Remote Sensing Capabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Eye className="h-6 w-6 text-blue-600" />}
              title="Single-Image VQA" 
              desc="Ask specific questions about land-cover, infrastructure, or natural features on any standard GeoTIFF."
            />
            <FeatureCard 
              icon={<Map className="h-6 w-6 text-blue-600" />}
              title="Region Grounding" 
              desc="Get precise bounding boxes and spatial masks highlighting exactly where objects of interest are located."
            />
            <FeatureCard 
              icon={<Activity className="h-6 w-6 text-blue-600" />}
              title="Bi-Temporal Change" 
              desc="Upload two images from different dates to automatically detect, describe, and highlight structural changes."
            />
            <FeatureCard 
              icon={<BarChart2 className="h-6 w-6 text-blue-600" />}
              title="Optical + SAR Fusion" 
              desc="Combine spectral context with SAR backscatter structural data for robust, all-weather intelligence."
            />
            <FeatureCard 
              icon={<Cpu className="h-6 w-6 text-blue-600" />}
              title="Agentic Orchestration" 
              desc="Our intelligent router automatically selects the appropriate specialist model based on your inputs and query."
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6 text-blue-600" />}
              title="Auditable Traces" 
              desc="Every answer comes with visual evidence, confidence scores, and an execution trace for full transparency."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-6">
        <h3 className="text-3xl font-bold text-center text-blue-900 mb-12">How It Works</h3>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-8 text-center">
          <Step num="1" title="Upload" desc="Upload Optical, SAR, or Bi-temporal TIFFs." />
          <Zap className="hidden md:block h-8 w-8 text-gray-300" />
          <Step num="2" title="Ask" desc="Submit a natural language query." />
          <Zap className="hidden md:block h-8 w-8 text-gray-300" />
          <Step num="3" title="Analyze" desc="Agent routes to the correct specialist model." />
          <Zap className="hidden md:block h-8 w-8 text-gray-300" />
          <Step num="4" title="Review" desc="Get grounded textual and visual evidence." />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-900 text-white py-20 text-center">
        <h3 className="text-3xl font-bold mb-6">Ready to analyze satellite imagery like an expert?</h3>
        <Link to="/register" className="bg-white text-blue-900 px-8 py-3 rounded-md text-lg font-bold shadow hover:bg-gray-100 transition inline-block">
          Launch Dashboard
        </Link>
      </section>

      <footer className="text-center py-6 text-gray-500 text-sm">
        &copy; 2026 SatQuery AI. Built for ISRO/SAC Problem Statement 26167.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ num, title, desc }) {
  return (
    <div className="max-w-xs">
      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {num}
      </div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-500 text-sm">{desc}</p>
    </div>
  );
}

// Ensure Activity icon is defined for the FeatureCard
import { Activity } from 'lucide-react';
