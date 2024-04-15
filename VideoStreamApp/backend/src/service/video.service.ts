import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Video, VideoDocument } from "src/model/video.schema";
import { createReadStream, statSync } from 'fs';
import { join } from 'path';
import { Request, Response } from 'express';

@Injectable()
export class VideoSerivice {
    constructor(
        @InjectModel(Video.name) private videoModel: Model<VideoDocument>
    ) {}

    async createVideo(video: Object): Promise<Video> {
        const newVideo = new this.videoModel(video);
        return newVideo.save();
    }

    async readVideo(id?: string): Promise<any> {
        if (id) {
            return this.videoModel.findOne({ _id: id }).populate('createdBy').exec();
        }

        return this.videoModel.find().populate('createdBy').exec();
    }

    async streamVideo(id: string, response: Response, request: Request) {
        try {
            const data = await this.videoModel.findOne({ _id: id });

            if (!data) {
                throw new NotFoundException(null, "Video Not Found");
            }

            const range = request.headers.range;

            if (range) {
                const { video } = data;
                const videoPath = statSync(join(process.cwd(), `./public/${video}`));
                const CHUNK_SIZE = 1 * 1e6;
                const start = Number(range.replace(/\D/g, ''));
                const end = Math.min(start + CHUNK_SIZE + videoPath.size - 1);
                const videoLength = end - start + 1;
                
                response.status(206);
                response.header({
                    'Content-Range': `bytes ${start}-${end}/${videoPath.size}`,
                    'Accept-Range': 'bytes',
                    'Content-Length': videoLength,
                    'Content-Type': 'video/mp4'
                });

                const videoStream = createReadStream(join(process.cwd(), `./public/${video}`));
                videoStream.pipe(response);
            } else {
                throw new NotFoundException(null, 'Range Not Found');
            }
        } catch (e) {
            console.error(e);
        }
    }

    async updateVideo(id: string, video: Video): Promise<Video> {
        return await this.videoModel.findByIdAndUpdate(id, video, { new: true });
    }

    async deleteVideo(id: string) {
        return await this.videoModel.findByIdAndDelete(id);
    }
}