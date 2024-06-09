import * as lspClient from '../src/main';
import { JSONRPCEndpoint, LspClient } from '../src/main';
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { pathToFileURL } from "url";

let client: LspClient | null = null;
let endpoint: JSONRPCEndpoint | null = null;
let broadcast: ((data: any) => void) | null = null;

function setBroadcastFunction(broadcastFn: (data: any) => void) {
  broadcast = broadcastFn;
}

function startCoqServer(): string {
  const process: ChildProcessWithoutNullStreams = spawn(
    'C:\\cygwin_wp\\home\\runneradmin\\.opam\\wp\\bin\\coq-lsp.exe',
    {
      shell: true,
      stdio: 'pipe'
    }
  );
  let serverStatus = 'Server not started'

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

  endpoint = new lspClient.JSONRPCEndpoint(
    process.stdin,
    process.stdout,
  );

  client = new LspClient(endpoint);
  return serverStatus;
}

function startLeanServer(): string {
  const process: ChildProcessWithoutNullStreams = spawn(
    'C:\\Users\\20212170\\.elan\\toolchains\\leanprover--lean4---stable\\bin\\lean.exe',
    ['--server'],
    {
      shell: true,
      stdio: 'pipe'
    }
  );

  let serverStatus = 'Server not started'

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

  endpoint = new lspClient.JSONRPCEndpoint(
    process.stdin,
    process.stdout,
  );

  client = new LspClient(endpoint);
  return serverStatus;
}

async function initializeServer(filePath: string) {
  if (client !== null) {
    console.log('process.pid:', process.pid);
    try {
      const result = await client.initialize({
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

function didOpen(uri: string, languageId: string, text: string, version: string) {
  if (client !== null) {
    client.didOpen({
      textDocument: {
        uri: uri,
        languageId: languageId,
        version: parseInt(version),
        text: text
      }
    });
    endpoint.on('textDocument/publishDiagnostics', (params) => {
      console.log('Diagnostics received:', params);
      if (broadcast) {
        broadcast({ type: 'diagnostics', data: params });
      }
    });
  }
}

function didChange(uri: string, el: number, ec: number, text: string, rangeLength: number) {
  if (client !== null) {
    client.didChange({
      textDocument: {
        uri: uri,
      },
      contentChanges: [
        {
          range: {
            start: { line: 0, character: 0 },
            end: { line: el, character: ec }
          },
          rangeLength: rangeLength,
          text: text
        }
      ]
    });
  }
}

function didClose(uri: string) {
  if (client !== null) {
    client.didClose({
      textDocument: {
        uri: uri
      }
    });
  }
}

async function documentSymbol(uri: string): Promise<any> {
  if (client !== null) {
    try {
      const result = await client.documentSymbol({
        textDocument: {
          uri: uri
        }
      });
      return result;
    } catch (error) {
      console.error('Error getting document symbols:', error);
      throw error;
    }
  } else {
    return 'Client is not initialized';
  }
}

async function references(uri: string, line: string, character: string): Promise<any> {
  if (client !== null) {
    try {
      const result = await client.references({
        context: {
          includeDeclaration: true
        },
        textDocument: {
          uri: uri
        },
        position: {
          line: parseInt(line),
          character: parseInt(character)
        }
      });
      return result;
    } catch (error) {
      console.error('Error getting references:', error);
      throw error;
    }
  } else {
    return 'Client is not initialized';
  }
}

async function definition(uri: string, line: string, character: string): Promise<any> {
  if (client !== null) {
    try {
      const result = await client.definition({
        textDocument: {
          uri: uri
        },
        position: {
          line: parseInt(line),
          character: parseInt(character)
        }
      });
      return result;
    } catch (error) {
      console.error('Error getting definition:', error);
      throw error;
    }
  } else {
    return 'Client is not initialized';
  }
}

async function typeDefinition(uri: string, line: string, character: string): Promise<any> {
  if (client !== null) {
    try {
      const result = await client.typeDefinition({
        textDocument: {
          uri: uri
        },
        position: {
          line: parseInt(line),
          character: parseInt(character)
        }
      });
      return result;
    } catch (error) {
      console.error('Error getting type definition:', error);
      throw error;
    }
  } else {
    return 'Client is not initialized';
  }
}

async function signatureHelp(uri: string, line: string, character: string): Promise<any> {
  if (client !== null) {
    try {
      const result = await client.signatureHelp({
        textDocument: {
          uri: uri
        },
        position: {
          line: parseInt(line),
          character: parseInt(character)
        },
        context: {
          triggerKind: lspClient.SignatureHelpTriggerKind.Invoked,
          isRetrigger: false
        }
      });
      return result;
    } catch (error) {
      console.error('Error getting signature help:', error);
      throw error;
    }
  } else {
    return 'Client is not initialized';
  }
}

async function hover(uri: string, line: string, character: string): Promise<any> {
  if (client !== null) {
    try {
      const result = await client.hover({
        textDocument: {
          uri: uri
        },
        position: {
          line: parseInt(line),
          character: parseInt(character)
        }
      });
      return result;
    } catch (error) {
      console.error('Error getting hover:', error);
      throw error;
    }
  } else {
    return 'Client is not initialized';
  }
}

async function gotoDeclaration(uri: string, line: string, character: string): Promise<any> {
  if (client !== null) {
    try {
      const result = await client.gotoDeclaration({
        textDocument: {
          uri: uri
        },
        position: {
          line: parseInt(line),
          character: parseInt(character)
        }
      });
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
  setBroadcastFunction
};
