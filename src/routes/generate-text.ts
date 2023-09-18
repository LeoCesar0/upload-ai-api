import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { openAi } from "../lib/openai";

const bodySchema = z.object({
  videoId: z.string().uuid(),
  template: z.string(),
  temperature: z.number().min(0).max(1).default(0.5),
});

export async function generateTextRoute(app: FastifyInstance) {
  app.post("/generate", async (req, res) => {
    const { temperature, template, videoId } = bodySchema.parse(req.body);

    if (!template.includes("{transcription}")) {
      return res.status(400).send({
        error: {
          message: "Invalid template. Must include {transcription}",
        },
      });
    }

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    });

    const transcription = video.transcription;

    if (!transcription) {
      return res.status(400).send({
        error: {
          message: "Transcription not found",
        },
      });
    }

    const promptMessage = template.replace("{transcription}", transcription);

    const openAiResponse = await openAi.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      temperature: temperature,
      messages: [
        {
          content: promptMessage,
          role: "user",
        },
      ],
    });

    return openAiResponse;
  });
}
