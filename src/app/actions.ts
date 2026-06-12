'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createWorkflow(formData: FormData) {
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
