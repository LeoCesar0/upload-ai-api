import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { openAi } from "../lib/openai";
import {streamToResponse, OpenAIStream} from 'ai'

const bodySchema = z.object({
  videoId: z.string().uuid(),
  prompt: z.string(),
  temperature: z.number().min(0).max(1).default(0.5),
  model: z.string().default("gpt-3.5-turbo-16k")
});

export async function generateTextRoute(app: FastifyInstance) {
  app.post("/generate", async (req, res) => {
    const { temperature, prompt, videoId, model } = bodySchema.parse(req.body);

    if (!prompt.includes("{transcription}")) {
      return res.status(400).send({
        error: {
          message: "Invalid prompt. Must include {transcription}",
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

    let fullPrompt = prompt

    if(!fullPrompt.includes("{transcription}")) fullPrompt = `${fullPrompt}. Transcription: '''{transcription}'''`

    fullPrompt = prompt.replace("{transcription}", transcription);

    const openAiResponse = await openAi.chat.completions.create({
      model: model,
      temperature: temperature,
      messages: [
        {
          content: fullPrompt,
          role: "user",
        },
      ],
      stream:true
    });

    const stream = OpenAIStream(openAiResponse)

    streamToResponse(stream, res.raw, {
      headers:{
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      }
    })

  });
}
