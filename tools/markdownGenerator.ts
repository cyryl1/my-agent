import { success, z } from "zod";
import { tool } from "ai";
import { writeFile } from "fs/promises";
import { join } from "path";
import { file } from "bun";

const markdownInput = z.object({
    filePath: z.string().min(1).describe("The path where the markdown file will be created"),
    content: z.string().min(1).describe("The markdown content to write to the file"),
});

async function generateMarkdownFile({ filePath, content }: z.infer<typeof markdownInput>) {
    try {
        const fullPath = join(process.cwd(), filePath);
        await writeFile(fullPath, content);
    } catch (error) {
        console.error(`Failed to write markdown file: ${error}`);
        return { success: false, message: `Failed to write markdown file: ${error}` };
    }
}

export const generateMarkdownFileTool = tool({
    description: "Generates a markdown file at the specified path with the provided content",
    inputSchema: markdownInput,
    execute: generateMarkdownFile,
})
