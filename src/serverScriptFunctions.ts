import * as lspClient from '../src/main';
import { JSONRPCEndpoint, LspClient } from '../src/main';
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
//import * as path from 'path';
import { pathToFileURL } from "url";
import axios from 'axios';

let client: LspClient | null = null;
let endpoint: JSONRPCEndpoint | null = null;

function startCoqServer() {
    const process: ChildProcessWithoutNullStreams = spawn(
        'C:\\Coq-Platform~8.19-lsp\\bin\\coq-lsp.exe',
        {
            shell: true,
            stdio: 'pipe'
        }
    );

    // Listen for data on the stdout stream
    process.stdout.on('data', (data: Buffer) => {
        console.log(`stdout: ${data.toString()}`);

        // Check if the data contains a message indicating the server has started
        if (data.toString().includes('Server started')) {
            console.log('Language server has started successfully.');
        }
    });

    // Listen for data on the stderr stream
    process.stderr.on('data', (data: Buffer) => {
        console.error(`stderr: ${data.toString()}`);
    });

    // create an RPC endpoint for the process
    endpoint = new lspClient.JSONRPCEndpoint(
        process.stdin,
        process.stdout,
    );

    // create the LSP client
    client = new LspClient(endpoint);
}

async function startLeanServer() {
    const process: ChildProcessWithoutNullStreams = spawn(
        'C:\\Users\\smile\\.elan\\toolchains\\leanprover--lean4---stable\\bin\\lean.exe',
        ['--server'],
        {
            shell: true,
            stdio: 'pipe'
        }
    );

    // Listen for data on the stdout stream
    process.stdout.on('data', (data: Buffer) => {
        console.log(`stdout: ${data.toString()}`);

        // Check if the data contains a message indicating the server has started
        if (data.toString().includes('Server started')) {
            console.log('Language server has started successfully.');
        }
    });

    // Listen for data on the stderr stream
    process.stderr.on('data', (data: Buffer) => {
        console.error(`stderr: ${data.toString()}`);
    });

    // create an RPC endpoint for the process
    endpoint = new lspClient.JSONRPCEndpoint(
        process.stdin,
        process.stdout,
    );

    // create the LSP client
    client = new LspClient(endpoint);
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
            // Handle any initialization error if necessary
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
        client.shutdown();
    }
}

function exit() {
    if (client !== null) {
        client.exit();
    }
}

function didOpen(uri: string, languageId: string, text: string, version: string) {
    if (client !== null) {
        client.didOpen({
            textDocument: { //TODO: figure out how exactly the parameters work and implement
                uri: uri as string,
                languageId: languageId as string,
                version: parseInt(version as string), //TODO: figure out how to get the version
                text: text as string
            }
        });
        endpoint.on('textDocument/publishDiagnostics', (params) => {
            console.log('Diagnostics received:', params);
            //console.log('Diagnostics message:', params.diagnostics[0].message);
            try {
                axios.post('http://localhost:3001/publishDiagnostics', params, {
                    headers: {
                        'Content-Type': 'application/json'
                }
                });
            } catch (error) {
                console.error('Error sending diagnostics:\n', error);
            }
        });
    }
}

function didClose(uri: string) {
    if (client !== null) {
        client.didClose({
            textDocument: {
                uri: uri as string
            }
        });
    }
}

function documentSymbol(uri: string) {
    if (client !== null) {
        client.documentSymbol({
            textDocument: {
                uri: uri as string
            }
        }).then((result) => {
            return result;
        });
    }
}

function references(uri: string, line: string, character: string) {
    if (client !== null) {
        client.references({
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
        }).then((result) => {
            return result;
        });
    }
}

function definition(uri: string, line: string, character: string) {
    if (client !== null) {
        client.definition({
            textDocument: {
                uri: uri
            },
            position: {
                line: parseInt(line),
                character: parseInt(character)
            }
        }).then((result) => {
            return result;
        });
    }
}

function typeDefinition(uri: string, line: string, character: string) {
    if (client !== null) {
        client.typeDefinition({
            textDocument: {
                uri: uri
            },
            position: {
                line: parseInt(line),
                character: parseInt(character)
            }
        }).then((result) => {
            return result;
        });
    }
}

function signatureHelp(uri: string, line: string, character: string) {
    if (client !== null) {
        client.signatureHelp({
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
        }).then((result) => {
            return result;
        });
    }
}

function once(method: string) {
    if (client !== null) {
        return client.once(method);
    } else {
        throw new Error('Client is not initialized');
    }
}


function hover(uri: string, line: string, character: string) {
    if (client !== null) {
        client.hover({
            textDocument: {
                uri: uri
            },
            position: {
                line: parseInt(line),
                character: parseInt(character)
            }
        }).then((result) => {
            return result;
        });
    }
}

function gotoDeclaration(uri: string, line: string, character: string) {
    if (client !== null) {
        client.gotoDeclaration({
            textDocument: {
                uri: uri
            },
            position: {
                line: parseInt(line),
                character: parseInt(character)
            }
        }).then((result) => {
            return result;
        });
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
    didClose,
    documentSymbol,
    references,
    definition,
    typeDefinition,
    signatureHelp,
    once,
    hover,
    gotoDeclaration
}