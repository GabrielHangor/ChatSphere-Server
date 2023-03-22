import { NestMiddleware, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { AuthService } from './../auth.service';
import { UserService } from './../../user/user.service';
import { RequestModel } from 'src/user/model/user.types';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

  async use(req: RequestModel, res: Response, next: NextFunction) {
    try {
      const bearerToken = req.headers['authorization'].split(' ')[1];
      const decodedToken = await this.authService.verifyJwt(bearerToken);

      const user = await this.userService.findOne(decodedToken.user.id);

      if (user) {
        req.user = user;
        next();
      }
    } catch (e) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
