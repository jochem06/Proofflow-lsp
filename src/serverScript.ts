/* eslint-disable @typescript-eslint/no-explicit-any */
export { WebSocketLSPServer };

import { WebSocketServer, WebSocket, RawData } from 'ws';
import { LspClient } from './lspClient';
import { JSONRPCEndpoint } from './jsonRpcEndpoint';
import { spawn } from 'child_process';

type LSPClientRequest<ResponseType> = {
  type: string;
  data: ResponseType;
};

/**
 * Class representing a WebSocket Language Server Protocol (LSP) Server.
 * This server listens for WebSocket connections and processes LSP requests.
 */
class WebSocketLSPServer {
  private wss: WebSocketServer; // The WebSocket server instance that listens for client connections.
  private client?: LspClient; // The LSP client instance to interact with the language server.
  private endpoint?: JSONRPCEndpoint; // The JSON-RPC endpoint instance for communication with the language server.

  private lastDiagnostics?: Date; // Timestamp of the last diagnostics received.
  private msDiagnosticsBuffer = 1000; // Buffer time in milliseconds for diagnostics to prevent flooding.
  private publishDiagnosticsTimeout?: NodeJS.Timeout; // Timeout handle for publishing diagnostics after the buffer period.

  /**
   * Constructs a new WebSocketLSPServer.
   * @param port - The port number on which the WebSocket server will listen.
   */
  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.wss.on('connection', (ws) => {
      console.log('Client connected');
      ws.on('message', this.handleMessage(ws));
      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });

    console.log("Websocket LSP Server ready!");
  }

  /**
   * Sends a response to the WebSocket client.
   * @param ws - The WebSocket connection to the client.
   * @param type - The type of the response message.
   * @param data - The data to be sent in the response.
   */
  sendResponse<ResponseData>(ws: WebSocket, type: string, data: ResponseData) {
    ws.send(JSON.stringify({ type, data }));
  }

  /**
   * Starts the Coq language server using the specified path.
   * @param path - The file path to the Coq language server executable.
   */
  startCoqServer(path: string) {
    const child = spawn(path);
    child.stdout.on('data', (data: Buffer) => {
      console.log(`stdout: ${data}`);
    });
    child.stderr.on('data', (data: Buffer) => {
      console.error(`stderr: ${data.toString()}`);
    });

    this.endpoint = new JSONRPCEndpoint(child.stdin, child.stdout);
    this.client = new LspClient(this.endpoint);
  }

  /**
   * Starts the Lean language server using the specified path.
   * @param path - The file path to the Lean language server executable.
   */
  startLeanServer(path: string) {
    const child = spawn(path, ['serve']);
    child.stdout.on('data', (data: Buffer) => {
      console.log(`stdout: ${data}`);
    });
    child.stderr.on('data', (data: Buffer) => {
      console.error(`stderr: ${data.toString()}`);
    });

    this.endpoint = new JSONRPCEndpoint(child.stdin, child.stdout);
    this.client = new LspClient(this.endpoint);
  }

  /**
   * Handles incoming WebSocket messages and dispatches them to the appropriate handler.
   * @param ws - The WebSocket connection to the client.
   * @returns A function that processes raw WebSocket messages.
   */
  handleMessage(ws: WebSocket) {
    // Returns an asynchronous function that processes raw data received.
    return async (raw: RawData) => {
      // Parses the raw data into a JSON object as a LSPClientRequest.
      const message: LSPClientRequest<any> = JSON.parse(raw.toString());

      console.log('Got message', message);

      // Call the corresponding method based on message.type
      switch (message.type) {
        case 'startServer':
          await this.handleStartServer(ws, message);
          break;
        case 'initialize':
          await this.handleInitialize(ws, message);
          break;
        case 'initialized':
          await this.handleInitialized();
          break;
        case 'shutdown':
          await this.handleShutdown(ws, message);
          break;
        case 'exit':
          await this.handleExit();
          break;
        case 'didOpen':
          await this.handleDidOpen(ws, message);
          break;
        case 'didChange':
          await this.handleDidChange(message);
          break;
        case 'didClose':
          await this.handleDidClose(message);
          break;
        case 'documentSymbol':
          await this.handleDocumentSymbol(ws, message);
          break;
        case 'references':
          await this.handleReferences(ws, message);
          break;
        case 'definition':
          await this.handleDefinition(ws, message);
          break;
        case 'typeDefinition':
          await this.handleTypeDefinition(ws, message);
          break;
        case 'signatureHelp':
          await this.handleSignatureHelp(ws, message);
          break;
        case 'hover':
          await this.handleHover(ws, message);
          break;
        case 'declaration':
          await this.handleDeclaration(ws, message);
          break;
        case 'completion':
          await this.handleCompletion(ws, message);
          break;
        default:
          // If no handler is found for the message type, send a 'type not supported' response.
          this.sendResponse(ws, message.type, 'type not supported');
      }
    };
    
  }

  /**
   * Handles the 'startServer' message from the client to start a specific language server.
   * @param ws - The WebSocket connection to the client.
   * @param message - The message containing the server type and path to the executable.
   */
  async handleStartServer(ws: WebSocket, message: LSPClientRequest<any>) {
    if (!message.data.path) {
      this.sendResponse(ws, message.type, "Server did not start since no path was sent.");
      return;
    }
    if (message.data.server === 'coq') {
      this.startCoqServer(message.data.path);
    } else if (message.data.server === 'lean') {
      this.startLeanServer(message.data.path);
    }
    this.sendResponse(ws, message.type, 'Server Started');
  }

