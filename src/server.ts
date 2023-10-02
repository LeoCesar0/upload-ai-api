"use strict";
import * as dotenv from "dotenv";
dotenv.config();

import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { getAllPromptsRoute } from "./routes/get-all-prompts";
import { uploadVideoRoute } from "./routes/upload-video";
import { createVideoTranscriptionRoute } from "./routes/create-video-transcription";
import { generateTextRoute } from "./routes/generate-text";
import { uploadVideoDiskRoute } from "./routes/upload-video-disk";

const port = process.env.PORT ? Number(process.env.PORT) : 3333;

const app = fastify({
  logger: true,
});

app.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
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

app
  .listen({
    port: port,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log(`HTTP server running on port ${port}`);
  });

// if (require.main === module) {
//   // called directly i.e. "node app"
//   init()
//     .listen({
//       port: port,
//       host: "0.0.0.0",
//     })
//     .then(() => {
//       console.log(`HTTP server running on port ${port}`);
//     });
// } else {
//   module.exports = init;
// }

export default async (req: any, res: any) => {
  await app.ready();
  app.server.emit("request", req, res);
};
