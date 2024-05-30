import express from 'express';
import { startCoqServer, startLeanServer, initializeServer, initialized, shutdown, exit, didOpen, didClose, documentSymbol, references, definition, typeDefinition, signatureHelp, hover, gotoDeclaration, once } from './serverScriptFunctions';

//const rootPath = path.resolve(path.join(__dirname, 'mock'));
const app = express();

app.get('/start_server', (req, res) => {
  if (req.query.server === 'coq') {
    startCoqServer();
    res.send('Server started');
  } else if (req.query.server === 'lean') {
    startLeanServer();
    res.send('Server started');
  }
});

// Define an endpoint to initialize the server
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

app.get('/didClose', (req, res) => {
  didClose(req.query.uri as string);
  res.send('Document closed');
});

app.get('/documentSymbol', (req, res) => {
  const result = documentSymbol(req.query.uri as string);
  res.send(result);
});

app.get('/references', (req, res) => {
  const result = references(req.query.uri as string, req.query.line as string, req.query.character as string);
  res.send(result);
});

app.get('/definition', (req, res) => {
  const result = definition(req.query.uri as string, req.query.line as string, req.query.character as string);
  res.send(result);
});

app.get('/typeDefinition', (req, res) => {
  const result = typeDefinition(req.query.uri as string, req.query.line as string, req.query.character as string);
  res.send(result);
});

app.get('/signatureHelp', (req, res) => {
  const result = signatureHelp(req.query.uri as string, req.query.line as string, req.query.character as string);
  res.send(result);
});

app.get('/once', (req, res) => {
    const result = once(req.query.method as string);
    res.send(result);
});

app.get('/hover', (req, res) => {
  const result = hover(req.query.uri as string, req.query.line as string, req.query.character as string);
  res.send(result);
});

app.get('/declaration', (req, res) => {
  const result = gotoDeclaration(req.query.uri as string, req.query.line as string, req.query.character as string);
  res.send(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});