import { uinteger, OptionalVersionedTextDocumentIdentifier, TextDocumentRegistrationOptions, TextDocumentSyncKind } from './models';

/**
 * An event describing a change to a text document. If only a text is provided
 * it is considered to be the full content of the document.
 */
export type TextDocumentContentChangeEvent = {
    /**
     * The range of the document that changed.
     */
    range: Range;

    /**
     * The optional length of the range that got replaced.
     *
     * @deprecated use range instead.
     */
    rangeLength?: uinteger;

    /**
     * The new text for the provided range.
     */
    text: string;
} | {
    /**
     * The new text of the whole document.
     */
    text: string;
};

export interface DidChangeTextDocumentParams {
    /**
     * The document that did change. The version number points
     * to the version after all provided content changes have
     * been applied.
     */
    textDocument: OptionalVersionedTextDocumentIdentifier;

    /**
     * The actual content changes. The content changes describe single state
     * changes to the document. So if there are two content changes c1 (at
     * array index 0) and c2 (at array index 1) for a document in state S then
     * c1 moves the document from S to S' and c2 from S' to S''. So c1 is
     * computed on the state S and c2 is computed on the state S'.
     *
     * To mirror the content of a document using change events use the following
     * approach:
     * - start with the same initial content
     * - apply the 'textDocument/didChange' notifications in the order you
     *   receive them.
     * - apply the `TextDocumentContentChangeEvent`s in a single notification
     *   in the order you receive them.
     */
    contentChanges: TextDocumentContentChangeEvent[];
}

export interface TextDocumentChangeRegistrationOptions extends TextDocumentRegistrationOptions {
    syncKind: TextDocumentSyncKind;
}



// Define TextDocumentIdentifier
interface TextDocumentIdentifier {
    uri: string;
}

// Define Position
interface Position {
    line: number;
    character: number;
}

// Define CompletionContext
export interface CompletionContext {
    triggerKind: number; // 1: Invoked, 2: TriggerCharacter, 3: TriggerForIncompleteCompletions
    triggerCharacter?: string;
}

// Define TextEdit
interface TextEdit {
    range: {
        start: Position;
        end: Position;
    };
    newText: string;
}

// Define Command
interface Command {
    title: string;
    command: string;
    arguments?: any[];
}

export interface CompletionParams {
    textDocument: TextDocumentIdentifier;
    position: Position;
    context?: CompletionContext;
}

// Define CompletionItem
interface CompletionItem {
    label: string;
    kind?: number; // CompletionItemKind
    detail?: string;
    documentation?: string | { kind: string, value: string };
    sortText?: string;
    filterText?: string;
    insertText?: string;
    insertTextFormat?: number; // 1: PlainText, 2: Snippet
    textEdit?: TextEdit;
    additionalTextEdits?: TextEdit[];
    commitCharacters?: string[];
    command?: Command;
    data?: any;
}

// Define CompletionList
interface CompletionList {
    isIncomplete: boolean;
    items: CompletionItem[];
}

// Define and export CompletionResult
export type CompletionResult = CompletionItem[] | CompletionList;
