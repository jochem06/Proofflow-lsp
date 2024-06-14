import * as lspClient from '../src/main';
import { JSONRPCEndpoint, LspClient } from '../src/main';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import WebSocket from 'ws';

let client: LspClient | null = null;
let endpoint: JSONRPCEndpoint | null = null;

async function startCoqServer(): Promise<string> {
  return new Promise((resolve, _) => {
    const child: ChildProcessWithoutNullStreams = spawn(
      'C:\\cygwin_wp\\home\\runneradmin\\.opam\\wp\\bin\\coq-lsp.exe'
    );

    child.stdout.on('data', (data: Buffer) => {
      console.log(`stdout: ${data}`);
      if (data.toString().includes('Server started')) {
        console.log('Language server has started successfully.');
        resolve('Server started');
      }
    });
    child.stderr.on('data', (data: Buffer) => {
      console.error(`stderr: ${data.toString()}`);
      resolve('Error starting server: ' + data.toString());
    });

    endpoint = new lspClient.JSONRPCEndpoint(child.stdin, child.stdout);
    client = new LspClient(endpoint);
    
    setTimeout(()=>resolve("Server should have started maybe idk"), 1000)
  });
}

function startLeanServer(): string {
  const process: ChildProcessWithoutNullStreams = spawn(
    '/home/flore/.elan/bin/lean',
    ['--server'],
    {
      shell: true,
      stdio: 'pipe',
    },
  );

  let serverStatus = 'Server not started';

  process.stdout.on('data', (data: Buffer) => {
    console.log(`stdout: ${data.toString()}`);
    if (data.toString().includes('Server started')) {
      console.log('Language server has started successfully.');
      serverStatus = 'Server started';
    }
  });

  process.stderr.on('data', (data: Buffer) => {
    console.error(`stderr: ${data.toString()}`);
    serverStatus = 'Error starting server: ' + data.toString();
  });

  endpoint = new lspClient.JSONRPCEndpoint(process.stdin, process.stdout);

  client = new LspClient(endpoint);
  return serverStatus;
}

async function initializeServer(params: lspClient.InitializeParams) {
  if (client !== null) {
    console.log('process.pid:', process.pid);
    try {
      const result = await client.initialize(params);
      return result;
    } catch (error) {
      console.error('Initialization error:', error);
      throw error;
    }
  } else {
    return 'Server is not started';
  }
}

function initialized() {
  if (client !== null) {
    client.initialized();
  }
}

function shutdown() {
  if (client !== null) {
    return client.shutdown();
  }
  return null;
}

function exit() {
  if (client !== null) {
    client.exit();
  }
}

function didOpen(
  data: lspClient.DidOpenTextDocumentParams,
  ws: WebSocket,
) {
  if (client !== null) {
    client.didOpen(data);
    endpoint.on('textDocument/publishDiagnostics', (params) => {
      console.log('Diagnostics received:', params);
      ws.send(JSON.stringify({ type: 'diagnostics', data: params }));
    });
  }
}

function didChange(
  data: lspClient.DidChangeTextDocumentParams,
) {
  if (client !== null) {
    client.didChange(data);
  }
}

function didClose(
  data: lspClient.DidCloseTextDocumentParams
) {
  if (client !== null) {
    client.didClose(data);
  }
}

async function documentSymbol(data: lspClient.DocumentSymbolParams): Promise<any> {
  if (client !== null) {
    try {
      const result = await client.documentSymbol(data);
      return result;
    } catch (error) {
      console.error('Error getting document symbols:', error);
      throw error;
    }
  } else {
    return 'Client is not initialized';
  }
}

async function references(
  data: lspClient.ReferenceParams
): Promise<any> {
  if (client !== null) {
    try {
      const result = await client.references(data);
      return result;
    } catch (error) {
      console.error('Error getting references:', error);
      throw error;
    }
  } else {
    return 'Client is not initialized';
  }
}

async function definition(
  data: lspClient.DefinitionParams
): Promise<any> {
  if (client !== null) {
    try {
      const result = await client.definition(data);
      return result;
    } catch (error) {
      console.error('Error getting definition:', error);
      throw error;
    }
  } else {
    return 'Client is not initialized';
  }
}

async function typeDefinition(
  data: lspClient.TypeDefinitionParams
): Promise<any> {
  if (client !== null) {
    try {
      const result = await client.typeDefinition(data);
      return result;
    } catch (error) {
      console.error('Error getting type definition:', error);
      throw error;
    }
  } else {
    return 'Client is not initialized';
  }
}

async function signatureHelp(
  data: lspClient.SignatureHelpParams
): Promise<any> {
  if (client !== null) {
    try {
      const result = await client.signatureHelp(data);
      return result;
    } catch (error) {
      console.error('Error getting signature help:', error);
      throw error;
    }
  } else {
    return 'Client is not initialized';
  }
}

async function hover(
  data: lspClient.HoverParams
): Promise<any> {
  if (client !== null) {
    try {
      const result = await client.hover(data);
      return result;
    } catch (error) {
      console.error('Error getting hover:', error);
      throw error;
    }
  } else {
    return 'Client is not initialized';
  }
}

async function completion(
  data: lspClient.CompletionParams
): Promise<any> {
  if (client !== null) {
    try {
      const result = await client.completion(data);
      return result;
    } catch (error) {
      console.error('Error getting completion:', error);
      throw error;
    }
  } else {
    return 'Autocomplete failed';
  }
}

async function gotoDeclaration(
  data: lspClient.DeclarationParams
): Promise<any> {
  if (client !== null) {
    try {
      const result = await client.gotoDeclaration(data);
      return result;
    } catch (error) {
      console.error('Error going to declaration:', error);
      throw error;
    }
  } else {
    return 'Client is not initialized';
  }
}

export {
  startCoqServer,
  startLeanServer,
  initializeServer,
  initialized,
  shutdown,
  exit,
  didOpen,
  didChange,
  didClose,
  documentSymbol,
  references,
  definition,
  typeDefinition,
  signatureHelp,
  hover,
  gotoDeclaration,
  completion,
};
