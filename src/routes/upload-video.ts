import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import fs from "fs";
import { prisma } from "../lib/prisma";
import { AWS_S3, S3_BUCKET_NAME } from "../lib/s3";

const pump = promisify(pipeline);

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 25, // 25 MB
    },
  });

  app.post("/video", async (req, res) => {
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

    // const uploadPath = path.resolve(__dirname, "../../tmp", fileUploadName);

    // await pump(file.file, fs.createWriteStream(uploadPath));

    if (!S3_BUCKET_NAME) {
      console.log("S3_BUCKET_NAME not found");
      return {
        error: {
          message: "S3_BUCKET_NAME not found",
        },
      };
    }

    const uploaded = await AWS_S3.upload({
      Bucket: S3_BUCKET_NAME,
      Key: fileUploadName,
      Body: file.file,
    }).promise();


    const video = await prisma.video.create({
      data: {
        name: file.filename,
        path: uploaded.Key,
      },
    });

    return {
      data: video,
    };
  });
}

// app.post("/video", async (req, res) => {
//   const file = await req.file();

//   if (!file) {
//     return res.status(400).send({ error: "Missing file input." });
//   }

//   const extension = path.extname(file.filename);

//   if (extension !== ".mp3") {
//     return res
//       .status(400)
//       .send({ error: "Invalid input type. Only MP3 accepted." });
//   }

//   const fileBaseName = path.basename(file.filename, extension);
//   const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`;

//   const params = {
//     Bucket: BUCKET_NAME,
//     Key: fileUploadName,
//     Body: file.file,
//     ACL: 'public-read' // if you want the file to be publicly accessible
//   };

//   try {
//     const uploaded = await s3.upload(params).promise();

//     const video = await prisma.video.create({
//       data: {
//         name: file.filename,
//         path: uploaded.Location,
//       },
//     });

//     return {
//       data: video,
//     };
//   } catch (error) {
//     console.log('Error occurred while trying to upload to S3 bucket', error);
//   }
// });
