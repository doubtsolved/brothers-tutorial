"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var hono_1 = require("hono");
var node_server_1 = require("@hono/node-server");
var fs_1 = require("fs");
var path_1 = require("path");
var kvMock_ts_1 = require("./kvMock.ts");
// FIXED: Import the decoupled route layer with explicit strict ESM extension
var routes_ts_1 = require("./admin/routes.ts");
var app = new hono_1.Hono();
// Database Getter/Setter Actions abstraction layers
function getDataset(c) {
    return __awaiter(this, void 0, void 0, function () {
        var data, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(c.env && c.env.BROTHERS_KV)) return [3 /*break*/, 2];
                    return [4 /*yield*/, c.env.BROTHERS_KV.get('site_data')];
                case 1:
                    data = _c.sent();
                    return [2 /*return*/, JSON.parse(data || '{}')];
                case 2:
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, (0, kvMock_ts_1.getLocalKV)()];
                case 3: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
            }
        });
    });
}
function saveDataset(c, data) {
    return __awaiter(this, void 0, void 0, function () {
        var jsonString;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jsonString = JSON.stringify(data, null, 2);
                    if (!(c.env && c.env.BROTHERS_KV)) return [3 /*break*/, 2];
                    return [4 /*yield*/, c.env.BROTHERS_KV.put('site_data', jsonString)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
                case 2: return [4 /*yield*/, (0, kvMock_ts_1.putLocalKV)(jsonString)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Global Middleware Context Hook: Injects system utility configurations safely into admin scopes
app.use('*', function (c, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                c.env = __assign(__assign({}, c.env), { getDatasetHelper: getDataset, saveDatasetHelper: saveDataset, serveHtmlHelper: function (ctx, filename) {
                        return ctx.html(fs_1.default.readFileSync((0, path_1.join)(process.cwd(), 'public', filename), 'utf-8'));
                    } });
                return [4 /*yield*/, next()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// ----------------- PUBLIC CORE SITE ENDPOINTS -----------------
app.get('/api/content', function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = c).json;
                return [4 /*yield*/, getDataset(c)];
            case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
        }
    });
}); });
var serveHtml = function (filename) { return function (c) {
    try {
        return c.html(fs_1.default.readFileSync((0, path_1.join)(process.cwd(), 'public', filename), 'utf-8'));
    }
    catch (_a) {
        return c.text("".concat(filename, " template asset unreadable."), 404);
    }
}; };
app.get('/', serveHtml('index.html'));
app.get('/about', serveHtml('about.html'));
app.get('/admission-details', serveHtml('admission-details.html'));
// ----------------- SUB-ROUTER MOUNT -----------------
// Mount all administrative endpoints cleanly from the admin folder module
app.route('/admin', routes_ts_1.adminRoutes);
// Start runtime engine
// Existing serve configurations remain completely intact for local Termux execution
var port = Number(process.env.PORT) || 3000;
console.log("\n\uD83D\uDD25 Architecture Decoupled & Active at http://localhost:".concat(port));
(0, node_server_1.serve)({ fetch: app.fetch, port: port });
// ADD THIS LINE FOR CLOUDFLARE CLOUD RESOLUTION:
exports.default = app;
