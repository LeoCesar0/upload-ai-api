import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { createReadStream } from "fs";
import { openAi } from "../lib/openai";

const paramsSchema = z.object({
  videoId: z.string().uuid(),
});

const bodySchema = z.object({
  prompt: z.string(),
});

export async function createVideoTranscriptionRoute(app: FastifyInstance) {
  app.post("/video/:videoId/transcription", async (req, res) => {
    const { videoId } = paramsSchema.parse(req.params);
    const { prompt } = bodySchema.parse(req.body);

    const video = await prisma.video.findUniqueOrThrow({
      where:{
        id: videoId,
      }
    })

    const readStream = createReadStream(video.path)

    const openAiResponse = await openAi.audio.transcriptions.create({
      file: readStream,
      model: 'whisper-1',
      language: 'pt',
      prompt: prompt,
      response_format: 'json',
      temperature: 0
    })

    return openAiResponse.text

    // return {
    //   videoId,
    //   prompt,
    // };
  });
}
