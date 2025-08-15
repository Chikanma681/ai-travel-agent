import { openrouter } from '@openrouter/ai-sdk-provider';
import { streamText, stepCountIs } from 'ai';
import type { ModelMessage } from 'ai'
import dotenv from "dotenv";

import * as readline from 'node:readline/promises';
import { findFlight } from "./tools.ts";
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Database setup
type Data = {
  messages: ModelMessage[];
};

const file = join(__dirname, '../data/db.json');
const adapter = new JSONFile<Data>(file);
const defaultData: Data = { messages: [] };
const db = new Low(adapter, defaultData);

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  // Initialize database
  await db.read();
  
  // Load existing messages
  console.log(`Loaded ${db.data.messages.length} previous messages from database.`);
  
  while (true) {
    const userInput = await terminal.question('You: ');

    // Add user message to database
    db.data.messages.push({ role: 'user', content: userInput });
    await db.write();

    const result = streamText({
      model: openrouter('openai/gpt-4o-mini'),
      messages: db.data.messages,
      system: "You are AI flight assistant that uses Amadeus API to find flights. You can answer questions about flights, such as 'find me a flight from SYD to BKK on 2023-05-02'.",
      tools: {
        findFlight: findFlight,
      },
      stopWhen: stepCountIs(3),
    });

    let fullResponse = '';
    process.stdout.write('\nAssistant: ');
    for await (const delta of result.textStream) {
      fullResponse += delta;
      process.stdout.write(delta);
    }
    process.stdout.write('\n\n');

    // Add assistant message to database
    db.data.messages.push({ role: 'assistant', content: fullResponse });
    await db.write();
  }
}

main().catch(console.error);