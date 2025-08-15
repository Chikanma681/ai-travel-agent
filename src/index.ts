import { openrouter } from '@openrouter/ai-sdk-provider';
import { streamText, stepCountIs, ModelMessage } from 'ai';
import 'dotenv/config';
import * as readline from 'node:readline/promises';
import { findFlight } from "./tools";

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages:ModelMessage[] = [];

async function main() {
  while (true) {
    const userInput = await terminal.question('You: ');

    messages.push({ role: 'user', content: userInput });

    const result = streamText({
      model: openrouter('openai/gpt-4o-mini'),
      messages,
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

    messages.push({ role: 'assistant', content: fullResponse });
  }
}

main().catch(console.error);