/**
   * Handles the 'initialize' message from the client to initialize the LSP client.
   * @param ws - The WebSocket connection to the client.
   * @param message - The message containing initialization parameters.
   */
async handleInitialize(ws: WebSocket, message: LSPClientRequest<any>) {
  const result = await this.client?.initialize(message.data);
  this.sendResponse(ws, message.type, result);
}

/**
 * Handles the 'initialized' message from the client indicating the LSP client has initialized.
 */
handleInitialized() {
  this.client?.initialized();
}

/**
 * Handles the 'shutdown' message from the client to shutdown the LSP client.
 * @param ws - The WebSocket connection to the client.
 * @param message - The message indicating a shutdown request.
 */
async handleShutdown(ws: WebSocket, message: LSPClientRequest<any>) {
  const result = await this.client?.shutdown();
  this.sendResponse(ws, message.type, result);
}

/**
 * Handles the 'exit' message from the client to exit the LSP client.
 */
handleExit() {
  this.client?.exit();
}

/**
 * Handles the 'didOpen' message from the client when a text document is opened.
 * @param ws - The WebSocket connection to the client.
 * @param message - The message containing the document details.
 */
handleDidOpen(ws: WebSocket, message: LSPClientRequest<any>) {
  // Notifies the client that a document has been opened.
  this.client?.didOpen(message.data);

  // Listens for 'textDocument/publishDiagnostics' events from the endpoint.
  this.endpoint?.on('textDocument/publishDiagnostics', (params) => {
    const now = new Date();
    // Initializes lastDiagnostics with the current time if it's not already set.
    if (!this.lastDiagnostics) this.lastDiagnostics = now;
    // Resets the timeout for publishing diagnostics if the current event is too close to the last one.
    if (now.getTime() - this.lastDiagnostics.getTime() < this.msDiagnosticsBuffer) {
      clearTimeout(this.publishDiagnosticsTimeout);
    }
    // Sets a timeout to send diagnostics data to the client, allowing for a buffer period.
    this.publishDiagnosticsTimeout = setTimeout(() => ws.send(JSON.stringify({ type: 'diagnostics', data: params })), 1000);
    this.lastDiagnostics = now; // Updates the last diagnostics timestamp.
  });

  // Listens for log trace events, specifically looking for a 'document checked' message.
  this.endpoint?.on('$/logTrace', (params) => {
    if (params.message.includes('[check]: done')) {
      // Sends a 'documentChecked' message to the client when the check is complete.
      ws.send(JSON.stringify({ type: 'documentChecked', data: params }));
    }
  });

  // Listens for file progress events to determine the document check status.
  this.endpoint?.on('$/lean/fileProgress', (params) => {
    const proc = params.processing as Array<any>; // Extracts the processing information.
    
    // Sends a 'documentChecked' message if there are no items being processed or if the first item's kind is 2.
    if (proc.length === 0 || proc[0].kind as number === 2) {
      ws.send(JSON.stringify({ type: 'documentChecked', data: params }));
    }
  });
}

