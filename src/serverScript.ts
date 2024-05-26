import * as lspClient from '../src/main';
import { JSONRPCEndpoint, LspClient } from '../src/main';
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
//import * as path from 'path';
import { pathToFileURL } from "url";
import express from 'express';

//const rootPath = path.resolve(path.join(__dirname, 'mock'));
const app = express();


let client: LspClient | null = null;
let endpoint: JSONRPCEndpoint | null = null;

app.get('/start_server', (req, res) => {
  if (req.query.server === 'coq') {
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
    endpoint = new lspClient.JSONRPCEndpoint(
      process.stdin,
      process.stdout,
    );

    // create the LSP client
    client = new LspClient(endpoint);

    res.send('Server started');
  }
});

// Define an endpoint to initialize the server
app.get('/initialize_server', (req, res) => {
  if (client && process) {
    const filePath = req.query.filePath as string;
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
          uri: pathToFileURL(filePath).href
        }
      ],
      rootUri: null
    });
    res.send('Client initialized');
  } else {
    res.status(500).send('Server is not started');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
