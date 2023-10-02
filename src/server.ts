"use strict"
import * as dotenv from "dotenv";
dotenv.config();

import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { getAllPromptsRoute } from "./routes/get-all-prompts";
import { uploadVideoRoute } from "./routes/upload-video";
import { createVideoTranscriptionRoute } from "./routes/create-video-transcription";
import { generateTextRoute } from "./routes/generate-text";
import { uploadVideoDiskRoute } from "./routes/upload-video-disk";

const app = fastify({
  logger: true,
});

app.register(fastifyCors, {
  origin: "*",
});

app.register(async (app) => {
  app.get("/test", async (req, res) => {
    return { test: "Hello" };
  });
});

app.register(getAllPromptsRoute);
app.register(uploadVideoRoute);
app.register(uploadVideoDiskRoute);
app.register(createVideoTranscriptionRoute);
app.register(generateTextRoute);

const port = process.env.PORT ? Number(process.env.PORT) : 3333;

app
  .listen({
    port: port,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log(`HTTP server running on port ${port}`);
  });

export default app;

// export default async (req: any, res: any) => {
//   await app.ready();
//   app.server.emit("request", req, res);
// };
