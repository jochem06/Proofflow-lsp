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

class WebSocketLSPServer {
  private wss: WebSocketServer;
  private client?: LspClient;
  private endpoint?: JSONRPCEndpoint;

  private lastDiagnostics?: Date;
  private msDiagnosticsBuffer = 1000;
  private publishDiagnosticsTimeout?: NodeJS.Timeout

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

  sendResponse<ResponseData>(ws: WebSocket, type: string, data: ResponseData) {
    ws.send(JSON.stringify({ type, data }));
  }

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

  handleMessage(ws: WebSocket) {
    return async (raw: RawData) => {
      const message: LSPClientRequest<any> = JSON.parse(raw.toString());
      console.log('Got message', message);
      switch (message.type as string) {
        case 'startServer': {
          if (!message.data.path) {
            this.sendResponse(ws, message.type, "Server did not start since no path was sent.")
            return
          }
          if (message.data.server === 'coq') {
            this.startCoqServer(message.data.path);
            this.sendResponse(ws, message.type, 'Server Started');
          } else if (message.data.server === 'lean') {
            this.startLeanServer(message.data.path);
            this.sendResponse(ws, message.type, 'Server Started');
          }
          break;
        }
        case 'initialize': {
          const result = await this.client?.initialize(message.data);
          this.sendResponse(ws, message.type, result);
          break;
        }
        case 'initialized': {
          this.client?.initialized();
          break;
        }
        case 'shutdown': {
          const result = await this.client?.shutdown();
          this.sendResponse(ws, message.type, result);
          break;
        }
        case 'exit': {
          this.client?.exit();
          break;
        }
        case 'didOpen': {
          this.client?.didOpen(message.data);
          this.endpoint?.on('textDocument/publishDiagnostics', (params) => {
            const now = new Date()
            if (!this.lastDiagnostics) this.lastDiagnostics = now;
            if (now.getTime() - this.lastDiagnostics.getTime() < this.msDiagnosticsBuffer) {
              clearTimeout(this.publishDiagnosticsTimeout)
            }
            this.publishDiagnosticsTimeout = setTimeout(()=> ws.send(JSON.stringify({ type: 'diagnostics', data: params })), 1000)
            this.lastDiagnostics = now
          });
          // listener to check if document has been fully processed for Coq
          this.endpoint?.on('$/logTrace', (params) => {
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
        case 'didChange': {
          this.client?.didChange(message.data);
          break;
        }
        case 'didClose': {
          this.client?.didClose(message.data);
          break;
        }
        case 'documentSymbol': {
          const result = await this.client?.documentSymbol(message.data);
          this.sendResponse(ws, message.type, result);
          break;
        }
        case 'references': {
          const result = await this.client?.references(message.data);
          this.sendResponse(ws, message.type, result);
          break;
        }
        case 'definition': {
          const result = await this.client?.definition(message.data);
          this.sendResponse(ws, message.type, result);
          break;
        }
        case 'typeDefinition': {
          const result = await this.client?.typeDefinition(message.data);
          this.sendResponse(ws, message.type, result);
          break;
        }
        case 'signatureHelp': {
          const result = await this.client?.signatureHelp(message.data);
          this.sendResponse(ws, message.type, result);
          break;
        }
        case 'hover': {
          const result = await this.client?.hover(message.data);
          this.sendResponse(ws, message.type, result);
          break;
        }
        case 'declaration': {
          const result = await this.client?.gotoDeclaration(message.data);
          this.sendResponse(ws, message.type, result);
          break;
        }
        case 'completion': {
          const result = await this.client?.completion(message.data);
          this.sendResponse(ws, message.type, result);
          break;
        }
        default: {
          this.sendResponse(ws, message.type, 'type not supported');
          break;
        }
      }
    };
  }
}

new WebSocketLSPServer(8080)