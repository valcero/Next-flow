import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import WorkflowCanvas from '@/components/canvas/WorkflowCanvas';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function WorkflowBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const resolvedParams = await params;

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: resolvedParams.id,
      userId,
    },
  });

  if (!workflow) {
    notFound();
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black text-white">
      {/* Header */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors flex items-center justify-center p-1 rounded hover:bg-zinc-800">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-medium text-sm">{workflow.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs flex items-center gap-1.5 ${workflow.status === 'RUNNING' ? 'text-green-400' : 'text-zinc-500'}`}>
            <span className={`w-2 h-2 rounded-full ${workflow.status === 'RUNNING' ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`}></span>
            {workflow.status}
          </span>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 relative">
        <WorkflowCanvas workflow={workflow} />
      </main>
    </div>
  );
}
