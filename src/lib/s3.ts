import "dotenv/config";
import S3 from "aws-sdk/clients/s3";
import fs from "fs";
import { Readable } from "stream";

const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_KEY;
const region = process.env.S3_BUCKET_region;
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

export const AWS_S3 = new S3({
  accessKeyId,
  secretAccessKey,
  region,
});

export const getS3Object = (key: string) => {
  const object = AWS_S3.getObject({
    Bucket: S3_BUCKET_NAME || "",
    Key: key,
  });

  return object;
};
