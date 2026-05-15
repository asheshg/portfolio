import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const stories = [
  ['intro-1.png', '7db17e03-957a-52fb-b1d8-d73a7dff6517'],
  ['intro-2.png', '7aae88e9-215d-5e93-a561-d5ab772a790e'],
  ['intro-3.png', '5c51c10e-e25a-5cdd-a057-8c62d046af88'],
  ['work-v0-1.png', '93fb461a-2947-591f-83ce-df3df2c9a31f'],
  ['work-v0-2.png', 'e2471fb9-38a7-559c-8c2c-9af8f52d5001'],
  ['work-v0-3.png', '8e4df7fe-4984-52ff-8c61-8df202d6256c'],
  ['work-v0-4.png', '8d367d4f-4c07-5ac1-a967-4bb463d67356'],
  ['figma-1.png', '1d6529a7-3498-546b-acd0-aa5a464e0522'],
  ['me-1.png', 'b22a6ee9-79d1-520e-b49a-6a5f08f3ff1d'],
  ['me-2.png', '0f4981e6-885d-5c84-86dc-3606ad4f5883'],
  ['contact-1.png', '5b200615-8242-583a-a69b-d9745baaa755']
];

const config = await readFile(`${process.env.USERPROFILE}/.codex/config.toml`, 'utf8');
const match = config.match(/\[mcp_servers\.penpot\][\s\S]*?url\s*=\s*"([^"]+)"/);
if (!match) throw new Error('Penpot MCP URL not found');

const url = match[1];
let sessionId;
let id = 1;

function parseSse(text) {
  const dataLine = text
    .split(/\r?\n/)
    .find((line) => line.startsWith('data: '));
  if (!dataLine) throw new Error(`No SSE data line: ${text.slice(0, 160)}`);
  return JSON.parse(dataLine.slice(6));
}

async function rpc(method, params) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/json, text/event-stream',
      'content-type': 'application/json',
      ...(sessionId ? { 'mcp-session-id': sessionId } : {})
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: id++,
      method,
      params
    })
  });

  sessionId ||= response.headers.get('mcp-session-id');
  const text = await response.text();
  const message = parseSse(text);
  if (message.error) throw new Error(message.error.message);
  return message.result;
}

await mkdir(resolve('static/stories'), { recursive: true });
await rpc('initialize', {
  protocolVersion: '2024-11-05',
  capabilities: {},
  clientInfo: { name: 'codex-penpot-export', version: '0.0.1' }
});

for (const [filename, shapeId] of stories) {
  const result = await rpc('tools/call', {
    name: 'export_shape',
    arguments: { shapeId, format: 'png', mode: 'shape' }
  });
  const image = result.content?.find((item) => item.type === 'image');
  if (!image?.data) throw new Error(`No image data returned for ${filename}`);
  await writeFile(resolve('static/stories', filename), Buffer.from(image.data, 'base64'));
  console.log(`${filename} ${Buffer.byteLength(image.data, 'base64')} bytes`);
}
