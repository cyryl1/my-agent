import { stepCountIs, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { SYSTEM_PROMPT } from "./prompt";
import * as path from 'path';
import * as fs from 'fs/promises';
import { getFileChangesInDirectoryTool } from "./tools/fileChange";
import { generateMarkdownFileTool } from "./tools/markdownGenerator";
import { generateCommitMessageTool } from "./tools/commitMessageGenerator";


const codeReviewAgent = async (prompt: string) => {
    const filePathRegex = /(\.\/|\.\.\/|\/|~|\\)[\w\s\-\._\/]+|([A-Z]:\\[\w\s\-\._\\]+)/i;
    const hasFilePath = filePathRegex.test(prompt);

    if (!hasFilePath) {
        console.error("Error: The prompt must include a file path (e.g., '../my-project' or './src/my-file.js').");
        console.log("Please re-run the command with a path specified in your prompt.");
        process.exit(1);
    }


    const result = await streamText({
        model: google("models/gemini-2.5-flash"),
        prompt,
        system: SYSTEM_PROMPT,
        tools: {
            getFileChangesInDirectoryTool: getFileChangesInDirectoryTool,
            generateMarkdownFileTool: generateMarkdownFileTool,
            generateCommitMessageTool: generateCommitMessageTool,
        },
        stopWhen: stepCountIs(10),
    });

    for await (const chunk of result.textStream) {
        process.stdout.write(chunk);
    }
};

const userPrompt = process.argv.slice(2).join(" ");

if (!userPrompt) {
    console.error("Error: Please provide a prompt as a command-line argument.");
    console.log("Example: bun run index.ts \"Review the code in '../my-agent' and then generate a commit message and a markdown file.\"");
    process.exit(1);
}

await codeReviewAgent(userPrompt);
