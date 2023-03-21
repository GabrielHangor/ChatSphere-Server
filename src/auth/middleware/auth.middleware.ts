import { NestMiddleware, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from './../auth.service';
import { UserService } from './../../user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const bearerToken: string = req.headers['authorization'].split(' ')[1];
      const decodedToken = await this.authService.verifyJwt(bearerToken);

      const user = await this.userService.findOne(decodedToken.user.id);

      if (user) next();
    } catch (e) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
