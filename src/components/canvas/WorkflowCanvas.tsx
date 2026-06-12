'use client';

import { useCallback } from 'react';
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
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Workflow } from '@prisma/client';

const initialNodes = [
  { 
    id: 'request-inputs', 
    type: 'default', // We'll change this to a custom node type later
    position: { x: 100, y: 200 }, 
    data: { label: 'Request-Inputs' },
    deletable: false 
  },
  { 
    id: 'response', 
    type: 'default', // We'll change this to a custom node type later
    position: { x: 800, y: 200 }, 
    data: { label: 'Response' },
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

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
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
    </div>
  );
}
