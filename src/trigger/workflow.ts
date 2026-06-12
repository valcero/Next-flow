import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const executeWorkflow = task({
  id: "execute-workflow",
  run: async (payload: { runId: string }) => {
    // 1. Fetch the Run and Workflow
    const run = await prisma.run.findUnique({
      where: { id: payload.runId },
      include: { workflow: true },
    });

    if (!run) throw new Error("Run not found");

    await prisma.run.update({
      where: { id: run.id },
      data: { status: "RUNNING" },
    });

    const nodes = run.workflow.nodes as any[];
    const edges = run.workflow.edges as any[];

    // Very simple execution engine:
    // Find trigger node (Request-Inputs)
    const triggerNode = nodes.find(n => n.id === 'request-inputs' || n.data.iconType === 'trigger');
    if (!triggerNode) {
      await finishRun(run.id, "FAILED");
      return;
    }

    const state: Record<string, any> = {};

    try {
      // Step 1: Trigger
      await recordNodeRun(run.id, triggerNode.id, "COMPLETED", { received: "webhook_payload" }, { success: true });

      // Find next node connected from trigger
      let currentEdge = edges.find(e => e.source === triggerNode.id);
      
      while (currentEdge) {
        const nextNode = nodes.find(n => n.id === currentEdge!.target);
        if (!nextNode) break;

        await recordNodeRun(run.id, nextNode.id, "RUNNING");

        if (nextNode.data.iconType === 'llm') {
          const prompt = nextNode.data.prompt || "Hello world";
          
          let responseText = "";
          try {
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });
            responseText = response.text || "No response";
            const output = { text: responseText };
            state[nextNode.id] = output;
            await recordNodeRun(run.id, nextNode.id, "COMPLETED", { prompt }, output);
          } catch (apiError: any) {
            await recordNodeRun(run.id, nextNode.id, "FAILED", { prompt }, null, apiError.message);
            throw new Error(`LLM Node Failed: ${apiError.message}`);
          }
        } else if (nextNode.data.iconType === 'output' || nextNode.data.iconType === 'response' || nextNode.id === 'response') {
          const outputFormat = nextNode.data.outputFormat || "Success";
          await recordNodeRun(run.id, nextNode.id, "COMPLETED", state, { result: outputFormat });
        } else {
          await recordNodeRun(run.id, nextNode.id, "COMPLETED", {}, { result: "Skipped" });
        }

        currentEdge = edges.find(e => e.source === nextNode.id);
      }

      await finishRun(run.id, "COMPLETED");

    } catch (err: any) {
      console.error(err);
      await finishRun(run.id, "FAILED");
    }
  },
});

async function recordNodeRun(runId: string, nodeId: string, status: string, input?: any, output?: any, error?: string) {
  const existing = await prisma.nodeRun.findFirst({
    where: { runId, nodeId }
  });

  if (existing) {
    await prisma.nodeRun.update({
      where: { id: existing.id },
      data: { 
        status, 
        input: input ? input : undefined, 
        output: output ? output : undefined, 
        error: error ? error : undefined,
        completedAt: status !== 'RUNNING' ? new Date() : null 
      }
    });
  } else {
    await prisma.nodeRun.create({
      data: {
        runId,
        nodeId,
        status,
        input: input ? input : undefined,
        output: output ? output : undefined,
        error: error ? error : undefined,
        startedAt: new Date(),
        completedAt: status !== 'RUNNING' ? new Date() : null 
      }
    });
  }
}

async function finishRun(runId: string, status: string) {
  await prisma.run.update({
    where: { id: runId },
    data: { status, finishedAt: new Date() }
  });
}
