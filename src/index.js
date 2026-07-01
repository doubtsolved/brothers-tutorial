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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var hono_1 = require("hono");
var routes_ts_1 = require("./admin/routes.ts");
var app = new hono_1.Hono();
/* ── Detect runtime ── */
var isNode = typeof process !== 'undefined' && ((_a = process.versions) === null || _a === void 0 ? void 0 : _a.node);
/* ── Prepare KV fallback (mock for local, noop for edge) ── */
var noopKV = {
    get: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, null];
    }); }); },
    put: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); }); },
    delete: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); }); },
    list: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, ({ keys: [], list_complete: true, cursor: '' })];
    }); }); }
};
var kvFallback = noopKV;
/* ── Global middleware: safely preserve & merge Cloudflare env properties ── */
app.use('*', function (c, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                c.set('kv', c.env.BROTHERS_KV || kvFallback);
                return [4 /*yield*/, next()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/* ── Default content seeds ── */
var defaultLanding = {
    heroTitleEn: "Brothers' Tutorial",
    heroTitleBn: 'ব্রাদার্স টিউটোরিয়াল',
    heroSubtitleEn: 'Nurturing Minds, Building Futures — Excellence in Education Since 2010',
    heroSubtitleBn: 'মনন গড়া, ভবিষ্যৎ নির্মাণ — ২০১০ সাল থেকে শিক্ষায় শ্রেষ্ঠত্ব',
    aboutBriefEn: 'A premier coaching institute in Baruipara, Nadia, dedicated to academic excellence and holistic student development across all boards and competitive exams.',
    aboutBriefBn: 'বড়ুইপাড়া, নদিয়ায় অবস্থিত একটি শীর্ষস্থানীয় কোচিং ইনস্টিটিউট, যা সকল বোর্ড ও প্রতিযোগিতামূলক পরীক্ষায় শিক্ষায় শ্রেষ্ঠত্ব এবং শিক্ষার্থীদের সামগ্রিক বিকাশে নিবেদিত।',
    features: [
        { icon: 'academicCap', titleEn: 'Expert Faculty', titleBn: 'অভিজ্ঞ শিক্ষকমণ্ডলী', descEn: 'Highly qualified and experienced teachers guiding students towards success.', descBn: 'শিক্ষার্থীদের সাফল্যের দিকে পরিচালিত করছেন অত্যন্ত যোগ্য ও অভিজ্ঞ শিক্ষকগণ।' },
        { icon: 'bookOpen', titleEn: 'Comprehensive Curriculum', titleBn: 'ব্যাপক পাঠ্যক্রম', descEn: 'Well-structured study materials covering the complete syllabus for every subject.', descBn: 'প্রতিটি বিষয়ের সম্পূর্ণ পাঠ্যক্রম বিস্তৃত ও সু-কাঠামোগত অধ্যয়ন সামগ্রী।' },
        { icon: 'users', titleEn: 'Small Batch Size', titleBn: 'ছোট ব্যাচ সাইজ', descEn: 'Limited students per batch ensuring personalized attention for everyone.', descBn: 'প্রতিটি ব্যাচে সীমিত শিক্ষার্থী নিশ্চিত করে সবার জন্য ব্যক্তিগত মনোযোগ।' },
        { icon: 'clock', titleEn: 'Regular Tests & Feedback', titleBn: 'নিয়মিত পরীক্ষা ও মতামত', descEn: 'Frequent assessments to track progress and identify areas of improvement.', descBn: 'অগ্রগতি ট্র্যাক করতে এবং উন্নতির ক্ষেত্র চিহ্নিত করতে ঘন ঘন মূল্যায়ন।' }
    ],
    stats: { students: '500+', teachers: '25+', years: '14+', results: '95%+' }
};
var defaultAbout = {
    titleEn: "About Brothers' Tutorial",
    titleBn: 'ব্রাদার্স টিউটোরিয়াল সম্পর্কে',
    descriptionEn: "Brothers' Tutorial was established in 2010 in Baruipara, Nadia, West Bengal, with a vision to provide quality education to students from Class V to XII. Our institute has grown from a small group of passionate educators to a full-fledged academic center serving over 500 students annually.\n\nWe specialize in preparing students for West Bengal Board examinations (Madhyamik and Higher Secondary), along with foundational coaching for national-level competitive exams like JEE and NEET. Our teaching methodology combines traditional rigor with modern pedagogical techniques, ensuring that every student receives a well-rounded educational experience.",
    descriptionBn: 'ব্রাদার্স টিউটোরিয়াল ২০১০ সালে পশ্চিমবঙ্গের নদিয়া জেলার বড়ুইপাড়ায় পঞ্চম শ্রেণি থেকে দ্বাদশ শ্রেণির শিক্ষার্থীদের মানসম্মত শিক্ষা প্রদানের লক্ষ্যে প্রতিষ্ঠিত হয়েছিল। আমাদের প্রতিষ্ঠান অভিজ্ঞ শিক্ষকদের একটি ছোট দল থেকে বৃদ্ধি পেয়ে বছরে ৫০০ এরও বেশি শিক্ষার্থীকে সেবা প্রদানকারী একটি পূর্ণাঙ্গ একাডেমিক কেন্দ্রে পরিণত হয়েছে।\n\nআমরা পশ্চিমবঙ্গ বোর্ড পরীক্ষা (মাধ্যমিক ও উচ্চমাধ্যমিক) এবং জেইই ও নিট-এর মতো জাতীয় স্তরের প্রতিযোগিতামূলক পরীক্ষার জন্য ভিত্তিগত কোচিংয়ে বিশেষজ্ঞ। আমাদের শিক্ষাদান পদ্ধতি ঐতিহ্যবাহী কঠোরতার সাথে আধুনিক শিক্ষাবিজ্ঞান কৌশলের সমন্বয় করে, যাতে প্রতিটি শিক্ষার্থী একটি সুষম শিক্ষামূলক অভিজ্ঞতা লাভ করে।',
    missionEn: 'To empower every student with knowledge, confidence, and moral values, transforming them into responsible citizens and future leaders.',
    missionBn: 'প্রতিটি শিক্ষার্থীকে জ্ঞান, আত্মবিশ্বাস এবং নৈতিক মূল্যবোধ দিয়ে শক্তিশালী করা, তাদের দায়িত্বশীল নাগরিক এবং ভবিষ্যতের নেতা হিসেবে রূপান্তরিত করা।',
    visionEn: 'To become the most trusted and result-oriented educational institute in the Nadia district, setting benchmarks in academic excellence.',
    visionBn: 'নদিয়া জেলার সবচেয়ে বিশ্বস্ত এবং ফলাফল-ভিত্তিক শিক্ষা প্রতিষ্ঠান হওয়া, শিক্ষায় শ্রেষ্ঠত্বের মানদণ্ড স্থাপন করা।'
};
var defaultAdmission = {
    titleEn: 'Admission Details',
    titleBn: 'ভর্তি বিবরণ',
    introEn: 'Admissions are open for the current academic session. Secure your seat early to ensure the best batch timing and faculty assignment.',
    introBn: 'বর্তমান শিক্ষাবর্ষের জন্য ভর্তি চলছে। সেরা ব্যাচ টাইমিং এবং শিক্ষক নিয়োগ নিশ্চিত করতে আগেভাগে আপনার আসন সুরক্ষিত করুন।',
    classes: [
        { nameEn: 'Class V – VIII (All Subjects)', nameBn: 'পঞ্চম – অষ্টম শ্রেণি (সকল বিষয়)', feeEn: '\u20B9800/month', feeBn: '\u20B9\u09AE\u09BE\u09B8/\u09EE\u09EE\u09EE' },
        { nameEn: 'Class IX – X (Science & Arts)', nameBn: 'নবম – দশম শ্রেণি (বিজ্ঞান ও কলা)', feeEn: '\u20B91,200/month', feeBn: '\u20B9\u09EF,\u09EE\u09EE\u09AE\u09BE\u09B8' },
        { nameEn: 'Class XI – XII (Science Stream)', nameBn: 'একাদশ – দ্বাদশ শ্রেণি (বিজ্ঞান বিভাগ)', feeEn: '\u20B91,500/month', feeBn: '\u20B9\u09EF,\u09EB\u09EE\u09EE\u09AE\u09BE\u09B8' },
        { nameEn: 'JEE / NEET Foundation', nameBn: 'জেইই / নিট ফাউন্ডেশন', feeEn: '\u20B92,000/month', feeBn: '\u20B9\u09EE,\u09EE\u09EE\u09AE\u09BE\u09B8' }
    ],
    documentsEn: 'Required Documents: Marksheet of last exam, 2 passport-size photographs, Aadhaar card photocopy, and admission fee.',
    documentsBn: 'প্রয়োজনীয় কাগজপত্র: শেষ পরীক্ষার মার্কশিট, ২টি পাসপোর্ট সাইজের ছবি, আধার কার্ডের ফটোকপি এবং ভর্তি ফি।',
    contactEn: 'Visit our office at Baruipara, Nadia or call us for admission enquiries.',
    contactBn: 'ভর্তি সংক্রান্ত তথ্যের জন্য নদিয়ার বড়ুইপাড়ায় আমাদের অফিসে আসুন বা আমাদের কল করুন।'
};
/* ── Public API ── */
app.get('/api/content', function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var kv, _a, landing, about, admission, alert, notices, downloads, carousel, hero, logo, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                kv = c.get('kv');
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
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
            case 2:
                _a = _b.sent(), landing = _a[0], about = _a[1], admission = _a[2], alert = _a[3], notices = _a[4], downloads = _a[5], carousel = _a[6], hero = _a[7], logo = _a[8];
                return [2 /*return*/, c.json({
                        landing: landing || defaultLanding,
                        about: about || defaultAbout,
                        admission: admission || defaultAdmission,
                        alert: alert || null,
                        notices: notices || [],
                        downloads: downloads || [],
                        carousel: carousel || [],
                        hero: hero || null,
                        logo: logo || null
                    })];
            case 3:
                err_1 = _b.sent();
                console.error('API Error:', err_1);
                return [2 /*return*/, c.json({
                        landing: defaultLanding, about: defaultAbout, admission: defaultAdmission,
                        alert: null, notices: [], downloads: [], carousel: [], hero: null, logo: null
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); });
/* ── Admin routes (decoupled) ── */
app.route('/admin', routes_ts_1.adminRoutes);
/* ── Static file serving — local Node.js only ── */
/* if (isNode) {
  const { serve, serveStatic } = await import('@hono/node-server')
  app.use('/*', serveStatic({
    root: './public',
    rewriteRequestPath: (path: string) => (path === '/' ? '/index.html' : path)
  }))
  serve(
    { fetch: app.fetch, port: 3000 },
    (info: { port: number }) => {
      console.log('\n🚀 Brothers\' Tutorial — Local Dev Server')
      console.log(`   ➜  http://localhost:${info.port}`)
      console.log(`   ➜  Admin: http://localhost:${info.port}/admin?token=brothers_academic_secret_2026\n`)
    }
  )
} */
/* ── Local Node.js server — wrapped in async IIFE to prevent top-level await ── */
/* String-split import prevents Cloudflare bundler from pulling in node-server */
if (isNode) {
    (function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, readFileSync, existsSync, statSync, _b, join, extname, serve, MIME;
        return __generator(this, function (_c) {
            var _d;
            switch (_c.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('node:fs'); })];
                case 1:
                    _a = _c.sent(), readFileSync = _a.readFileSync, existsSync = _a.existsSync, statSync = _a.statSync;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('node:path'); })];
                case 2:
                    _b = _c.sent(), join = _b.join, extname = _b.extname;
                    return [4 /*yield*/, (_d = '@hono/node-ser' + 'ver', Promise.resolve().then(function () { return require(_d); }))];
                case 3:
                    serve = (_c.sent()).serve;
                    MIME = {
                        '.html': 'text/html; charset=utf-8',
                        '.css': 'text/css; charset=utf-8',
                        '.js': 'application/javascript; charset=utf-8',
                        '.json': 'application/json; charset=utf-8',
                        '.png': 'image/png',
                        '.jpg': 'image/jpeg',
                        '.svg': 'image/svg+xml',
                        '.ico': 'image/x-icon',
                        '.webp': 'image/webp',
                    };
                    app.use('*', function (c, next) { return __awaiter(void 0, void 0, void 0, function () {
                        var fp;
                        return __generator(this, function (_a) {
                            if (c.req.path.startsWith('/api/') || c.req.path.startsWith('/admin'))
                                return [2 /*return*/, next()];
                            fp = join(process.cwd(), 'public', c.req.path === '/' ? 'index.html' : c.req.path);
                            try {
                                if (statSync(fp).isDirectory())
                                    fp = join(fp, 'index.html');
                                if (!existsSync(fp))
                                    return [2 /*return*/, c.notFound()];
                                return [2 /*return*/, new Response(readFileSync(fp), {
                                        headers: { 'Content-Type': MIME[extname(fp)] || 'application/octet-stream' }
                                    })];
                            }
                            catch (_b) {
                                return [2 /*return*/, c.notFound()];
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    serve({ fetch: app.fetch, port: 3000 }, function (i) {
                        console.log("\n\uD83D\uDE80 Brothers' Tutorial \u2014 http://localhost:".concat(i.port));
                        console.log("   \u279C  Admin: http://localhost:".concat(i.port, "/admin?token=brothers_academic_secret_2026\n"));
                    });
                    return [2 /*return*/];
            }
        });
    }); })();
}
exports.default = app;
