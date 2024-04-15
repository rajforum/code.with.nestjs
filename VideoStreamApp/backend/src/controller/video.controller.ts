import { Body, Controller, Delete, Get, Param, Post, Put, Res, Req, UploadedFile, UseInterceptors, HttpStatus, Query, UploadedFiles } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { response } from "express";
import { Video } from "src/model/video.schema";
import { VideoSerivice } from "src/service/video.service";

@Controller('/api/v1/video')
export class VideoController {
    constructor(
        private readonly videoService: VideoSerivice
    ) {}

    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'video', maxCount: 1},
        { name: 'cover', maxCount: 1}
    ]))
    async createBook(
        @Res() response, 
        @Req() request, 
        @Body() video: Video,
        @UploadedFiles() files: { video?: Express.Multer.File[], cover?: Express.Multer.File[] }
    ) {
        const requestBody = {
            createdBy: await request.user,
            title: video.title,
            video: files.video[0].filename,
            coverImage: files.cover[0].filename
        }

        const newVideo = await this.videoService.createVideo(requestBody);

        return response.status(HttpStatus.CREATED).json({ newVideo });
    }

    @Get()
    async read(): Promise<Object> {
        return await this.videoService.readVideo();
    }

    @Get('/:id')
    async stream(@Param('id') id, @Res() response, @Req() request) {
        return this.videoService.streamVideo(id, response, request);
    }

    @Put('/:id')
    async update(@Param('id')id, @Res() response, @Body() video: Video) {
        const updatedVideo = await this.videoService.updateVideo(id, video);
        return response.status(HttpStatus.OK).json(updatedVideo);
    }

    @Delete('/:id')
    async delete(@Res() response, @Param('id') id) {
        await this.videoService.deleteVideo(id);
        return response.status(HttpStatus.OK).json({ user: null });
    }
}