'use client';

import { Plus, MessageSquare, Zap, Braces } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function FloatingToolbar({ onAddNode }: { onAddNode: (type: string, name: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = (type: string, name: string) => {
    onAddNode(type, name);
    setIsOpen(false);
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50" ref={menuRef}>
      {isOpen && (
        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl p-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 py-2 mb-1">
            Add Node
          </div>
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => handleAdd('llm', 'LLM Execution')}
              className="flex items-center gap-3 w-full p-2 hover:bg-zinc-800 rounded-lg transition-colors text-left"
            >
              <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-md">
                <Zap size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">LLM Node</span>
                <span className="text-xs text-zinc-500">Run a prompt via AI</span>
              </div>
            </button>
            
            <button 
              onClick={() => handleAdd('condition', 'Condition')}
              className="flex items-center gap-3 w-full p-2 hover:bg-zinc-800 rounded-lg transition-colors text-left"
            >
              <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-md">
                <Braces size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">Condition</span>
                <span className="text-xs text-zinc-500">Branch logic (If/Else)</span>
              </div>
            </button>
            
            <button 
              onClick={() => handleAdd('output', 'Text Output')}
              className="flex items-center gap-3 w-full p-2 hover:bg-zinc-800 rounded-lg transition-colors text-left"
            >
              <div className="p-1.5 bg-green-500/10 text-green-400 rounded-md">
                <MessageSquare size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">Text Output</span>
                <span className="text-xs text-zinc-500">Format final response</span>
              </div>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <Plus size={24} className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
}
