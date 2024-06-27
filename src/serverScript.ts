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
    const handlers: { [key: string]: (message: LSPClientRequest<any>) => Promise<void> | void } = {
      'startServer': this.handleStartServer.bind(this, ws),
      'initialize': this.handleInitialize.bind(this, ws),
      'initialized': this.handleInitialized.bind(this, ws),
      'shutdown': this.handleShutdown.bind(this, ws),
      'exit': this.handleExit.bind(this, ws),
      'didOpen': this.handleDidOpen.bind(this, ws),
      'didChange': this.handleDidChange.bind(this, ws),
      'didClose': this.handleDidClose.bind(this, ws),
      'documentSymbol': this.handleDocumentSymbol.bind(this, ws),
      'references': this.handleReferences.bind(this, ws),
      'definition': this.handleDefinition.bind(this, ws),
      'typeDefinition': this.handleTypeDefinition.bind(this, ws),
      'signatureHelp': this.handleSignatureHelp.bind(this, ws),
      'hover': this.handleHover.bind(this, ws),
      'declaration': this.handleDeclaration.bind(this, ws),
      'completion': this.handleCompletion.bind(this, ws),
    };

    return async (raw: RawData) => {
      const message: LSPClientRequest<any> = JSON.parse(raw.toString());
      console.log('Got message', message);

      const handler = handlers[message.type];
      if (handler) {
        await handler(message);
      } else {
        this.sendResponse(ws, message.type, 'type not supported');
      }
    };
  }

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

  async handleInitialize(ws: WebSocket, message: LSPClientRequest<any>) {
    const result = await this.client?.initialize(message.data);
    this.sendResponse(ws, message.type, result);
  }

  handleInitialized() {
    this.client?.initialized();
  }

  async handleShutdown(ws: WebSocket, message: LSPClientRequest<any>) {
    const result = await this.client?.shutdown();
    this.sendResponse(ws, message.type, result);
  }

  handleExit() {
    this.client?.exit();
  }

  handleDidOpen(ws: WebSocket, message: LSPClientRequest<any>) {
    this.client?.didOpen(message.data);
    this.endpoint?.on('textDocument/publishDiagnostics', (params) => {
      const now = new Date();
      if (!this.lastDiagnostics) this.lastDiagnostics = now;
      if (now.getTime() - this.lastDiagnostics.getTime() < this.msDiagnosticsBuffer) {
        clearTimeout(this.publishDiagnosticsTimeout);
      }
      this.publishDiagnosticsTimeout = setTimeout(() => ws.send(JSON.stringify({ type: 'diagnostics', data: params })), 1000);
      this.lastDiagnostics = now;
    });
    this.endpoint?.on('$/logTrace', (params) => {
      if (params.message.includes('[check]: done')) {
        ws.send(JSON.stringify({ type: 'documentChecked', data: params }));
      }
    });
    this.endpoint?.on('$/lean/fileProgress', (params) => {
      const proc = params.processing as Array<any>;
      
      if (proc.length === 0) {
        ws.send(JSON.stringify({ type: 'documentChecked', data: params }));
      } else if (proc[0].kind as number === 2) {
        ws.send(JSON.stringify({ type: 'documentChecked', data: params }));
      }
      
    });
  }

  handleDidChange(message: LSPClientRequest<any>) {
    this.client?.didChange(message.data);
  }

  handleDidClose(message: LSPClientRequest<any>) {
    this.client?.didClose(message.data);
  }

  async handleDocumentSymbol(ws: WebSocket, message: LSPClientRequest<any>) {
    const result = await this.client?.documentSymbol(message.data);
    this.sendResponse(ws, message.type, result);
  }

  async handleReferences(ws: WebSocket, message: LSPClientRequest<any>) {
    const result = await this.client?.references(message.data);
    this.sendResponse(ws, message.type, result);
  }

  async handleDefinition(ws: WebSocket, message: LSPClientRequest<any>) {
    const result = await this.client?.definition(message.data);
    this.sendResponse(ws, message.type, result);
  }

  async handleTypeDefinition(ws: WebSocket, message: LSPClientRequest<any>) {
    const result = await this.client?.typeDefinition(message.data);
    this.sendResponse(ws, message.type, result);
  }

  async handleSignatureHelp(ws: WebSocket, message: LSPClientRequest<any>) {
    const result = await this.client?.signatureHelp(message.data);
    this.sendResponse(ws, message.type, result);
  }

  async handleHover(ws: WebSocket, message: LSPClientRequest<any>) {
    const result = await this.client?.hover(message.data);
    this.sendResponse(ws, message.type, result);
  }

  async handleDeclaration(ws: WebSocket, message: LSPClientRequest<any>) {
    const result = await this.client?.gotoDeclaration(message.data);
    this.sendResponse(ws, message.type, result);
  }

  async handleCompletion(ws: WebSocket, message: LSPClientRequest<any>) {
    const result = await this.client?.completion(message.data);
    this.sendResponse(ws, message.type, result);
  }
}

new WebSocketLSPServer(8080);
