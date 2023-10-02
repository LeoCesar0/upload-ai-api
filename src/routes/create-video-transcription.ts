import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { ReadStream, createReadStream, createWriteStream } from "fs";
import { openAi } from "../lib/openai";
import { getS3Object } from "../lib/s3";
import { promisify } from "util";
import path from "path";
import { randomUUID } from "crypto";

// const pump = promisify(pipe);

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
      where: {
        id: videoId,
      },
    });

    let tempPath = "";

    try {
      console.log("prompt -->", prompt);
      console.log("--> Creating stream");

      console.log("NODE ENV -->", process.env.NODE_ENV);

      console.log("--> 1");
      const object = getS3Object(video.path);
      console.log("--> 2");
      const tempReadStream = object.createReadStream();
      console.log("--> 3");

      const extension = path.extname(video.name);

      console.log("--> 4");

      tempPath = `/tmp/${randomUUID()}${extension}`;

      console.log("--> 5");

      // const tempPath = path.resolve("/tmp", `${randomUUID()}${extension}`);

      // const tempPath = path.resolve(
      //   __dirname,
      //   `../../tmp/${randomUUID()}${extension}`
      // );

      // if (
      //   process.env.NODE_ENV === "dev" ||
      //   process.env.NODE_ENV === "development"
      // ) {
      //   tempPath = path.resolve(
      //     __dirname,
      //     `../../tmp/${randomUUID()}${extension}`
      //   );
      // }

      const promise = new Promise((resolve, reject) => {
        const pipe = tempReadStream.pipe(createWriteStream(tempPath));
        pipe.on("finish", () => {
          resolve({});
        });
      });

      await promise;

      const readStream = createReadStream(tempPath);

      const openAiResponse = await openAi.audio.transcriptions.create({
        file: readStream,
        model: "whisper-1",
        language: "pt",
        prompt: prompt,
        response_format: "json",
        temperature: 0,
      });

      const transcription = openAiResponse.text;

      await prisma.video.update({
        data: {
          transcription: transcription,
        },
        where: {
          id: videoId,
        },
      });

      return transcription;
    } catch (err) {
      return {
        error: err,
        message: "Error on create transcription",
        env: process.env.NODE_ENV,
        tempPath,
      };
    }
  });
}
