"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
function startServer() {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('http://localhost:3000/start_server', {
                            params: {
                                server: 'coq'
                            }
                        })];
                case 1:
                    response = _a.sent();
                    console.log('Server Response:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error starting server:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function initializeServer(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('http://localhost:3000/initialize_server', {
                            params: {
                                filePath: filePath
                            }
                        })];
                case 1:
                    response = _a.sent();
                    console.log('Initialize Response:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error initializing server:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function initialized() {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('http://localhost:3000/initialized')];
                case 1:
                    response = _a.sent();
                    console.log('Initialized Response:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error initializing:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}

function shutdown() {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('http://localhost:3000/shutdown')];
                case 1:
                    response = _a.sent();
                    console.log('Shutdown Response:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error shutting down:', error_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}

function exit() {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('http://localhost:3000/exit')];
                case 1:
                    response = _a.sent();
                    console.log('Exit Response:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    console.error('Error exiting:', error_5);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}

function didOpen(uri, languageId, text) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('http://localhost:3000/didOpen', {
                            params: {
                                uri: uri,
                                languageId: languageId,
                                text: text
                            }
                        })];
                case 1:
                    response = _a.sent();
                    console.log('DidOpen Response:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _a.sent();
                    console.error('Error in didOpen:', error_6);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function didClose(uri) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('http://localhost:3000/didClose', {
                            params: {
                                uri: uri
                            }
                        })];
                case 1:
                    response = _a.sent();
                    console.log('DidClose Response:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_7 = _a.sent();
                    console.error('Error in didClose:', error_7);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}

function documentSymbol(uri) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('http://localhost:3000/documentSymbol', {
                            params: {
                                uri: uri
                            }
                        })];
                case 1:
                    response = _a.sent();
                    console.log('DocumentSymbol Response:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_8 = _a.sent();
                    console.error('Error in documentSymbol:', error_8);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}

function references(uri, line, character) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('http://localhost:3000/references', {
                            params: {
                                uri: uri,
                                line: line,
                                character: character
                            }
                        })];
                case 1:
                    response = _a.sent();
                    console.log('References Response:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_9 = _a.sent();
                    console.error('Error in references:', error_9);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}

function definition(uri, line, character) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('http://localhost:3000/definition', {
                            params: {
                                uri: uri,
                                line: line,
                                character: character
                            }
                        })];
                case 1:
                    response = _a.sent();
                    console.log('Definition Response:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_10 = _a.sent();
                    console.error('Error in definition:', error_10);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}

function typeDefinition(uri, line, character) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('http://localhost:3000/typeDefinition', {
                            params: {
                                uri: uri,
                                line: line,
                                character: character
                            }
                        })];
                case 1:
                    response = _a.sent();
                    console.log('TypeDefinition Response:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_11 = _a.sent();
                    console.error('Error in typeDefinition:', error_11);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}

function signatureHelp(uri, line, character) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('http://localhost:3000/signatureHelp', {
                            params: {
                                uri: uri,
                                line: line,
                                character: character
                            }
                        })];
                case 1:
                    response = _a.sent();
                    console.log('SignatureHelp Response:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_12 = _a.sent();
                    console.error('Error in signatureHelp:', error_12);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}

function hover(uri, line, character) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('http://localhost:3000/hover', {
                            params: {
                                uri: uri,
                                line: line,
                                character: character
                            }
                        })];
                case 1:
                    response = _a.sent();
                    console.log('Hover Response:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_13 = _a.sent();
                    console.error('Error in hover:', error_13);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}

function declaration(uri, line, character) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_14;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('http://localhost:3000/declaration', {
                            params: {
                                uri: uri,
                                line: line,
                                character: character
                            }
                        })];
                case 1:
                    response = _a.sent();
                    console.log('Declaration Response:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_14 = _a.sent();
                    console.error('Error in declaration:', error_14);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}

startServer().then(function () {
    initializeServer('C:\\Users\\smile\\Documents\\SEP\\Proofflow-lsp\\src\\mock\\mock.v');
});
