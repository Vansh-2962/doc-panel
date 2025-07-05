import cluster from "cluster";
import { Request, Response } from "express";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import os from "os";
import Groq from "groq-sdk";
import { prompt } from "./utils/prompt";

dotenv.config();

let groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

if (cluster.isPrimary) {
  const cpus = os.cpus().length;

  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`Worker died with process id ${worker.process.pid}`);
    cluster.fork();
  });
} else {
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests to handle",
    statusCode: 429,
    legacyHeaders: true,
    standardHeaders: "draft-6",
  });

  const PORT = 8000;
  const app = express();
  dotenv.config();

  app.use(
    cors({
      origin: ["https://doc-panel-1.onrender.com", "http://localhost:5173"],
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(apiLimiter);

  app.post("/api/generate", async (req: Request, res: Response) => {
    const { complaint, duration, bodyPart, side, number, language } = req.body;
    if (!complaint) {
      res.status(400).json({ msg: "Complaint field cannot be empty" });
      return;
    }
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Access-Control-Allow-Origin", "*");

    try {
      const stream = await groq.chat.completions.create({
        messages: [
          {
            role: "assistant",
            content: prompt(language),
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

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        res.write(content);
      }
      res.end();
    } catch (error) {
      res.status(500).json({ msg: "Error while streaming..." });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
  });
}
