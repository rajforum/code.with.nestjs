import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { User, UserSchema } from './model/user.schema';
import { Video, VideoSchema } from './model/video.schema';
import { VideoController } from './controller/video.controller';
import { UserController } from './controller/user.controller';
import { VideoSerivice } from './service/video.service';
import { UserService } from './service/user.service';
import { isAuthenticated } from './app.middleware';

// await mongoose.connect('mongodb://Cluster01322:T19xVX5Sc2hX@cluster01322.phriwtm.mongodb.net');
const secret = 's038-pwpppwpeok-dffMjfjriru44030423-edmmfvnvdmjrp4l4k';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://Cluster01322:T19xVX5Sc2hX@cluster01322.phriwtm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster01322'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema}]),
    JwtModule.register({
      secret,
      signOptions: { expiresIn: '2h' }
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './public',
        filename: (req, file, cb) => {
          const ext = file.mimetype.split('/')[1];
          cb(null, `${uuidv4()}-${Date.now()}.${ext}`)
        }
      })
    }),
  ],
  controllers: [AppController, VideoController, UserController],
  providers: [AppService, VideoSerivice, UserService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(isAuthenticated).exclude(
      { path: 'api/v1/video/:id', method: RequestMethod.GET }
    ).forRoutes(VideoController);
  }
}
