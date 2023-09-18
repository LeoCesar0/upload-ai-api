import { fastify } from "fastify";
import { getAllPromptsRoute } from "./routes/get-all-prompts";
import { uploadVideoRoute } from "./routes/upload-video";
import { createVideoTranscriptionRoute } from "./routes/create-video-transcription";

const app = fastify();

app.register(getAllPromptsRoute)
app.register(uploadVideoRoute)
app.register(createVideoTranscriptionRoute)

const port = 3333;

app
  .listen({
    port: port,
  })
  .then(() => {
    console.log(`HTTP server running on port ${port}`);
  });
