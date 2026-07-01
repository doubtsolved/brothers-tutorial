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
exports.adminRoutes = void 0;
var hono_1 = require("hono");
var admin = new hono_1.Hono();
exports.adminRoutes = admin;
var SECRET_TOKEN = 'brothers_academic_secret_2026';
var ADMIN_PASSWORD = 'admin123';
/* ═══════════════════════════════════════════════════
   LOGIN PAGE — pure HTML form, no JS needed to work
   ═══════════════════════════════════════════════════ */
function loginPage(showError) {
    return "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\">\n<title>Admin Login \u2014 Brothers' Tutorial</title>\n<script src=\"https://cdn.tailwindcss.com\"></script>\n<script>tailwind.config={theme:{extend:{colors:{primary:'#1e3a5f',accent:'#f59e0b'}}}}</script>\n</head>\n<body class=\"bg-primary min-h-screen flex items-center justify-center p-4\">\n<div class=\"bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center\">\n  <div class=\"mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4\">\n    <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"#1e3a5f\" class=\"w-8 h-8\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z\"/></svg>\n  </div>\n  <h2 class=\"text-xl font-bold text-primary mb-1\">Admin Access</h2>\n  <p class=\"text-sm text-slate-500 mb-5\">Enter the admin password to continue</p>\n  ".concat(showError ? '<p class="text-red-500 text-sm mb-3 font-medium">Incorrect password — try again</p>' : '<div class="h-6 mb-3"></div>', "\n  <form method=\"POST\" action=\"/admin\">\n    <input name=\"password\" type=\"password\" placeholder=\"Password\" required autocomplete=\"off\" class=\"w-full px-4 py-2.5 border border-slate-300 rounded-lg text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-accent mb-3\">\n    <button type=\"submit\" class=\"w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-semibold transition cursor-pointer\">Unlock Dashboard</button>\n  </form>\n</div>\n</body>\n</html>");
}
/* ═══════════════════════════════════════════════════
   GET /admin — show login or dashboard
   ═══════════════════════════════════════════════════ */
admin.get('/', function (c) {
    var url = new URL(c.req.url);
    var token = url.searchParams.get('token');
    var isError = url.searchParams.get('error') === '1';
    if (token === SECRET_TOKEN) {
        return c.html(DASHBOARD_HTML);
    }
    return c.html(loginPage(isError));
});
/* ═══════════════════════════════════════════════════
   POST /admin — handle login (plain form, no token needed)
   Registered BEFORE the token gate so it bypasses it
   ═══════════════════════════════════════════════════ */
admin.post('/', function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var body, password;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, c.req.parseBody()];
            case 1:
                body = _a.sent();
                password = typeof body.password === 'string' ? body.password : '';
                if (password === ADMIN_PASSWORD) {
                    return [2 /*return*/, c.redirect('/admin?token=' + SECRET_TOKEN)];
                }
                return [2 /*return*/, c.redirect('/admin?error=1')];
        }
    });
}); });
/* ═══════════════════════════════════════════════════
   TOKEN GATE — everything after this requires token
   ═══════════════════════════════════════════════════ */
admin.use('*', function (c, next) { return __awaiter(void 0, void 0, void 0, function () {
    var token;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                token = new URL(c.req.url).searchParams.get('token');
                if (token !== SECRET_TOKEN) {
                    return [2 /*return*/, c.json({ error: 'Unauthorized' }, 401)];
                }
                return [4 /*yield*/, next()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/* ═══════════════════════════════════════════════════
   API: Fetch all data
   ═══════════════════════════════════════════════════ */
admin.get('/data', function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var kv, _a, landing, about, admission, alert, notices, downloads, carousel, hero, logo;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                kv = c.get('kv');
                return [4 /*yield*/, Promise.all([
                        kv.get('content:landing', { type: 'json' }),
                        kv.get('content:about', { type: 'json' }),
                        kv.get('content:admission', { type: 'json' }),
                        kv.get('alerts:active', { type: 'json' }),
                        kv.get('notices:list', { type: 'json' }),
                        kv.get('downloads:list', { type: 'json' }),
                        kv.get('media:carousel', { type: 'json' }),
                        kv.get('media:hero', { type: 'json' }),
                        kv.get('media:logo', { type: 'json' })
                    ])];
            case 1:
                _a = _b.sent(), landing = _a[0], about = _a[1], admission = _a[2], alert = _a[3], notices = _a[4], downloads = _a[5], carousel = _a[6], hero = _a[7], logo = _a[8];
                return [2 /*return*/, c.json({ landing: landing, about: about, admission: admission, alert: alert, notices: notices, downloads: downloads, carousel: carousel, hero: hero, logo: logo })];
        }
    });
}); });
/* ═══════════════════════════════════════════════════
   API: Cloudinary upload
   ═══════════════════════════════════════════════════ */
