// import bodyParser from 'body-parser';
import { WebSocketServer, WebSocket } from 'ws';
import {
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
} from './serverScriptFunctions';

// WebSocket server setup
const wss = new WebSocketServer({ port: 8080 });

function sendResponse<ResponseData>(ws: WebSocket, type: string, data: ResponseData) {
  ws.send(JSON.stringify({ type, data }));
}

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (event) => {
    const message = JSON.parse(event.toString());
    const data = message.data;
    console.log("Got message", message)
    switch (message.type as string) {
      case "startServer": {
        if (data.server === 'coq') {
          const result = await startCoqServer();
          sendResponse(ws, message.type, result)
        } else if (data.server === 'lean') {
          const result = startLeanServer();
          sendResponse(ws, message.type, result);
        }
        break;
      }
      case "initialize": {
        const initResult = initializeServer(data);
        sendResponse(ws, message.type, initResult);
        break;
      }
      case "initialized": {
        initialized();
        break;
      }
      case "shutdown": {
        shutdown();
        break;
      }
      case "exit": {
        exit();
        break;
      }
      case "didOpen": {
        didOpen(data, ws);
        break;
      }
      case "didChange": {
        didChange(data);
        break;
      }
      case "didClose": {
        didClose(data);
        break;
      }
      case "documentSymbol": {
        documentSymbol(data);
        break;
      }
      case "references": {
        const refResult = references(data);
        sendResponse(ws, message.type, refResult);
        break;
      }
      case "definition": {
        const defResult = definition(data);
        sendResponse(ws, message.type, defResult);
        break;
      }
      case "typeDefinition": {
        const typeDefResult = typeDefinition(data);
        sendResponse(ws, message.type, typeDefResult);
        break;
      }
      case "signatureHelp": {
        const sigResult = signatureHelp(data);
        sendResponse(ws, message.type, sigResult);
        break;
      }
      case "hover": {
        const hoverResult = hover(data);
        sendResponse(ws, message.type, hoverResult);
        break;
      }
      case "declaration": {
        const gotoDecResult = gotoDeclaration(data);
        sendResponse(ws, message.type, gotoDecResult);
        break;
      }
      case "completion": {
        const compResult = completion(data);
        sendResponse(ws, message.type, compResult);
        break;
      }    
      default: {
        break;
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});


