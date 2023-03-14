import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './../user/model/dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateJwt(user: Partial<LoginUserDto>) {
    return this.jwtService.signAsync({ user });
  }

  hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }

  validatePassword(password: string, storedPassword: string) {
    return bcrypt.compare(password, storedPassword);
  }
}

