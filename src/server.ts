import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { getAllPromptsRoute } from "./routes/get-all-prompts";
import { uploadVideoRoute } from "./routes/upload-video";
import { createVideoTranscriptionRoute } from "./routes/create-video-transcription";
import { generateTextRoute } from "./routes/generate-text";
import { uploadVideoDiskRoute } from "./routes/upload-video-disk";

const app = fastify();

app.register(fastifyCors, {
  origin: "*",
});

app.register(getAllPromptsRoute);
app.register(uploadVideoRoute);
app.register(uploadVideoDiskRoute);
app.register(createVideoTranscriptionRoute);
app.register(generateTextRoute);

const port = 3333;

app
  .listen({
    port: port,
  })
  .then(() => {
    console.log(`HTTP server running on port ${port}`);
  });
