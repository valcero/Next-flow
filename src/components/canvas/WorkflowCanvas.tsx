'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  useOnSelectionChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Workflow } from '@prisma/client';
import BaseNode from './nodes/BaseNode';
import FloatingToolbar from './FloatingToolbar';
import NodeConfigSidebar from './NodeConfigSidebar';
import HistoryPanel from './HistoryPanel';
import { saveWorkflow, runWorkflow } from '@/app/actions';
import { Play, History } from 'lucide-react';

const nodeTypes = {
  customNode: BaseNode,
};

const initialNodes = [
  { 
    id: 'request-inputs', 
    type: 'customNode', 
    position: { x: 100, y: 250 }, 
    data: { 
      label: 'Request-Inputs',
      iconType: 'trigger',
      subtitle: 'Webhook Trigger',
      hideInput: true 
    },
    deletable: false 
  },
  { 
    id: 'response', 
    type: 'customNode', 
    position: { x: 800, y: 250 }, 
    data: { 
      label: 'Response',
      iconType: 'response',
      subtitle: 'Final Output',
      hideOutput: true 
    },
    deletable: false 
  }
];

export default function WorkflowCanvas({ workflow }: { workflow: Workflow }) {
  // If the workflow has saved nodes, use them. Otherwise, fallback to initial default nodes.
  const savedNodes = Array.isArray(workflow.nodes) && workflow.nodes.length > 0 
    ? workflow.nodes 
    : initialNodes;
    
  const savedEdges = Array.isArray(workflow.edges) && workflow.edges.length > 0 
    ? workflow.edges 
    : [];

  const [nodes, setNodes, onNodesChange] = useNodesState(savedNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(savedEdges as any);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const isInitialRender = useRef(true);

  useOnSelectionChange({
    onChange: ({ nodes: selectedNodes }) => {
      setSelectedNodeId(selectedNodes.length > 0 ? selectedNodes[0].id : null);
    },
  });

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  const handleUpdateNode = (id: string, newData: any) => {
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: newData };
        }
        return node;
      })
    );
  };

  // Debounced Auto-Save
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const handler = setTimeout(async () => {
      setIsSaving(true);
      try {
        await saveWorkflow(workflow.id, nodes, edges);
        setLastSaved(new Date());
      } catch (err) {
        console.error('Failed to save workflow', err);
      } finally {
        setIsSaving(false);
      }
    }, 2000);

    return () => clearTimeout(handler);
  }, [nodes, edges, workflow.id]);

  const handleRun = async () => {
    try {
      setIsRunning(true);
      await saveWorkflow(workflow.id, nodes, edges);
      await runWorkflow(workflow.id);
      setIsHistoryOpen(true);
    } catch (err) {
      console.error("Failed to run workflow", err);
    } finally {
      setIsRunning(false);
    }
  };

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddNode = (type: string, name: string) => {
    // Generate a slightly random position in the center so they don't overlap completely
    const offset = Math.floor(Math.random() * 40) - 20;
    
    const newNode = {
      id: `${type}-${Date.now()}`,
      type: 'customNode',
      position: { x: 400 + offset, y: 300 + offset }, 
      data: {
        label: name,
        iconType: type,
        subtitle: 'Unconfigured',
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="w-full h-full bg-zinc-950 relative">
      {/* Top right actions */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        {/* Saving Indicator */}
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
          {isSaving ? (
            <>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs text-zinc-400 font-medium">Saving...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-zinc-400 font-medium">
                Saved {lastSaved ? lastSaved.toLocaleTimeString() : ''}
              </span>
            </>
          )}
        </div>

        <button
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className={`p-1.5 rounded-lg border transition-colors flex items-center justify-center ${isHistoryOpen ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
          title="Execution History"
        >
          <History size={16} />
        </button>

        <button
          onClick={handleRun}
          disabled={isRunning || isSaving}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-2 transition-colors border border-blue-500 shadow-lg shadow-blue-500/20"
        >
          <Play size={14} className={isRunning ? 'animate-pulse' : ''} />
          {isRunning ? 'Starting...' : 'Run Workflow'}
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        colorMode="dark"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#3f3f46" />
        <MiniMap 
          nodeColor="#2563eb"
          maskColor="rgba(0,0,0,0.6)"
          className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden"
        />
        <Controls className="bg-zinc-900 border-zinc-800 fill-white" />
      </ReactFlow>

      {/* Floating Toolbar */}
      <FloatingToolbar onAddNode={handleAddNode} />

      {/* History Panel */}
      {isHistoryOpen && <HistoryPanel workflowId={workflow.id} />}

      {/* Node Config Sidebar */}
      <NodeConfigSidebar 
        node={selectedNode} 
        onClose={() => setSelectedNodeId(null)} 
        onUpdate={handleUpdateNode} 
      />
    </div>
  );
}
