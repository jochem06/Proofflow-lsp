import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors'; // Import cors
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
  setBroadcastFunction
} from './serverScriptFunctions';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173' // Replace with the origin you want to allow
}));
app.use(express.json());

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// WebSocket server setup
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Received message:', message);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Broadcast function to send messages to all connected clients
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Set the broadcast function in serverScriptFunctions
setBroadcastFunction(broadcast);

app.get('/start_server', (req, res) => {
  if (req.query.server === 'coq') {
    startCoqServer();
    res.send('Server started');
  } else if (req.query.server === 'lean') {
    startLeanServer();
    res.send('Server started');
  }
});

app.get('/initialize_server', (req, res) => {
  const result = initializeServer(req.query.filePath as string);
  res.send(result);
});

app.get('/initialized', (_, res) => {
  initialized();
  res.send('Initialized');
});

app.get('/shutdown', (_, res) => {
  shutdown();
  res.send('Client has been shut down');
});

app.get('/exit', (_, res) => {
  exit();
  res.send('Client exited');
});

app.get('/didOpen', (req, res) => {
  didOpen(req.query.uri as string, req.query.languageId as string, req.query.text as string, req.query.version as string);
  res.send('Document opened');
});

app.get('/didChange', (req, res) => {
  didChange(req.query.uri as string, req.query.text as string, req.query.version as string);  
  res.send('Document changed');
});

app.get('/didClose', (req, res) => {
  didClose(req.query.uri as string);
  res.send('Document closed');
});

app.get('/documentSymbol', async (req, res) => {
  const result = await documentSymbol(req.query.uri as string);
  res.send(result);
});

app.get('/references', async (req, res) => {
  const result = await references(req.query.uri as string, req.query.line as string, req.query.character as string);
  res.send(result);
});

app.get('/definition', async (req, res) => {
  const result = await definition(req.query.uri as string, req.query.line as string, req.query.character as string);
  res.send(result);
});

app.get('/typeDefinition', async (req, res) => {
  const result = await typeDefinition(req.query.uri as string, req.query.line as string, req.query.character as string);
  res.send(result);
});

app.get('/signatureHelp', async (req, res) => {
  const result = await signatureHelp(req.query.uri as string, req.query.line as string, req.query.character as string);
  res.send(result);
});

// app.get('/once', async (req, res) => {
//   const result = await once(req.query.method as string);
//   res.send(result);
// });

app.get('/hover', async (req, res) => {
  const result = await hover(req.query.uri as string, req.query.line as string, req.query.character as string);
  res.send(result);
});

app.get('/declaration', async (req, res) => {
  const result = await gotoDeclaration(req.query.uri as string, req.query.line as string, req.query.character as string);
  res.send(result);
});
