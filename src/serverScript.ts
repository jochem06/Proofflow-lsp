/* eslint-disable @typescript-eslint/no-explicit-any */
export { WebSocketLSPServer };

import { WebSocketServer, WebSocket, RawData } from 'ws';
import { LspClient } from './lspClient';
import { JSONRPCEndpoint } from './jsonRpcEndpoint';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

type LSPClientRequest<ResponseType> = {
  type: string;
  data: ResponseType;
};

/**
 * WebSocketLSPServer provides a WebSocket-based Language Server Protocol (LSP) server.
 * It handles connections from clients, forwards LSP requests to the appropriate language server,
 * and sends responses back to the clients.
 */
class WebSocketLSPServer {
  private wss: WebSocketServer;
  private client?: LspClient;
  private endpoint?: JSONRPCEndpoint;

  private lastDiagnostics?: Date;
  private msDiagnosticsBuffer = 1000;
  private publishDiagnosticsTimeout?: NodeJS.Timeout

  /**
   * Constructs a new WebSocketLSPServer listening on the specified port.
   * @param port The port number on which the server will listen for connections.
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

    console.log("Websocket LSP Server ready!")
  }

  /**
   * Sends a response to the editor over WebSocket.
   * @param ws The WebSocket connection to use for sending the response.
   * @param type The type of the response.
   * @param data The data to be sent as part of the response.
   */
  sendResponse<ResponseData>(ws: WebSocket, type: string, data: ResponseData) {
    ws.send(JSON.stringify({ type, data }));
  }

  /**
   * Attaches listeners to the standard output and error streams of a child process.
   * This function is designed to log the output from these streams to the console,
   * providing a way to monitor the output of the child process in real-time.
   * 
   * @param child The child process to attach the output and error stream listeners to.
   *              This process should have been created with the option { stdio: 'pipe' }
   *              to ensure that `stdout` and `stderr` are not null.
   */
  setStdLogs(child: ChildProcessWithoutNullStreams) {
    child.stdout.on('data', (data: Buffer) => {
      console.log(`stdout: ${data}`);
    });
    child.stderr.on('data', (data: Buffer) => {
      console.error(`stderr: ${data.toString()}`);
    });
  }

  /**
   * Starts a Coq language server using the provided executable path.
   * @param path The path to the Coq language server executable.
   */
  startCoqServer(path: string) {
    const child = spawn(path);
    this.setStdLogs(child);

    this.endpoint = new JSONRPCEndpoint(child.stdin, child.stdout);
    this.client = new LspClient(this.endpoint);
  }

  /**
   * Starts a Lean language server using the provided executable path.
   * @param path The path to the Lean language server executable.
   */
  startLeanServer(path: string) {
    const child = spawn(path, ['serve']);
    this.setStdLogs(child);

    this.endpoint = new JSONRPCEndpoint(child.stdin, child.stdout);
    this.client = new LspClient(this.endpoint);
  }

