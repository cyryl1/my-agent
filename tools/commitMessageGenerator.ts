import { z } from "zod";
import { generateText, tool } from "ai";
import { getFileChangesInDirectoryTool } from "./fileChange";
import { google } from "@ai-sdk/google";

const commitMessageInput = z.object({
    rootDir: z.string().min(1).describe("The root directory of the changes"),
})

async function generateCommitMessage({ rootDir }: z.infer<typeof commitMessageInput>) {
    const fileChanges = await (getFileChangesInDirectoryTool as any).execute({ rootDir });

    const diffText = fileChanges.map((change: { file: string; diff: string }) => 
        `File: ${change.file}\nDiff:\n${change.diff}`
    ).join("\n\n");
    const { text } = await generateText({
        model: google("models/gemini-2.5-flash"), // Use an AI model
        prompt: `Based on the following code diffs, generate a single, descriptive Git commit message following the Conventional Commits specification. Use a concise subject line and a detailed body. The diffs are:\n\n${diffText}`
    });

    return { message: text };
}

export const generateCommitMessageTool = tool({
    description: "Generates a commit message based on recent file changes",
    inputSchema: commitMessageInput,
    execute: generateCommitMessage,
})
