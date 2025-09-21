import { success, z } from "zod";
import { tool } from "ai";
import * as path from "path";
import * as fs from "fs/promises";
import { formatReviewToMarkdown } from "../utils/reviewUtils";

const reviewInputSchema = z.object({
    filePath: z.string().min(1).describe("The path to the code file to review"),
    summary: z.string().min(1).describe("A summary of the code review"),
    suggestions: z.string().min(1).describe("Suggestions for improvement"),
});

async function createReviewFile({ filePath, summary, suggestions }: z.infer<typeof reviewInputSchema>) {
    const resolvedPath = path.resolve(filePath);
    const resolvedData = { summary, suggestions: suggestions.split("\n").map(s => s.trim()).filter(s => s) };

    const reviewContent = formatReviewToMarkdown(resolvedData);

    try {
        await fs.writeFile(resolvedPath, reviewContent, "utf-8");
        return { success: true, message: `Review file created at ${resolvedPath}` };
    } catch (error) {
        console.error("Failed to write review file:", error);
        return { success: false, message: "Failed to create the review file due to an I/O error." };
    }
}

export const reviewFormatterTool = tool({
    description: "Formats and writes a code review summary and suggestions to a markdown file",
    inputSchema: reviewInputSchema,
    execute: createReviewFile,
});
