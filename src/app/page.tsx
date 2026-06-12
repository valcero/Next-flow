import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { createWorkflow } from '@/app/actions';
import WorkflowCard from '@/components/WorkflowCard';
import { Plus } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    return null; 
  }

  const workflows = await prisma.workflow.findMany({
    where: { userId },
    orderBy: { lastEditedAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">N</div>
          <h1 className="text-xl font-semibold tracking-tight">NextFlow</h1>
        </div>
        <div className="flex items-center gap-4">
          <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">My Workflows</h2>
          <form action={createWorkflow}>
            <button 
              type="submit"
              className="bg-white text-black px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-zinc-200 transition-colors"
            >
              <Plus size={16} />
              Create New
            </button>
          </form>
        </div>

        {workflows.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50">
            <h3 className="text-xl font-medium text-white mb-2">No workflows yet</h3>
            <p className="text-zinc-400 mb-6 max-w-sm mx-auto">
              Create your first LLM workflow to start automating tasks and generating content.
            </p>
            <form action={createWorkflow}>
              <button 
                type="submit"
                className="bg-white text-black px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 mx-auto hover:bg-zinc-200 transition-colors"
              >
                <Plus size={18} />
                Create New Workflow
              </button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
