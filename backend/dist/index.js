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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const os_1 = __importDefault(require("os"));
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const prompt_1 = require("./utils/prompt");
dotenv_1.default.config();
let groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
if (cluster_1.default.isPrimary) {
    const cpus = os_1.default.cpus().length;
    for (let i = 0; i < cpus; i++) {
        cluster_1.default.fork();
    }
    cluster_1.default.on("exit", (worker) => {
        console.log(`Worker died with process id ${worker.process.pid}`);
        cluster_1.default.fork();
    });
}
else {
    const apiLimiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: "Too many requests to handle",
        statusCode: 429,
        legacyHeaders: true,
        standardHeaders: "draft-6",
    });
    const PORT = 8000;
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: ["https://doc-panel-1.onrender.com", "http://localhost:5173"],
    }));
    app.use(express_1.default.json());
    app.use(apiLimiter);
    app.post("/api/generate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        var _d, _e;
        const { complaint, duration, bodyPart, side, number, language } = req.body;
        if (!complaint) {
            res.status(400).json({ msg: "Complaint field cannot be empty" });
            return;
        }
        res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        res.setHeader("Transfer-Encoding", "chunked");
        res.setHeader("Cache-Control", "no-cache");
        try {
            const stream = yield groq.chat.completions.create({
                messages: [
                    {
                        role: "assistant",
                        content: (0, prompt_1.prompt)(language),
                    },
                    {
                        role: "user",
                        content: `
        Describe the symptoms, duration, severity, and any other relevant observations provided by the patient.
        Be as clear and specific as possible to help the AI generate accurate suggestions.
        
        Patient complains of ${complaint} on ${side} side from the past ${duration} months, and these many number of body parts are affected ${number} . The affected part i ${bodyPart}
        `,
                    },
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.5,
                max_completion_tokens: 1024,
                top_p: 1,
                stop: ", 3",
                stream: true,
            });
            try {
                for (var _f = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), _a = stream_1_1.done, !_a; _f = true) {
                    _c = stream_1_1.value;
                    _f = false;
                    const chunk = _c;
                    const content = ((_e = (_d = chunk.choices[0]) === null || _d === void 0 ? void 0 : _d.delta) === null || _e === void 0 ? void 0 : _e.content) || "";
                    res.write(content);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_f && !_a && (_b = stream_1.return)) yield _b.call(stream_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            res.end();
        }
        catch (error) {
            res.status(500).json({ msg: "Error while streaming..." });
        }
    }));
    app.listen(PORT, () => {
        console.log(`Server running at port ${PORT}`);
    });
}
