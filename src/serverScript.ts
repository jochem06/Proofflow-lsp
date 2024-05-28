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
      'C:\\Users\\20212170\\.elan\\toolchains\\leanprover--lean4---stable\\bin\\lean.exe',
      ['--server'],
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
  if (client !== null) {
    const filePath = req.query.filePath as string;
    console.log('process.pid:', process.pid);
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
    }).then((result) => {
      res.send('Client initialized' + result);
    });
    
  } else {
    res.status(500).send('Server is not started');
  }
});

app.get('/initialized', (_, res) => {
  client.initialized();
  res.send('Initialized');
});

app.get('/shutdown', (_, res) => {
  client.shutdown();
  res.send('Client has been shut down');
});

app.get('/exit', (_, res) => {
  client.exit();
  res.send('Client exited');
});

app.get('/didOpen', (req, res) => {
  if (client !== null) {
    client.didOpen({
      textDocument: { //TODO: figure out how exactly the parameters work and implement
        uri: req.query.uri as string,
        languageId: req.query.languageId as string,
        version: parseInt(req.query.version as string), //TODO: figure out how to get the version
        text: req.query.text as string
      }
    });
    res.send('Document opened');
  }
});

app.get('/didClose', (req, res) => {
  if (client !== null) {
    client.didClose({
      textDocument: {
        uri: req.query.uri as string
      }
    });
    res.send('Document closed');
  }
});

app.get('/documentSymbol', (req, res) => {
  if (client !== null) {
    client.documentSymbol({
      textDocument: {
        uri: req.query.uri as string
      }
    }).then((result) => {
      res.send(result);
    });
  }
});

app.get('/references', (req, res) => {
  if (client !== null) {
    client.references({
      context: {
        includeDeclaration: true
      },
      textDocument: {
        uri: req.query.uri as string
      },
      position: {
        line: parseInt(req.query.line as string),
        character: parseInt(req.query.character as string)
      }
    }).then((result) => {
      res.send(result);
    });
  }
});

app.get('/definition', (req, res) => {
  if (client !== null) {
    client.definition({
      textDocument: {
        uri: req.query.uri as string
      },
      position: {
        line: parseInt(req.query.line as string),
        character: parseInt(req.query.character as string)
      }
    }).then((result) => {
      res.send(result);
    });
  }
});

app.get('/typeDefinition', (req, res) => {
  if (client !== null) {
    client.typeDefinition({
      textDocument: {
        uri: req.query.uri as string
      },
      position: {
        line: parseInt(req.query.line as string),
        character: parseInt(req.query.character as string)
      }
    }).then((result) => {
      res.send(result);
    });
  }
});

app.get('/signatureHelp', (req, res) => {
  if (client !== null) {
    client.signatureHelp({
      textDocument: {
        uri: req.query.uri as string
      },
      position: {
        line: parseInt(req.query.line as string),
        character: parseInt(req.query.character as string)
      },
      context: {
        triggerKind: lspClient.SignatureHelpTriggerKind.Invoked,
        isRetrigger: false
      }
    }).then((result) => {
      res.send(result);
    });
  }
});

app.get('/once', (req, res) => {
  if (client !== null) {
    client.once(req.query.method as string); //TODO: ???
    res.send(client.once(req.query.method as string));
  }
});

app.get('/hover', (req, res) => {
  if (client !== null) {
    client.hover({
      textDocument: {
        uri: req.query.uri as string
      },
      position: {
        line: parseInt(req.query.line as string),
        character: parseInt(req.query.character as string)
      }
    }).then((result) => {
      res.send(result);
    });
  }
});

app.get('/declaration', (req, res) => {
  if (client !== null) {
    client.gotoDeclaration({
      textDocument: {
        uri: req.query.uri as string
      },
      position: {
        line: parseInt(req.query.line as string),
        character: parseInt(req.query.character as string)
      }
    }).then((result) => {
      res.send(result);
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
