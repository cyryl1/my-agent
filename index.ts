// console.log("Hello via Bun!");

import { generateText } from "ai";
// Import the google module from the ai-sdk pckage
import { google } from "@ai-sdk/google";

// Specify the model to use for generating text and prompt
const { text } = await generateText({
    model: google("models/gemini-2.5-flash"),
    prompt: "How do I become a billionaire in the next 10 years?",
});

console.log(text);
