import { JSONRPCEndpoint } from "./jsonRpcEndpoint";
import {
  DefinitionParams,
  DidCloseTextDocumentParams,
  DidOpenTextDocumentParams,
  DidChangeTextDocumentParams,
  DocumentSymbol,
  DocumentSymbolParams,
  InitializeParams,
  InitializeResult,
  LocationLink,
  ReferenceParams,
  ResponseError,
  ShutdownResult,
  SignatureHelp,
  SignatureHelpParams,
  SymbolInformation,
  TypeDefinitionParams,
  Location,
  HoverParams,
  Hover, DeclarationParams,
  GoalRequestParams,
  FlecheDocumentParams, CompletionResult, CompletionParams,
} from './models';
import { once } from 'events';
export class LspClient {

    private endpoint: JSONRPCEndpoint;

    public constructor(endpoint: JSONRPCEndpoint) {
        this.endpoint = endpoint;
    }

    public initialize(params: InitializeParams): PromiseLike<InitializeResult> {
        return this.endpoint.send('initialize', params);
    }

    public initialized(): void {
        this.endpoint.notify('initialized');
    }

    public shutdown(): PromiseLike<ShutdownResult> {
        return this.endpoint.send('shutdown');
    }

    public exit(): void {
        this.endpoint.notify('exit');
    }

    public didOpen(params: DidOpenTextDocumentParams): void {
        this.endpoint.notify('textDocument/didOpen', params);
    }

    public didChange(params: DidChangeTextDocumentParams): void {
        this.endpoint.notify('textDocument/didChange', params);
    }

    public didClose(params: DidCloseTextDocumentParams): void {
        this.endpoint.notify('textDocument/didClose', params);
    }

    public documentSymbol(params: DocumentSymbolParams): PromiseLike<DocumentSymbol[] | SymbolInformation[] | null> {
        return this.endpoint.send('textDocument/documentSymbol', params);
    }

    public references(params: ReferenceParams): PromiseLike<Location[] | ResponseError | null> {
        return this.endpoint.send('textDocument/references', params);
    }

    public definition(params: DefinitionParams): PromiseLike<Location | Location[] | LocationLink[] | ResponseError | null> {
        return this.endpoint.send('textDocument/definition', params);
    }

    public typeDefinition(params: TypeDefinitionParams): PromiseLike<Location | Location[] | LocationLink[] | ResponseError | null> {
        return this.endpoint.send('textDocument/typeDefinition', params);
    }

    public signatureHelp(params: SignatureHelpParams): PromiseLike<SignatureHelp | null> {
        return this.endpoint.send('textDocument/signatureHelp', params);
    }

    public once(method: string): ReturnType<typeof once> {
        return once(this.endpoint, method);
    }

    public hover(params: HoverParams): PromiseLike<Hover> {
      return this.endpoint.send('textDocument/hover', params);
    }

  public completion(params: CompletionParams): PromiseLike<CompletionResult> {
    return this.endpoint.send('textDocument/completion', params);
  }


  public gotoDeclaration(params: DeclarationParams): PromiseLike<Location | Location[] | LocationLink[] |null> {
      return this.endpoint.send('textDocument/declaration', params);
    }

    //Coq specific functions
    public goals(params: GoalRequestParams): PromiseLike<any> { //idk what the return type should be
      return this.endpoint.send('proof/goals', params);
    }

    public getDocument(params: FlecheDocumentParams): PromiseLike<any> { //same here
      return this.endpoint.send('coq/getDocument', params);
    }
}
