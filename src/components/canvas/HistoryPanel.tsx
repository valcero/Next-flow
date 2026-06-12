'use client';

import { useState, useEffect } from 'react';
import { getWorkflowRuns } from '@/app/actions';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, PlayCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function HistoryPanel({ workflowId }: { workflowId: string }) {
  const [runs, setRuns] = useState<any[]>([]);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const data = await getWorkflowRuns(workflowId);
        setRuns(data);
      } catch (err) {
        console.error("Failed to fetch runs", err);
      }
    };
    
    fetchRuns();
    // Poll every 3 seconds for updates
    const interval = setInterval(fetchRuns, 3000);
    return () => clearInterval(interval);
  }, [workflowId]);

  return (
    <div className="absolute top-0 left-0 h-full w-72 bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800 shadow-2xl z-40 flex flex-col animate-in slide-in-from-left-full duration-300">
      <div className="p-4 border-b border-zinc-800 shrink-0">
        <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
          <Clock size={16} className="text-zinc-400" /> Execution History
        </h3>
      </div>
      
      <div className="overflow-y-auto flex-1 p-3 space-y-3">
        {runs.length === 0 ? (
          <p className="text-zinc-500 text-xs text-center mt-6">No runs yet. Click 'Run Workflow' to start!</p>
        ) : runs.map((run) => (
          <div key={run.id} className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/50 shadow-sm">
            <button 
              onClick={() => setExpandedRunId(expandedRunId === run.id ? null : run.id)}
              className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                {run.status === 'COMPLETED' && <CheckCircle2 size={16} className="text-green-500" />}
                {run.status === 'FAILED' && <XCircle size={16} className="text-red-500" />}
                {(run.status === 'RUNNING' || run.status === 'PENDING') && <PlayCircle size={16} className="text-blue-500 animate-pulse" />}
                <span className="text-xs font-medium text-zinc-200">
                  {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
                </span>
              </div>
              <ChevronRight size={14} className={`text-zinc-500 transition-transform ${expandedRunId === run.id ? 'rotate-90' : ''}`} />
            </button>
            
            {expandedRunId === run.id && (
              <div className="px-3 pb-3 pt-2 border-t border-zinc-800/50 bg-zinc-950/50">
                <div className="space-y-3">
                  {run.nodeRuns.length === 0 && (
                    <div className="text-xs text-zinc-600 italic">No node executions yet...</div>
                  )}
                  {run.nodeRuns.map((nodeRun: any) => (
                    <div key={nodeRun.id} className="flex flex-col gap-1.5 text-xs">
                      <div className="flex items-center justify-between text-zinc-300 font-medium">
                        <span className="truncate max-w-[140px]">{nodeRun.nodeId}</span>
                        <span className={
                          nodeRun.status === 'COMPLETED' ? 'text-green-400' :
                          nodeRun.status === 'FAILED' ? 'text-red-400' : 'text-blue-400'
                        }>{nodeRun.status}</span>
                      </div>
                      {nodeRun.error && (
                        <div className="text-red-400 bg-red-950/30 p-2 rounded border border-red-900/50">{nodeRun.error}</div>
                      )}
                      {nodeRun.output && (
                        <pre className="text-zinc-400 bg-zinc-900 p-2 rounded border border-zinc-800 overflow-x-auto text-[10px] whitespace-pre-wrap">
                          {JSON.stringify(nodeRun.output, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