/**
 * Handles the 'didChange' message from the client when a text document is changed.
 * @param message - The message containing the document changes.
 */
handleDidChange(message: LSPClientRequest<any>) {
  this.client?.didChange(message.data);
}

/**
 * Handles the 'didClose' message from the client when a text document is closed.
 * @param message - The message containing the document details.
 */
handleDidClose(message: LSPClientRequest<any>) {
  this.client?.didClose(message.data);
}

/**
 * Handles the 'documentSymbol' message from the client to get document symbols.
 * @param ws - The WebSocket connection to the client.
 * @param message - The message containing the document details.
 */
async handleDocumentSymbol(ws: WebSocket, message: LSPClientRequest<any>) {
  const result = await this.client?.documentSymbol(message.data);
  this.sendResponse(ws, message.type, result);
}

/**
 * Handles the 'references' message from the client to get references.
 * @param ws - The WebSocket connection to the client.
 * @param message - The message containing the reference parameters.
 */
  async handleReferences(ws: WebSocket, message: LSPClientRequest<any>) {
    const result = await this.client?.references(message.data);
    this.sendResponse(ws, message.type, result);
  }

  /**
   * Handles the 'definition' message from the client to get the definition of a symbol.
   * @param ws - The WebSocket connection to the client.
   * @param message - The message containing the definition parameters.
   */
  async handleDefinition(ws: WebSocket, message: LSPClientRequest<any>) {
    const result = await this.client?.definition(message.data);
    this.sendResponse(ws, message.type, result);
  }

  /**
   * Handles the 'typeDefinition' message from the client to get the type definition of a symbol.
   * @param ws 
   * @param message 
   */
  async handleTypeDefinition(ws: WebSocket, message: LSPClientRequest<any>) {
    const result = await this.client?.typeDefinition(message.data);
    this.sendResponse(ws, message.type, result);
  }

  /**
   * Handles the 'signatureHelp' message from the client to get signature help for a symbol.
   * @param ws - The WebSocket connection to the client.
   * @param message - The message containing the signature help parameters.
   */
  async handleSignatureHelp(ws: WebSocket, message: LSPClientRequest<any>) {
    const result = await this.client?.signatureHelp(message.data);
    this.sendResponse(ws, message.type, result);
  }

  /**
   * Handles the 'hover' message from the client to get hover information for a symbol.
   * @param ws - The WebSocket connection to the client.
   * @param message - The message containing the hover parameters.
   */
  async handleHover(ws: WebSocket, message: LSPClientRequest<any>) {
    const result = await this.client?.hover(message.data);
    this.sendResponse(ws, message.type, result);
  }

  /**
   * Handles the 'declaration' message from the client to get the declaration of a symbol.
   * @param ws - The WebSocket connection to the client.
   * @param message - The message containing the declaration parameters.
   */
  async handleDeclaration(ws: WebSocket, message: LSPClientRequest<any>) {
    const result = await this.client?.gotoDeclaration(message.data);
    this.sendResponse(ws, message.type, result);
  }

  /**
   * Handles the 'completion' message from the client to get completion suggestions.
   * @param ws - The WebSocket connection to the client.
   * @param message - The message containing the completion parameters.
   */
  async handleCompletion(ws: WebSocket, message: LSPClientRequest<any>) {
    const result = await this.client?.completion(message.data);
    this.sendResponse(ws, message.type, result);
  }
}

new WebSocketLSPServer(8080);
