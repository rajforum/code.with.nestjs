import { Body, Controller, HttpStatus, Post, Req, Res, Get } from '@nestjs/common';
import { User } from 'src/model/user.schema';
import { JwtService } from '@nestjs/jwt'
import { UserService } from 'src/service/user.service';

@Controller('/api/v1/user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private jwtService: JwtService
    ) {}

    @Get()
    async getUsers(@Res() response) {
        const result = await this.userService.getAll();
        return response.status(HttpStatus.OK).json(result)
    }
    
    @Post('/signup')
    async Signup(@Res() response, @Body() user: User) {
        const newUser = await this.userService.signup(user);
        return response.status(HttpStatus.CREATED).json({ newUser });
    }

    @Post('/signin')
    async Signin(@Res() response, @Body() user: User) {
        const token = await this.userService.signin(user, this.jwtService);
        return response.status(HttpStatus.OK).json(token);
    }
}