admin.post('/upload', function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var kv, cn, up, fd, file, target, caption, cfd, res, r, url, list, e_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                kv = c.get('kv');
                cn = c.env.CLOUDINARY_CLOUD_NAME || '';
                up = c.env.CLOUDINARY_UPLOAD_PRESET || '';
                if (!cn || !up)
                    return [2 /*return*/, c.json({ error: 'Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET env vars.' }, 500)];
                return [4 /*yield*/, c.req.formData()];
            case 1:
                fd = _b.sent();
                file = fd.get('file');
                target = fd.get('target') || 'carousel';
                caption = fd.get('caption') || '';
                if (!file)
                    return [2 /*return*/, c.json({ error: 'No file' }, 400)];
                cfd = new FormData();
                cfd.append('file', file);
                cfd.append('upload_preset', up);
                _b.label = 2;
            case 2:
                _b.trys.push([2, 12, , 13]);
                return [4 /*yield*/, fetch("https://api.cloudinary.com/v1_1/".concat(cn, "/image/upload"), { method: 'POST', body: cfd })];
            case 3:
                res = _b.sent();
                return [4 /*yield*/, res.json()];
            case 4:
                r = _b.sent();
                if (!r.secure_url)
                    throw new Error(((_a = r.error) === null || _a === void 0 ? void 0 : _a.message) || 'Upload failed');
                url = r.secure_url;
                if (!(target === 'hero')) return [3 /*break*/, 6];
                return [4 /*yield*/, kv.put('media:hero', JSON.stringify({ url: url, caption: caption }))];
            case 5:
                _b.sent();
                return [3 /*break*/, 11];
            case 6:
                if (!(target === 'logo')) return [3 /*break*/, 8];
                return [4 /*yield*/, kv.put('media:logo', JSON.stringify({ url: url }))];
            case 7:
                _b.sent();
                return [3 /*break*/, 11];
            case 8: return [4 /*yield*/, kv.get('media:carousel', { type: 'json' })];
            case 9:
                list = (_b.sent()) || [];
                list.push({ id: crypto.randomUUID(), url: url, caption: caption, order: list.length });
                return [4 /*yield*/, kv.put('media:carousel', JSON.stringify(list))];
            case 10:
                _b.sent();
                _b.label = 11;
            case 11: return [2 /*return*/, c.json({ success: true, url: url })];
            case 12:
                e_1 = _b.sent();
                return [2 /*return*/, c.json({ error: e_1.message || 'Upload failed' }, 500)];
            case 13: return [2 /*return*/];
        }
    });
}); });
/* ═══════════════════════════════════════════════════
   API: Update any content block
   ═══════════════════════════════════════════════════ */
admin.post('/content', function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var kv, _a, key, data;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                kv = c.get('kv');
                return [4 /*yield*/, c.req.json()];
            case 1:
                _a = _b.sent(), key = _a.key, data = _a.data;
                if (!key)
                    return [2 /*return*/, c.json({ error: 'Missing key' }, 400)];
                return [4 /*yield*/, kv.put(key, JSON.stringify(data))];
            case 2:
                _b.sent();
                return [2 /*return*/, c.json({ success: true })];
        }
    });
}); });
/* ═══════════════════════════════════════════════════
   API: Post notice
   ═══════════════════════════════════════════════════ */
admin.post('/notice', function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var kv, _a, textEn, textBn, list;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                kv = c.get('kv');
                return [4 /*yield*/, c.req.json()];
            case 1:
                _a = _b.sent(), textEn = _a.textEn, textBn = _a.textBn;
                return [4 /*yield*/, kv.get('notices:list', { type: 'json' })];
            case 2:
                list = (_b.sent()) || [];
                list.unshift({ id: crypto.randomUUID(), textEn: textEn || '', textBn: textBn || '', timestamp: new Date().toISOString() });
                return [4 /*yield*/, kv.put('notices:list', JSON.stringify(list))];
            case 3:
                _b.sent();
                return [2 /*return*/, c.json({ success: true })];
        }
    });
}); });
/* ═══════════════════════════════════════════════════
   API: Set alert
   ═══════════════════════════════════════════════════ */
admin.post('/alert', function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var kv, _a, textEn, textBn, type, active;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                kv = c.get('kv');
                return [4 /*yield*/, c.req.json()];
            case 1:
                _a = _b.sent(), textEn = _a.textEn, textBn = _a.textBn, type = _a.type, active = _a.active;
                return [4 /*yield*/, kv.put('alerts:active', JSON.stringify({ textEn: textEn, textBn: textBn, type: type || 'info', active: active !== false }))];
            case 2:
                _b.sent();
                return [2 /*return*/, c.json({ success: true })];
        }
    });
}); });
/* ═══════════════════════════════════════════════════
   API: Add download
   ═══════════════════════════════════════════════════ */
admin.post('/download', function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var kv, _a, title, url, fileSize, type, list;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                kv = c.get('kv');
                return [4 /*yield*/, c.req.json()];
            case 1:
                _a = _b.sent(), title = _a.title, url = _a.url, fileSize = _a.fileSize, type = _a.type;
                return [4 /*yield*/, kv.get('downloads:list', { type: 'json' })];
            case 2:
                list = (_b.sent()) || [];
                list.push({ id: crypto.randomUUID(), title: title || '', url: url || '', fileSize: fileSize || '', type: type || 'PDF' });
                return [4 /*yield*/, kv.put('downloads:list', JSON.stringify(list))];
            case 3:
                _b.sent();
                return [2 /*return*/, c.json({ success: true })];
        }
    });
}); });
/* ═══════════════════════════════════════════════════
   API: Unified delete
   ═══════════════════════════════════════════════════ */
