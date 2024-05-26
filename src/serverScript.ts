import * as lspClient from '../src/main';
import {JSONRPCEndpoint, LspClient} from '../src/main';
import {ChildProcessWithoutNullStreams, spawn} from "child_process";
import * as path from 'path';
import {pathToFileURL} from "url";

const rootPath = path.resolve(path.join(__dirname, 'mock'));

const process: ChildProcessWithoutNullStreams = spawn(
    'C:\\Coq-Platform~8.19-lsp\\bin\\coq-lsp.exe',
    {
      shell: true,
      stdio: 'pipe'
    }
);

// Listen for data on the stdout stream
process.stdout.on('data', (data: Buffer) => {
  console.log(`stdout: ${data.toString()}`);

  // Check if the data contains a message indicating the server has started
  if (data.toString().includes('Server started')) {
    console.log('Language server has started successfully.');
  }
});

// Listen for data on the stderr stream
process.stderr.on('data', (data: Buffer) => {
  console.error(`stderr: ${data.toString()}`);
});

// create an RPC endpoint for the process
const endpoint: JSONRPCEndpoint = new lspClient.JSONRPCEndpoint(
    process.stdin,
    process.stdout,
);

// create the LSP client
const client: LspClient = new LspClient(endpoint);

client.initialize({
    processId: process.pid,
    capabilities: {},
    clientInfo: {
        name: 'lspClientExample',
        version: '0.0.9'
    },
    workspaceFolders: [
        {
            name: 'workspace',
            uri: pathToFileURL(rootPath).href
        }
    ],
    rootUri: null
});