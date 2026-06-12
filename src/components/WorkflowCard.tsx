'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatDistanceToNow } from 'date-fns';
import { deleteWorkflow, renameWorkflow } from '@/app/actions';
import { MoreVertical, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { Workflow } from '@prisma/client';

export default function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      await deleteWorkflow(workflow.id);
    }
  };

  const handleRename = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newName = formData.get('name') as string;
    if (newName && newName !== workflow.name) {
      await renameWorkflow(workflow.id, newName);
    }
    setIsRenaming(false);
    setMenuOpen(false);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors group relative flex flex-col justify-between min-h-[140px]">
      <div className="flex justify-between items-start">
        {isRenaming ? (
          <form onSubmit={handleRename} className="flex-1 mr-4">
            <input
              type="text"
              name="name"
              defaultValue={workflow.name}
              className="w-full bg-zinc-800 text-white rounded px-2 py-1 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onBlur={() => setIsRenaming(false)}
            />
          </form>
        ) : (
          <Link href={`/workflow/${workflow.id}`} className="text-lg font-semibold text-white truncate pr-4 hover:text-blue-400 transition-colors">
            {workflow.name}
          </Link>
        )}

        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-zinc-400 hover:text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical size={18} />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-10">
              <button 
                onClick={() => { setIsRenaming(true); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
              >
                <Edit2 size={14} /> Rename
              </button>
              <button 
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${workflow.status === 'RUNNING' ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`}></span>
          {workflow.status}
        </span>
        <span>Edited {formatDistanceToNow(new Date(workflow.lastEditedAt))} ago</span>
      </div>
    </div>
  );
}
