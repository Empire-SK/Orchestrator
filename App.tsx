
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Demo from './pages/Demo';
import { COLORS } from './constants';

const Navbar = () => {
  const location = useLocation();
  const isDemo = location.pathname === '/demo';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
        <Link to="/" className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
          </div>
          <span className="truncate">Orchestrator</span>
        </Link>

        {/* <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-slate-900 transition-colors">Product</Link>
          <Link to="/" className="hover:text-slate-900 transition-colors">Features</Link>
          <Link to="/" className="hover:text-slate-900 transition-colors">Roadmap</Link>
        </div> */}

        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <Link
            to="/demo"
            className={`whitespace-nowrap px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-[13px] sm:text-sm font-semibold transition-all ${isDemo
              ? 'bg-slate-900 text-white shadow-lg'
              : 'bg-white text-slate-900 border border-slate-200 hover:border-slate-400'
              }`}
          >
            {isDemo ? 'Live Demo' : 'View MVP Demo'}
          </Link>
          <button className="hidden sm:block whitespace-nowrap px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-md">
            Early Access
          </button>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-slate-50 border-t border-slate-200 py-16 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <div className="text-xl font-bold mb-4">Orchestrator</div>
        <p className="text-slate-500 max-w-sm">
          Turning the chaos of unstructured observations into the clarity of strategic intelligence. Built for the next generation of innovators.
        </p>
      </div>
      <div>
        <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
        <ul className="space-y-2 text-slate-500 text-sm">
          <li><Link to="/">Features</Link></li>
          <li><Link to="/demo">MVP Demo</Link></li>
          <li><Link to="/">Roadmap</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
        <ul className="space-y-2 text-slate-500 text-sm">
          <li><a href="#">About</a></li>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200 flex justify-between items-center text-slate-400 text-xs">
      <div>© 2024 Orchestrator. AI for Structured Thinking.</div>
      <div className="flex gap-4">
        <a href="#">Twitter</a>
        <a href="#">LinkedIn</a>
      </div>
    </div>
  </footer>
);

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/demo" element={<Demo />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;
