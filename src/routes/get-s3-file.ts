import { FastifyInstance } from "fastify";
import {z} from 'zod'
import { getS3Object } from "../lib/s3";




export const getS3FileRoute = (app: FastifyInstance) => {
    const schema = z.object({
        key: z.string()
    })

    app.post('/get-file/:key', async (req, res) => {
        const {key} = schema.parse(req.params)

        const object = getS3Object(key).pipeline

    })

}