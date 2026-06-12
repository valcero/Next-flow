'use client';

import { X } from 'lucide-react';

interface NodeConfigSidebarProps {
  node: any;
  onClose: () => void;
  onUpdate: (id: string, data: any) => void;
}

export default function NodeConfigSidebar({ node, onClose, onUpdate }: NodeConfigSidebarProps) {
  if (!node) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUpdate(node.id, {
      ...node.data,
      [name]: value,
    });
  };

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800 shadow-2xl z-40 animate-in slide-in-from-right-full duration-300 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 shrink-0">
        <h3 className="font-semibold text-zinc-100">Configure Node</h3>
        <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors">
          <X size={18} />
        </button>
      </div>
      
      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        {/* Node Name/Label */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Node Name</label>
          <input
            type="text"
            name="label"
            value={node.data.label || ''}
            onChange={handleChange}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
          />
        </div>

        {/* Dynamic Fields based on IconType */}
        {node.data.iconType === 'llm' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">System Prompt</label>
            <textarea
              name="prompt"
              value={node.data.prompt || ''}
              onChange={handleChange}
              rows={8}
              placeholder="You are a helpful AI assistant..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow resize-none"
            />
          </div>
        )}

        {node.data.iconType === 'condition' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Expression</label>
            <input
              type="text"
              name="expression"
              value={node.data.expression || ''}
              onChange={handleChange}
              placeholder="e.g. {{inputs.score}} > 50"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow font-mono"
            />
          </div>
        )}

        {node.data.iconType === 'output' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Output Format</label>
            <textarea
              name="outputFormat"
              value={node.data.outputFormat || ''}
              onChange={handleChange}
              rows={6}
              placeholder='{"response": "{{llm.output}}"}'
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow font-mono resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
