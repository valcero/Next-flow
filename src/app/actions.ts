'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { tasks } from '@trigger.dev/sdk/v3';

export async function runWorkflow(workflowId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const existing = await prisma.workflow.findUnique({
    where: { id: workflowId, userId },
  });

  if (!existing) throw new Error('Not Found');

  const run = await prisma.run.create({
    data: {
      workflowId,
      status: 'PENDING',
    }
  });

  await tasks.trigger('execute-workflow', { runId: run.id });

  return run.id;
}

export async function createWorkflow(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const name = formData.get('name') as string || 'Untitled Workflow';

    const workflow = await prisma.workflow.create({
      data: {
        userId,
        name,
        nodes: [],
        edges: [],
      },
    });

    revalidatePath('/');
    redirect(`/workflow/${workflow.id}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error && (error.digest as string).startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Error creating workflow:', error);
    throw error;
  }
}

export async function deleteWorkflow(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await prisma.workflow.delete({
    where: {
      id,
      userId, // Ensure the user owns this workflow
    },
  });

  revalidatePath('/');
}

export async function saveWorkflow(id: string, nodes: any[], edges: any[]) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const existing = await prisma.workflow.findUnique({
    where: { id, userId },
  });

  if (!existing) throw new Error('Not Found');

  await prisma.workflow.update({
    where: { id },
    data: {
      nodes,
      edges,
    },
  });
}

export async function getWorkflowRuns(workflowId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const existing = await prisma.workflow.findUnique({
    where: { id: workflowId, userId },
  });

  if (!existing) throw new Error('Not Found');

  return prisma.run.findMany({
    where: { workflowId },
    include: { nodeRuns: { orderBy: { startedAt: 'asc' } } },
    orderBy: { startedAt: 'desc' },
  });
}

export async function renameWorkflow(id: string, newName: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await prisma.workflow.update({
    where: {
      id,
      userId,
    },
    data: {
      name: newName,
    },
  });

  revalidatePath('/');
}
