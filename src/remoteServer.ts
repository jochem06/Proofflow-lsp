import WebSocket, { WebSocketServer } from 'ws';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

const port = 8080;
let lspProcess: ChildProcessWithoutNullStreams | null = null;
let predefinedStdin: NodeJS.WritableStream | null = null;
let predefinedStdout: NodeJS.ReadableStream | null = null;
let predefinedStderr: NodeJS.ReadableStream | null = null;

const wss = new WebSocketServer({ port }, () => {
  console.log(`Server is listening on port ${port}`);
});

// Function to start the lsp process
async function startLspProcess(language: string) {
  if (lspProcess === null) {
    if (language === 'coq') {
      lspProcess = spawn('C:\\cygwin_wp\\home\\runneradmin\\.opam\\wp\\bin\\coq-lsp.exe', {
        shell: true,
        stdio: 'pipe'
      });
      console.log('Coq LSP started');
    } else if (language === 'lean') {
      lspProcess = spawn('C:\\Users\\20212170\\.elan\\toolchains\\leanprover--lean4---stable\\bin\\lean.exe', ['--server'], {
        shell: true,
        stdio: 'pipe'
      });
      console.log('Lean LSP started');
    }

    predefinedStdin = lspProcess.stdin;
    predefinedStdout = lspProcess.stdout;
    predefinedStderr = lspProcess.stderr;

    // Listen for messages on predefined stdout and post them on the WebSocket client
    predefinedStdout.on('data', (data: Buffer) => {
      broadcastMessage(data.toString());
    });

    // Listen for messages on predefined stderr and post them on the WebSocket client
    predefinedStderr.on('data', (data: Buffer) => {
      broadcastMessage(data.toString());
    });

    lspProcess.on('exit', (code, signal) => {
      console.log(`lspProcess exited with code ${code} and signal ${signal}`);
      lspProcess = null;
      predefinedStdin = null;
      predefinedStdout = null;
      predefinedStderr = null;
    });
  }
}

// Function to broadcast a message to all connected clients
function broadcastMessage(message: string) {
  console.log('Broadcasting message:', message);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Listen for new connections
wss.on('connection', (ws) => {
  console.log('New client connected');

  // Handle incoming messages from the WebSocket client
  ws.on('message', async (data: WebSocket.Data) => {
    const message = data.toString();
    if (message === 'start-coq-lsp') {
      console.log('Starting Coq LSP');
      await startLspProcess('coq');
      ws.send('coq-lsp-started|' + process.pid);
    } else if (message === 'start-lean-lsp') {
      console.log('Starting Lean LSP');
      await startLspProcess('lean');
      ws.send('lean-lsp-started|' + process.pid);
    } else if (predefinedStdin) {
      try {
        console.log('Received message:', message);
        // Post the message on predefined stdin
        predefinedStdin.write(message + '\n'); // Added '\n' for proper message termination
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    } else {
      console.error('No LSP process running');
    }
  });

  // Handle WebSocket close event
  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Handle WebSocket error event
  ws.on('error', (error: Error) => {
    console.error('WebSocket error:', error);
  });
});