admin.post('/delete', function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var kv, _a, collection, id, kvMap, items;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                kv = c.get('kv');
                return [4 /*yield*/, c.req.json()];
            case 1:
                _a = _b.sent(), collection = _a.collection, id = _a.id;
                if (!collection)
                    return [2 /*return*/, c.json({ error: 'Missing collection' }, 400)];
                kvMap = {
                    notices: 'notices:list',
                    downloads: 'downloads:list',
                    carousel: 'media:carousel'
                };
                if (!(kvMap[collection] && id)) return [3 /*break*/, 4];
                return [4 /*yield*/, kv.get(kvMap[collection], { type: 'json' })];
            case 2:
                items = (_b.sent()) || [];
                return [4 /*yield*/, kv.put(kvMap[collection], JSON.stringify(items.filter(function (i) { return i.id !== id; })))];
            case 3:
                _b.sent();
                return [3 /*break*/, 10];
            case 4:
                if (!(collection === 'alert')) return [3 /*break*/, 6];
                return [4 /*yield*/, kv.delete('alerts:active')];
            case 5:
                _b.sent();
                return [3 /*break*/, 10];
            case 6:
                if (!(collection === 'hero')) return [3 /*break*/, 8];
                return [4 /*yield*/, kv.delete('media:hero')];
            case 7:
                _b.sent();
                return [3 /*break*/, 10];
            case 8:
                if (!(collection === 'logo')) return [3 /*break*/, 10];
                return [4 /*yield*/, kv.delete('media:logo')];
            case 9:
                _b.sent();
                _b.label = 10;
            case 10: return [2 /*return*/, c.json({ success: true })];
        }
    });
}); });
/* ═══════════════════════════════════════════════════════════════
   DASHBOARD HTML — no password logic, just the workspace
   ═══════════════════════════════════════════════════════════════ */
