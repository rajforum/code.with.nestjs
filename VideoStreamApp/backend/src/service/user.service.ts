import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from "src/model/user.schema";
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    async signup(user: User): Promise<User> {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(user.password, salt);

        const reqBody = {
            fullname: user.fullname,
            email: user.email,
            password: hash
        }
        const newUser = new this.userModel(reqBody);
        
        return newUser.save();
    }

    async signin(user: User, jwt: JwtService): Promise<any> {
        const dbUser = await this.getOne(user.email);

        if (dbUser) {
            if (bcrypt.compare(user.password, dbUser.password)) {
                return {
                    token: jwt.sign({ email: user.email })
                }
            }

            return new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
        }

        return new HttpException('Incorrect username or password', HttpStatus.UNAUTHORIZED);
    }

    async getOne(email: string): Promise<User> {
        return await this.userModel.findOne({ email }).exec();
    }
    async getAll() {
        return await this.userModel.find().exec();
    }
}