  /**
   * Handles incoming WebSocket messages, parsing them as LSP requests and dispatching
   * them to the appropriate handler based on the request type.
   * Sends the response 
   * @param ws The WebSocket connection from which the message was received.
   * @returns A function that processes the received message.
   */
  handleMessage(ws: WebSocket) {
    return async (raw: RawData) => {
      // The received message
      const message: LSPClientRequest<any> = JSON.parse(raw.toString());
      // Switch case determining what handler to use based on the message type
      switch (message.type as string) {
        case 'startServer': { // Handles the 'startServer' message.
          if (!message.data.path) {
            this.sendResponse(ws, message.type, "Server did not start since no path was sent.")
            return
          }
          // Starts the server based on the server type.
          if (message.data.server === 'coq') {
            this.startCoqServer(message.data.path);
            this.sendResponse(ws, message.type, 'Server Started');
          } else if (message.data.server === 'lean') {
            this.startLeanServer(message.data.path);
            this.sendResponse(ws, message.type, 'Server Started');
          }
          break;
        }
        case 'initialize': { // Handles the 'initialize' message.
          const result = await this.client?.initialize(message.data);
          this.sendResponse(ws, message.type, result);
          break;
        }
        case 'initialized': { // Handles the 'initialized' message.
          this.client?.initialized();
          break;
        }
        case 'shutdown': { // Handles the 'shutdown' message.
          const result = await this.client?.shutdown();
          this.sendResponse(ws, message.type, result);
          break;
        }
        case 'exit': { // Handles the 'exit' message.
          this.client?.exit();
          break;
        }
        case 'didOpen': { // Handles the 'didOpen' message.
          this.client?.didOpen(message.data);
          this.endpoint?.on('textDocument/publishDiagnostics', (params) => {
            const now = new Date()
            if (!this.lastDiagnostics) this.lastDiagnostics = now;
            if (now.getTime() - this.lastDiagnostics.getTime() < this.msDiagnosticsBuffer) {
              clearTimeout(this.publishDiagnosticsTimeout)
            }
            this.publishDiagnosticsTimeout = setTimeout(() => ws.send(JSON.stringify({ type: 'diagnostics', data: params })), 1000)
            this.lastDiagnostics = now
          });
          // listener to check if document has been fully processed for Coq
          this.endpoint?.on('$/logTrace', (params) => {
            // Sends a 'documentChecked' message if the log message contains '[check]: done'.
            if (params.message.includes('[check]: done')) {
              ws.send(JSON.stringify({ type: 'documentChecked', data: params }))
            }
          });
          // listener to check if document has been fully processed for lean
          this.endpoint?.on('$/lean/fileProgress', (params) => {
            const proc = params.processing as Array<any>; // Extracts the processing information.
            // Sends a 'documentChecked' message if there are no items being processed or if the first item's kind is 2.
            if (proc.length === 0 || proc[0].kind as number === 2) {
              ws.send(JSON.stringify({ type: 'documentChecked', data: params }));
            }
          });
          break;
        }
        case 'didChange': { // Handles the 'didChange' message.
          this.client?.didChange(message.data);
          break;
        }
        case 'didClose': { // Handles the 'didClose' message.
          this.client?.didClose(message.data);
          break;
        }
        case 'documentSymbol': { // Handles the 'documentSymbol' message.
          const result = await this.client?.documentSymbol(message.data);
          this.sendResponse(ws, message.type, result);
          break;
        }
        case 'references': { // Handles the 'references' message.
          const result = await this.client?.references(message.data);
          this.sendResponse(ws, message.type, result);
          break;
        }
        case 'definition': { // Handles the 'definition' message.
          const result = await this.client?.definition(message.data);
          this.sendResponse(ws, message.type, result);
          break;
        }
        case 'typeDefinition': { // Handles the 'typeDefinition' message.
          const result = await this.client?.typeDefinition(message.data);
          this.sendResponse(ws, message.type, result);
          break;
        }
        case 'signatureHelp': { // Handles the 'signatureHelp' message.
          const result = await this.client?.signatureHelp(message.data);
          this.sendResponse(ws, message.type, result);
          break;
        }
        case 'hover': { // Handles the 'hover' message.
          const result = await this.client?.hover(message.data);
          this.sendResponse(ws, message.type, result);
          break;
        }
        case 'declaration': { // Handles the 'declaration' message.
          const result = await this.client?.gotoDeclaration(message.data);
          this.sendResponse(ws, message.type, result);
          break;
        }
        case 'completion': { // Handles the 'completion' message.
          const result = await this.client?.completion(message.data);
          this.sendResponse(ws, message.type, result);
          break;
        }
        default: { // Handles unsupported message types.
          this.sendResponse(ws, message.type, 'type not supported');
          break;
        }
      }
    };
  }
}

// Start the WebSocketLSPServer on port 8080.
new WebSocketLSPServer(8080)