var DASHBOARD_HTML = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\">\n<title>Admin \u2014 Brothers' Tutorial</title>\n<script src=\"https://cdn.tailwindcss.com\"></script>\n<script>tailwind.config={theme:{extend:{colors:{primary:'#1e3a5f',accent:'#f59e0b'}}}}</script>\n<style>\n*{scrollbar-width:thin;scrollbar-color:#1e3a5f #e2e8f0}\n.sl{transition:background .15s,padding-left .15s}\n.sl:hover,.sl.on{background:rgba(255,255,255,.12);padding-left:1.25rem}\n.sp{display:none}.sp.v{display:block}\n.fi{animation:fi .25s ease}\n@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}\n.dz{border:2px dashed #94a3b8;transition:border-color .2s,background .2s}\n.dz.dg{border-color:#f59e0b;background:#fffbeb}\n.tt{animation:si .3s ease,fo .3s ease 2.7s}\n@keyframes si{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}\n@keyframes fo{to{opacity:0;transform:translateX(100%)}}\n</style>\n</head>\n<body class=\"bg-slate-100 text-slate-800 font-sans min-h-screen\">\n\n<div id=\"T\" class=\"fixed top-4 right-4 z-[110] space-y-2\"></div>\n\n<header class=\"lg:hidden fixed top-0 left-0 right-0 z-50 bg-primary text-white h-14 flex items-center px-4 shadow-lg\">\n  <button id=\"MB\" class=\"p-1 -ml-1 mr-3\">\n    <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" class=\"w-6 h-6\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5\"/></svg>\n  </button>\n  <span class=\"font-bold text-lg\">Admin Panel</span>\n</header>\n\n<div id=\"SO\" class=\"lg:hidden fixed inset-0 z-50 bg-black/40 hidden\"></div>\n\n<aside id=\"SB\" class=\"fixed top-0 left-0 z-50 h-full w-64 bg-primary text-white transform -translate-x-full lg:translate-x-0 transition-transform duration-200 flex flex-col\">\n  <div class=\"h-14 flex items-center px-5 border-b border-white/10 flex-shrink-0\">\n    <div class=\"w-8 h-8 rounded-lg bg-accent flex items-center justify-center mr-3\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"#1e3a5f\" class=\"w-5 h-5\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342\"/></svg>\n    </div>\n    <div>\n      <div class=\"font-bold text-sm leading-tight\">Brothers' Tutorial</div>\n      <div class=\"text-[10px] text-white/50\">Administration</div>\n    </div>\n  </div>\n  <nav class=\"flex-1 overflow-y-auto py-3 px-2 space-y-0.5 text-sm\" id=\"NV\">\n\n    <button data-s=\"overview\" class=\"sl on w-full text-left px-3 py-2 rounded-lg flex items-center gap-3\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" class=\"w-5 h-5 flex-shrink-0\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z\"/></svg>\n      Overview\n    </button>\n\n    <div>\n      <button data-t=\"MS\" class=\"w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-white/10 transition\">\n        <span class=\"flex items-center gap-3\">\n          <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" class=\"w-5 h-5 flex-shrink-0\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z\"/></svg>\n          Media\n        </span>\n        <svg id=\"MC\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"2\" stroke=\"currentColor\" class=\"w-4 h-4 transition-transform\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m8.25 4.5 7.5 7.5-7.5 7.5\"/></svg>\n      </button>\n      <div id=\"MS\" class=\"hidden pl-4 space-y-0.5 mt-0.5\">\n        <button data-s=\"upload\" class=\"sl w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 text-white/70\">Upload Center</button>\n        <button data-s=\"carouselMgr\" class=\"sl w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 text-white/70\">Carousel Items</button>\n        <button data-s=\"heroLogo\" class=\"sl w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 text-white/70\">Hero & Logo</button>\n      </div>\n    </div>\n\n    <div>\n      <button data-t=\"CS\" class=\"w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-white/10 transition\">\n        <span class=\"flex items-center gap-3\">\n          <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" class=\"w-5 h-5 flex-shrink-0\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z\"/></svg>\n          Content Editor\n        </span>\n        <svg id=\"CC\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"2\" stroke=\"currentColor\" class=\"w-4 h-4 transition-transform\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m8.25 4.5 7.5 7.5-7.5 7.5\"/></svg>\n      </button>\n      <div id=\"CS\" class=\"hidden pl-4 space-y-0.5 mt-0.5\">\n        <button data-s=\"editLanding\" class=\"sl w-full text-left px-3 py-1.5 rounded-lg text-white/70\">Landing Page</button>\n        <button data-s=\"editAbout\" class=\"sl w-full text-left px-3 py-1.5 rounded-lg text-white/70\">About Page</button>\n        <button data-s=\"editAdmission\" class=\"sl w-full text-left px-3 py-1.5 rounded-lg text-white/70\">Admission Page</button>\n      </div>\n    </div>\n\n    <button data-s=\"notices\" class=\"sl w-full text-left px-3 py-2 rounded-lg flex items-center gap-3\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" class=\"w-5 h-5 flex-shrink-0\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0\"/></svg>\n      Notice Board\n    </button>\n    <button data-s=\"downloads\" class=\"sl w-full text-left px-3 py-2 rounded-lg flex items-center gap-3\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" class=\"w-5 h-5 flex-shrink-0\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3\"/></svg>\n      Downloads\n    </button>\n    <button data-s=\"alerts\" class=\"sl w-full text-left px-3 py-2 rounded-lg flex items-center gap-3\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" class=\"w-5 h-5 flex-shrink-0\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z\"/></svg>\n      Alert Banner\n    </button>\n  </nav>\n  <div class=\"p-3 border-t border-white/10 text-[10px] text-white/30 text-center\">Brothers Tutorial v1.0</div>\n</aside>\n\n<main class=\"lg:ml-64 pt-14 lg:pt-0 min-h-screen\">\n<div class=\"p-4 md:p-6 max-w-5xl mx-auto\">\n\n  <div id=\"sec-overview\" class=\"sp v fi\">\n    <h1 class=\"text-2xl font-bold text-primary mb-6\">Dashboard Overview</h1>\n    <div class=\"grid grid-cols-2 md:grid-cols-4 gap-4 mb-8\" id=\"SC\"></div>\n    <div class=\"grid md:grid-cols-2 gap-4\">\n      <div class=\"bg-white rounded-xl shadow-sm p-5\">\n        <h3 class=\"font-semibold text-primary mb-3\">Recent Notices</h3>\n        <div id=\"ON\" class=\"space-y-2 text-sm max-h-48 overflow-y-auto\"></div>\n      </div>\n      <div class=\"bg-white rounded-xl shadow-sm p-5\">\n        <h3 class=\"font-semibold text-primary mb-3\">Active Alert</h3>\n        <div id=\"OA\" class=\"text-sm\"></div>\n      </div>\n    </div>\n  </div>\n\n  <div id=\"sec-upload\" class=\"sp fi\">\n    <h1 class=\"text-2xl font-bold text-primary mb-6\">Upload Center</h1>\n    <div class=\"bg-white rounded-xl shadow-sm p-6\">\n      <div id=\"DZ\" class=\"dz rounded-xl p-10 text-center cursor-pointer mb-4\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1\" stroke=\"currentColor\" class=\"w-12 h-12 mx-auto text-slate-400 mb-3\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5\"/></svg>\n        <p class=\"text-slate-500 font-medium\">Drag and drop an image here, or click to select</p>\n        <input type=\"file\" id=\"FI\" accept=\"image/*\" class=\"hidden\">\n      </div>\n      <div id=\"PW\" class=\"hidden mb-4\"><img id=\"PI\" class=\"max-h-48 mx-auto rounded-lg shadow\"></div>\n      <div class=\"grid sm:grid-cols-2 gap-4 mb-4\">\n        <div>\n          <label class=\"block text-sm font-medium text-slate-600 mb-1\">Target</label>\n          <select id=\"UT\" class=\"w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none\">\n            <option value=\"carousel\">Carousel Slider</option>\n            <option value=\"hero\">Hero Background</option>\n            <option value=\"logo\">Logo</option>\n          </select>\n        </div>\n        <div>\n          <label class=\"block text-sm font-medium text-slate-600 mb-1\">Caption</label>\n          <input id=\"UC\" type=\"text\" placeholder=\"Optional caption\" class=\"w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none\">\n        </div>\n      </div>\n      <button id=\"UB\" disabled class=\"w-full sm:w-auto bg-accent hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed\">Upload to Cloudinary</button>\n    </div>\n  </div>\n\n  <div id=\"sec-carouselMgr\" class=\"sp fi\">\n    <h1 class=\"text-2xl font-bold text-primary mb-6\">Carousel Items</h1>\n    <div id=\"CL\" class=\"space-y-3\"></div>\n  </div>\n\n  <div id=\"sec-heroLogo\" class=\"sp fi\">\n    <h1 class=\"text-2xl font-bold text-primary mb-6\">Hero and Logo</h1>\n    <div class=\"grid md:grid-cols-2 gap-6\">\n      <div class=\"bg-white rounded-xl shadow-sm p-5\">\n        <h3 class=\"font-semibold text-primary mb-3\">Hero Background</h3>\n        <div id=\"HP\" class=\"rounded-lg overflow-hidden bg-slate-100 h-40 flex items-center justify-center text-slate-400 text-sm mb-3\">No image</div>\n        <button onclick=\"del('hero')\" class=\"text-red-500 hover:text-red-700 text-sm font-medium\">Remove</button>\n      </div>\n      <div class=\"bg-white rounded-xl shadow-sm p-5\">\n        <h3 class=\"font-semibold text-primary mb-3\">Logo</h3>\n        <div id=\"LP\" class=\"rounded-lg overflow-hidden bg-slate-100 h-40 flex items-center justify-center text-slate-400 text-sm mb-3\">No image</div>\n        <button onclick=\"del('logo')\" class=\"text-red-500 hover:text-red-700 text-sm font-medium\">Remove</button>\n      </div>\n    </div>\n  </div>\n\n  <div id=\"sec-editLanding\" class=\"sp fi\">\n    <h1 class=\"text-2xl font-bold text-primary mb-2\">Edit Landing Page</h1>\n    <p class=\"text-sm text-slate-500 mb-4\">Key: <code class=\"bg-slate-200 px-1.5 py-0.5 rounded text-xs\">content:landing</code></p>\n    <div class=\"bg-white rounded-xl shadow-sm p-5\">\n      <button onclick=\"ld('content:landing','LE')\" class=\"mb-3 text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition font-medium\">Load Data</button>\n      <textarea id=\"LE\" rows=\"14\" class=\"w-full border border-slate-300 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-accent focus:outline-none\"></textarea>\n      <div class=\"flex gap-2 mt-3\">\n        <button onclick=\"fj('LE')\" class=\"text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition\">Format</button>\n        <button onclick=\"sv('content:landing','LE')\" class=\"text-sm bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-lg transition font-medium\">Save</button>\n      </div>\n    </div>\n  </div>\n\n  <div id=\"sec-editAbout\" class=\"sp fi\">\n    <h1 class=\"text-2xl font-bold text-primary mb-2\">Edit About Page</h1>\n    <p class=\"text-sm text-slate-500 mb-4\">Key: <code class=\"bg-slate-200 px-1.5 py-0.5 rounded text-xs\">content:about</code></p>\n    <div class=\"bg-white rounded-xl shadow-sm p-5\">\n      <button onclick=\"ld('content:about','AE')\" class=\"mb-3 text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition font-medium\">Load Data</button>\n      <textarea id=\"AE\" rows=\"14\" class=\"w-full border border-slate-300 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-accent focus:outline-none\"></textarea>\n      <div class=\"flex gap-2 mt-3\">\n        <button onclick=\"fj('AE')\" class=\"text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition\">Format</button>\n        <button onclick=\"sv('content:about','AE')\" class=\"text-sm bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-lg transition font-medium\">Save</button>\n      </div>\n    </div>\n  </div>\n\n  <div id=\"sec-editAdmission\" class=\"sp fi\">\n    <h1 class=\"text-2xl font-bold text-primary mb-2\">Edit Admission Page</h1>\n    <p class=\"text-sm text-slate-500 mb-4\">Key: <code class=\"bg-slate-200 px-1.5 py-0.5 rounded text-xs\">content:admission</code></p>\n    <div class=\"bg-white rounded-xl shadow-sm p-5\">\n      <button onclick=\"ld('content:admission','DE')\" class=\"mb-3 text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition font-medium\">Load Data</button>\n      <textarea id=\"DE\" rows=\"14\" class=\"w-full border border-slate-300 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-accent focus:outline-none\"></textarea>\n      <div class=\"flex gap-2 mt-3\">\n        <button onclick=\"fj('DE')\" class=\"text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition\">Format</button>\n        <button onclick=\"sv('content:admission','DE')\" class=\"text-sm bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-lg transition font-medium\">Save</button>\n      </div>\n    </div>\n  </div>\n\n  <div id=\"sec-notices\" class=\"sp fi\">\n    <h1 class=\"text-2xl font-bold text-primary mb-6\">Notice Board</h1>\n    <div class=\"bg-white rounded-xl shadow-sm p-5 mb-6\">\n      <h3 class=\"font-semibold text-primary mb-3\">Post New Notice</h3>\n      <div class=\"space-y-3\">\n        <input id=\"NE\" type=\"text\" placeholder=\"English\" class=\"w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none\">\n        <input id=\"NB\" type=\"text\" placeholder=\"Bengali\" class=\"w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none\">\n        <button onclick=\"pn()\" class=\"bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-medium transition\">Post Notice</button>\n      </div>\n    </div>\n    <h3 class=\"font-semibold text-primary mb-3\">All Notices</h3>\n    <div id=\"NL\" class=\"space-y-2\"></div>\n  </div>\n\n  <div id=\"sec-downloads\" class=\"sp fi\">\n    <h1 class=\"text-2xl font-bold text-primary mb-6\">Downloads</h1>\n    <div class=\"bg-white rounded-xl shadow-sm p-5 mb-6\">\n      <h3 class=\"font-semibold text-primary mb-3\">Add Download</h3>\n      <div class=\"grid sm:grid-cols-2 gap-3\">\n        <input id=\"DT\" type=\"text\" placeholder=\"Title\" class=\"border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none\">\n        <input id=\"DU\" type=\"url\" placeholder=\"URL\" class=\"border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none\">\n        <input id=\"DS\" type=\"text\" placeholder=\"Size e.g. 2.4 MB\" class=\"border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none\">\n        <select id=\"DY\" class=\"border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none\">\n          <option>PDF</option><option>DOC</option><option>XLS</option><option>IMG</option><option>ZIP</option>\n        </select>\n      </div>\n      <button onclick=\"ad()\" class=\"mt-3 bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-medium transition\">Add Download</button>\n    </div>\n    <h3 class=\"font-semibold text-primary mb-3\">All Downloads</h3>\n    <div id=\"DL\" class=\"space-y-2\"></div>\n  </div>\n\n  <div id=\"sec-alerts\" class=\"sp fi\">\n    <h1 class=\"text-2xl font-bold text-primary mb-6\">Alert Banner</h1>\n    <div class=\"bg-white rounded-xl shadow-sm p-5 mb-6\">\n      <h3 class=\"font-semibold text-primary mb-3\">Set Alert</h3>\n      <div class=\"space-y-3\">\n        <input id=\"AEN\" type=\"text\" placeholder=\"English\" class=\"w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none\">\n        <input id=\"ABN\" type=\"text\" placeholder=\"Bengali\" class=\"w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none\">\n        <select id=\"ATP\" class=\"w-full sm:w-auto border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none\">\n          <option value=\"info\">Info</option><option value=\"warning\">Warning</option><option value=\"success\">Success</option><option value=\"error\">Error</option>\n        </select>\n        <button onclick=\"sa()\" class=\"bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-medium transition\">Set Alert</button>\n      </div>\n    </div>\n    <div class=\"bg-white rounded-xl shadow-sm p-5\">\n      <h3 class=\"font-semibold text-primary mb-3\">Current Alert</h3>\n      <div id=\"ADISP\" class=\"text-sm text-slate-500\">None</div>\n    </div>\n  </div>\n\n</div>\n</main>\n\n<script>\nconsole.log('DASHBOARD JS LOADED');\n\nvar D = {};\nvar TK = new URL(location.href).searchParams.get('token') || '';\n\nfunction ap(path) {\n  return '/admin' + path + (TK ? '?token=' + TK : '');\n}\n\nfunction toast(msg, ok) {\n  if (ok === undefined) ok = true;\n  var el = document.createElement('div');\n  el.className = 'tt px-4 py-2.5 rounded-lg shadow-lg text-white text-sm font-medium ' + (ok ? 'bg-emerald-600' : 'bg-red-600');\n  el.textContent = msg;\n  document.getElementById('T').appendChild(el);\n  setTimeout(function() {\n    if (el.parentNode) el.remove();\n  }, 3000);\n}\n\nfunction esc(s) {\n  if (!s) return '';\n  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');\n}\n\nfunction ac(t) {\n  var map = { info: 'blue', warning: 'yellow', success: 'green', error: 'red' };\n  return map[t] || 'blue';\n}\n\n/* \u2500\u2500 Sidebar section navigation \u2500\u2500 */\ndocument.querySelectorAll('[data-s]').forEach(function(btn) {\n  btn.addEventListener('click', function() {\n    var sec = btn.getAttribute('data-s');\n    document.querySelectorAll('.sp').forEach(function(p) { p.classList.remove('v'); });\n    document.querySelectorAll('.sl').forEach(function(l) { l.classList.remove('on'); });\n    var panel = document.getElementById('sec-' + sec);\n    if (panel) {\n      panel.classList.add('v');\n      panel.classList.remove('fi');\n      void panel.offsetWidth;\n      panel.classList.add('fi');\n    }\n    btn.classList.add('on');\n    closeSB();\n  });\n});\n\n/* \u2500\u2500 Collapsible sub-menus \u2500\u2500 */\ndocument.querySelectorAll('[data-t]').forEach(function(btn) {\n  btn.addEventListener('click', function() {\n    var subId = btn.getAttribute('data-t');\n    var chevId = subId.replace('S', 'C');\n    var sub = document.getElementById(subId);\n    var chev = document.getElementById(chevId);\n    sub.classList.toggle('hidden');\n    if (chev) {\n      chev.style.transform = sub.classList.contains('hidden') ? '' : 'rotate(90deg)';\n    }\n  });\n});\n\n/* \u2500\u2500 Mobile sidebar \u2500\u2500 */\nfunction closeSB() {\n  document.getElementById('SB').classList.add('-translate-x-full');\n  document.getElementById('SO').classList.add('hidden');\n}\n\ndocument.getElementById('MB').addEventListener('click', function() {\n  document.getElementById('SB').classList.remove('-translate-x-full');\n  document.getElementById('SO').classList.remove('hidden');\n});\n\ndocument.getElementById('SO').addEventListener('click', closeSB);\n\n/* \u2500\u2500 Fetch and render data \u2500\u2500 */\nfunction init() {\n  fetch(ap('/data'))\n    .then(function(r) { return r.json(); })\n    .then(function(data) {\n      D = data;\n      render();\n    })\n    .catch(function() {\n      toast('Failed to load data', false);\n    });\n}\n\nfunction render() {\n  /* Stat cards */\n  var sc = document.getElementById('SC');\n  var stats = [\n    { l: 'Carousel', v: (D.carousel || []).length, c: 'bg-blue-50 text-blue-700' },\n    { l: 'Notices', v: (D.notices || []).length, c: 'bg-amber-50 text-amber-700' },\n    { l: 'Downloads', v: (D.downloads || []).length, c: 'bg-emerald-50 text-emerald-700' },\n    { l: 'Alert', v: D.alert ? 'Active' : 'None', c: D.alert ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-500' }\n  ];\n  sc.innerHTML = stats.map(function(x) {\n    return '<div class=\"rounded-xl shadow-sm p-4 ' + x.c + '\"><div class=\"text-2xl font-bold\">' + x.v + '</div><div class=\"text-sm opacity-70\">' + x.l + '</div></div>';\n  }).join('');\n\n  /* Overview notices */\n  var onEl = document.getElementById('ON');\n  var notices = D.notices || [];\n  if (notices.length === 0) {\n    onEl.innerHTML = '<p class=\"text-slate-400\">No notices yet</p>';\n  } else {\n    onEl.innerHTML = notices.slice(0, 5).map(function(n) {\n      return '<div class=\"bg-slate-50 rounded-lg p-2\"><p class=\"font-medium text-slate-700\">' + esc(n.textEn) + '</p><p class=\"text-slate-500 text-xs\">' + esc(n.textBn) + '</p></div>';\n    }).join('');\n  }\n\n  /* Overview alert */\n  var oaEl = document.getElementById('OA');\n  if (D.alert) {\n    var clr = ac(D.alert.type);\n    oaEl.innerHTML = '<div class=\"bg-' + clr + '-50 border border-' + clr + '-200 rounded-lg p-3\"><p>' + esc(D.alert.textEn) + '</p><p class=\"text-xs mt-1 opacity-70\">' + esc(D.alert.textBn) + '</p></div>';\n  } else {\n    oaEl.innerHTML = '<p class=\"text-slate-400\">No active alert</p>';\n  }\n\n  /* Carousel list */\n  var clEl = document.getElementById('CL');\n  var slides = D.carousel || [];\n  if (slides.length === 0) {\n    clEl.innerHTML = '<p class=\"text-slate-400\">No carousel items</p>';\n  } else {\n    clEl.innerHTML = slides.map(function(x, i) {\n      return '<div class=\"bg-white rounded-xl shadow-sm p-3 flex gap-4 items-center\"><img src=\"' + esc(x.url) + '\" class=\"w-24 h-16 object-cover rounded-lg flex-shrink-0\"><div class=\"flex-1 min-w-0\"><p class=\"font-medium text-sm truncate\">' + esc(x.caption || 'Slide ' + (i + 1)) + '</p></div><button onclick=\"del('carousel','' + x.id + '')\" class=\"text-red-500 text-sm font-medium flex-shrink-0\">DEL</button></div>';\n    }).join('');\n  }\n\n  /* Hero and Logo */\n  document.getElementById('HP').innerHTML = D.hero ? '<img src=\"' + esc(D.hero.url) + '\" class=\"w-full h-full object-cover\">' : '<span>No image</span>';\n  document.getElementById('LP').innerHTML = D.logo ? '<img src=\"' + esc(D.logo.url) + '\" class=\"max-h-full max-w-full object-contain p-2\">' : '<span>No image</span>';\n\n  /* Notice list */\n  var nlEl = document.getElementById('NL');\n  if (notices.length === 0) {\n    nlEl.innerHTML = '<p class=\"text-slate-400\">No notices</p>';\n  } else {\n    nlEl.innerHTML = notices.map(function(n) {\n      return '<div class=\"bg-white rounded-xl shadow-sm p-3 flex gap-3 items-start\"><div class=\"flex-1 min-w-0\"><p class=\"font-medium text-sm\">' + esc(n.textEn) + '</p><p class=\"text-sm text-slate-500\">' + esc(n.textBn) + '</p><p class=\"text-xs text-slate-400 mt-1\">' + new Date(n.timestamp).toLocaleString() + '</p></div><button onclick=\"del('notices','' + n.id + '')\" class=\"text-red-500 text-sm font-medium flex-shrink-0\">DEL</button></div>';\n    }).join('');\n  }\n\n  /* Download list */\n  var dlEl = document.getElementById('DL');\n  var dls = D.downloads || [];\n  if (dls.length === 0) {\n    dlEl.innerHTML = '<p class=\"text-slate-400\">No downloads</p>';\n  } else {\n    dlEl.innerHTML = dls.map(function(d) {\n      return '<div class=\"bg-white rounded-xl shadow-sm p-3 flex gap-3 items-center\"><div class=\"w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 font-bold text-xs\">' + esc(d.type || 'PDF') + '</div><div class=\"flex-1 min-w-0\"><p class=\"font-medium text-sm truncate\">' + esc(d.title) + '</p><p class=\"text-xs text-slate-400\">' + esc(d.fileSize) + '</p></div><button onclick=\"del('downloads','' + d.id + '')\" class=\"text-red-500 text-sm font-medium flex-shrink-0\">DEL</button></div>';\n    }).join('');\n  }\n\n  /* Alert display */\n  var adEl = document.getElementById('ADISP');\n  if (D.alert) {\n    var clr2 = ac(D.alert.type);\n    adEl.innerHTML = '<div class=\"border rounded-lg p-3 border-' + clr2 + '-300 bg-' + clr2 + '-50 mb-3\"><p class=\"font-medium\">' + esc(D.alert.textEn) + '</p><p class=\"text-sm opacity-70\">' + esc(D.alert.textBn) + '</p></div><button onclick=\"del('alert')\" class=\"text-red-500 text-sm font-medium\">Dismiss</button>';\n  } else {\n    adEl.innerHTML = '<p class=\"text-slate-400\">None</p>';\n  }\n}\n\n/* \u2500\u2500 Upload logic \u2500\u2500 */\nvar selectedFile = null;\nvar dropZone = document.getElementById('DZ');\nvar fileInput = document.getElementById('FI');\n\ndropZone.addEventListener('click', function() {\n  fileInput.click();\n});\n\ndropZone.addEventListener('dragover', function(e) {\n  e.preventDefault();\n  dropZone.classList.add('dg');\n});\n\ndropZone.addEventListener('dragleave', function() {\n  dropZone.classList.remove('dg');\n});\n\ndropZone.addEventListener('drop', function(e) {\n  e.preventDefault();\n  dropZone.classList.remove('dg');\n  if (e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]);\n});\n\nfileInput.addEventListener('change', function() {\n  if (fileInput.files[0]) pickFile(fileInput.files[0]);\n});\n\nfunction pickFile(f) {\n  if (!f.type.startsWith('image/')) {\n    toast('Please select an image', false);\n    return;\n  }\n  selectedFile = f;\n  var reader = new FileReader();\n  reader.onload = function(e) {\n    document.getElementById('PI').src = e.target.result;\n    document.getElementById('PW').classList.remove('hidden');\n  };\n  reader.readAsDataURL(f);\n  document.getElementById('UB').disabled = false;\n}\n\ndocument.getElementById('UB').addEventListener('click', function() {\n  if (!selectedFile) return;\n  var btn = document.getElementById('UB');\n  btn.disabled = true;\n  btn.textContent = 'Uploading...';\n\n  var fd = new FormData();\n  fd.append('file', selectedFile);\n  fd.append('target', document.getElementById('UT').value);\n  fd.append('caption', document.getElementById('UC').value);\n\n  fetch(ap('/upload'), { method: 'POST', body: fd })\n    .then(function(r) { return r.json(); })\n    .then(function(j) {\n      if (j.success) {\n        toast('Uploaded successfully!');\n        selectedFile = null;\n        fileInput.value = '';\n        document.getElementById('PW').classList.add('hidden');\n        document.getElementById('UC').value = '';\n        btn.textContent = 'Upload to Cloudinary';\n        btn.disabled = true;\n        init();\n      } else {\n        toast(j.error || 'Upload failed', false);\n        btn.textContent = 'Upload to Cloudinary';\n        btn.disabled = false;\n      }\n    })\n    .catch(function() {\n      toast('Network error', false);\n      btn.textContent = 'Upload to Cloudinary';\n      btn.disabled = false;\n    });\n});\n\n/* \u2500\u2500 CRUD functions \u2500\u2500 */\nfunction pn() {\n  var en = document.getElementById('NE').value.trim();\n  var bn = document.getElementById('NB').value.trim();\n  if (!en && !bn) { toast('Enter notice text', false); return; }\n  fetch(ap('/notice'), {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ textEn: en, textBn: bn })\n  })\n  .then(function(r) { return r.json(); })\n  .then(function(j) {\n    if (j.success) {\n      toast('Notice posted!');\n      document.getElementById('NE').value = '';\n      document.getElementById('NB').value = '';\n      init();\n    } else { toast('Failed', false); }\n  });\n}\n\nfunction ad() {\n  var t = document.getElementById('DT').value.trim();\n  var u = document.getElementById('DU').value.trim();\n  var s = document.getElementById('DS').value.trim();\n  var y = document.getElementById('DY').value;\n  if (!t || !u) { toast('Title and URL required', false); return; }\n  fetch(ap('/download'), {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ title: t, url: u, fileSize: s, type: y })\n  })\n  .then(function(r) { return r.json(); })\n  .then(function(j) {\n    if (j.success) {\n      toast('Download added!');\n      document.getElementById('DT').value = '';\n      document.getElementById('DU').value = '';\n      document.getElementById('DS').value = '';\n      init();\n    } else { toast('Failed', false); }\n  });\n}\n\nfunction sa() {\n  var en = document.getElementById('AEN').value.trim();\n  var bn = document.getElementById('ABN').value.trim();\n  var tp = document.getElementById('ATP').value;\n  if (!en && !bn) { toast('Enter alert text', false); return; }\n  fetch(ap('/alert'), {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ textEn: en, textBn: bn, type: tp, active: true })\n  })\n  .then(function(r) { return r.json(); })\n  .then(function(j) {\n    if (j.success) {\n      toast('Alert set!');\n      document.getElementById('AEN').value = '';\n      document.getElementById('ABN').value = '';\n      init();\n    } else { toast('Failed', false); }\n  });\n}\n\nfunction del(collection, id) {\n  fetch(ap('/delete'), {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ collection: collection, id: id })\n  })\n  .then(function(r) { return r.json(); })\n  .then(function(j) {\n    if (j.success) {\n      toast('Deleted!');\n      init();\n    } else { toast('Failed', false); }\n  });\n}\n\nfunction ld(key, editorId) {\n  fetch(ap('/data'))\n    .then(function(r) { return r.json(); })\n    .then(function(d) {\n      var map = {\n        'content:landing': 'landing',\n        'content:about': 'about',\n        'content:admission': 'admission'\n      };\n      var val = d[map[key]];\n      if (val) {\n        document.getElementById(editorId).value = JSON.stringify(val, null, 2);\n      } else {\n        toast('No data found', false);\n      }\n    });\n}\n\nfunction sv(key, editorId) {\n  try {\n    var data = JSON.parse(document.getElementById(editorId).value);\n    fetch(ap('/content'), {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ key: key, data: data })\n    })\n    .then(function(r) { return r.json(); })\n    .then(function(j) {\n      if (j.success) toast('Saved!');\n      else toast('Failed', false);\n    });\n  } catch (e) {\n    toast('Invalid JSON', false);\n  }\n}\n\nfunction fj(id) {\n  try {\n    var obj = JSON.parse(document.getElementById(id).value);\n    document.getElementById(id).value = JSON.stringify(obj, null, 2);\n    toast('Formatted!');\n  } catch (e) {\n    toast('Invalid JSON', false);\n  }\n}\n\n/* \u2500\u2500 Boot \u2500\u2500 */\ninit();\n</script>\n</body>\n</html>";
