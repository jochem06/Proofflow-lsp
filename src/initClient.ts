import WebSocket from 'ws';
import { Readable, Writable } from 'stream';
import * as lspClient from './main';
import { LspClient } from './lspClient';
import { pathToFileURL } from 'url';

class WebSocketReadable extends Readable {
  private webSocket: WebSocket;

  constructor(webSocket: WebSocket) {
    super();
    this.webSocket = webSocket;

    this.webSocket.onmessage = (event) => {
      // Directly push the event data without parsing
      console.log('Received message:', event.data.toString());
      this.push(event.data.toString());
    };

    this.webSocket.onclose = () => {
      this.push(null);
    };
  }

  _read(_) {
    // No implementation needed, data is pushed from WebSocket event
  }
}

class WebSocketWritable extends Writable {
  private webSocket: WebSocket;

  constructor(webSocket: WebSocket) {
    super();
    this.webSocket = webSocket;
  }

  _write(chunk: any, _, callback: (error?: Error | null) => void) {
    this.webSocket.send(chunk);
    callback();
  }
}

const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  const readableStream = new WebSocketReadable(ws);
  const writableStream = new WebSocketWritable(ws);

  const endpoint = new lspClient.JSONRPCEndpoint(
    writableStream,
    readableStream,
  );

  const client = new LspClient(endpoint);
  ws.send('start-coq-lsp');
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
        uri: pathToFileURL("C:\\Users\\20212170\\OneDrive - TU Eindhoven\\Documents\\SEP\\Proofflow-lsp\\src\\mock\\mock.v").href
      }
    ],
    rootUri: null
  });

  // Now you can use lspClient to communicate with the language server
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket connection closed');
};
