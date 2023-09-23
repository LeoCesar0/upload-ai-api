import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import fs from "fs";
import { prisma } from "../lib/prisma";

const pump = promisify(pipeline);

export async function uploadVideoDiskRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 25, // 25 MB
    },
  });

  app.post("/video-disk", async (req, res) => {
    const file = await req.file();

    if (!file) {
      return res.status(400).send({ error: "Missing file input." });
    }

    const extension = path.extname(file.filename);

    if (extension !== ".mp3") {
      return res
        .status(400)
        .send({ error: "Invalid input type. Only MP3 accepted." });
    }

    const fileBaseName = path.basename(file.filename, extension);
    const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`;

    const uploadPath = path.resolve(__dirname, "../../tmp", fileUploadName);

    await pump(file.file, fs.createWriteStream(uploadPath));

    const video = await prisma.video.create({
      data: {
        name: file.filename,
        path: uploadPath,
      },
    });

    return {
      data: video,
    };
  });
}
