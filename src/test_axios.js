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
// // try these below
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
                    console.error('Error during initialization:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// async function shutdown() {
//   try {
//     const response = await axios.get('http://localhost:3000/shutdown');
//     console.log('Shutdown Response:', response.data);
//   } catch (error) {
//     console.error('Error during shutdown:', error);
//   }
// }
// async function exit() {
//   try {
//     const response = await axios.get('http://localhost:3000/exit');
//     console.log('Exit Response:', response.data);
//   } catch (error) {
//     console.error('Error during exit:', error);
//   }
// }
function didOpen(uri, languageId, text, version) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('http://localhost:3000/didOpen', {
                            params: {
                                uri: uri,
                                languageId: languageId,
                                text: text,
                                version: version
                            }
                        })];
                case 1:
                    response = _a.sent();
                    console.log('DidOpen Response:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error opening document:', error_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// async function didClose(uri: string) {
//   try {
//     const response = await axios.get('http://localhost:3000/didClose', {
//       params: {
//         uri: uri
//       }
//     });
//     console.log('DidClose Response:', response.data);
//   } catch (error) {
//     console.error('Error closing document:', error);
//   }
// }
// async function documentSymbol(uri: string) {
//   try {
//     const response = await axios.get('http://localhost:3000/documentSymbol', {
//       params: {
//         uri: uri
//       }
//     });
//     console.log('DocumentSymbol Response:', response.data);
//   } catch (error) {
//     console.error('Error getting document symbols:', error);
//   }
// }
// async function references(uri: string, line: number, character: number) {
//   try {
//     const response = await axios.get('http://localhost:3000/references', {
//       params: {
//         uri: uri,
//         line: line,
//         character: character
//       }
//     });
//     console.log('References Response:', response.data);
//   } catch (error) {
//     console.error('Error getting references:', error);
//   }
// }
// async function definition(uri: string) {
//   try {
//     const response = await axios.get('http://localhost:3000/definition', {
//       params: {
//         uri: uri
//       }
//     });
//     console.log('Definition Response:', response.data);
//   } catch (error) {
//     console.error('Error getting definition:', error);
//   }
// }
// async function typeDefinition(uri: string) {
//   try {
//     const response = await axios.get('http://localhost:3000/typeDefinition', {
//       params: {
//         uri: uri
//       }
//     });
//     console.log('TypeDefinition Response:', response.data);
//   } catch (error) {
//     console.error('Error getting type definition:', error);
//   }
// }
// async function signatureHelp(uri: string, line: number, character: number) {
//   try {
//     const response = await axios.get('http://localhost:3000/signatureHelp', {
//       params: {
//         uri: uri,
//         line: line,
//         character: character
//       }
//     });
//     console.log('SignatureHelp Response:', response.data);
//   } catch (error) {
//     console.error('Error getting signature help:', error);
//   }
// }
// async function hover(uri: string, line: number, character: number) {
//   try {
//     const response = await axios.get('http://localhost:3000/hover', {
//       params: {
//         uri: uri,
//         line: line,
//         character: character
//       }
//     });
//     console.log('Hover Response:', response.data);
//   } catch (error) {
//     console.error('Error getting hover:', error);
//   }
// }
// async function gotoDeclaration(uri: string, line: number, character: number) {
//   try {
//     const response = await axios.get('http://localhost:3000/gotoDeclaration', {
//       params: {
//         uri: uri,
//         line: line,
//         character: character
//       }
//     });
//     console.log('GotoDeclaration Response:', response.data);
//   } catch (error) {
//     console.error('Error going to declaration:', error);
//   }
// }
// export {
//   startServer,
//   initializeServer,
//   initialized,
//   shutdown,
//   exit,
//   didOpen,
//   didClose,
//   documentSymbol,
//   references,
//   definition,
//   typeDefinition,
//   signatureHelp,
//   hover,
//   gotoDeclaration
// };
startServer().then(function () {
    initializeServer('C:\\Users\\smile\\Documents\\SEP\\Proofflow-lsp\\src\\mock\\mock.v').then(function () {
        initialized().then(function () {
            didOpen('C:\\Users\\smile\\Documents\\SEP\\Proofflow-lsp\\src\\mock\\mock.v', 'coq', 'example', '1');
        });
    });
});
