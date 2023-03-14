import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './model/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './model/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { LoginUserDto } from './model/dto/login-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  findAll(options: IPaginationOptions) {
    options.limit = options.limit > 100 ? 100 : options.limit;
    return paginate<User>(this.userRepository, options);
  }

  async create(createUserDto: CreateUserDto) {
    const foundUser = await this.findByEmail(createUserDto.email);

    if (foundUser) {
      throw new HttpException(`Email ${createUserDto.email} already exists`, HttpStatus.CONFLICT);
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);

    const createdUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const { password, ...createdUserWithoutPassword } = await this.userRepository.save(createdUser);

    return createdUserWithoutPassword;
  }

  async login(loginUserDto: LoginUserDto) {
    const foundUser = await this.findByEmail(loginUserDto.email);

    if (!foundUser) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await this.validatePassword(loginUserDto.password, foundUser.password);

    if (!isPasswordValid) {
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
    }

    return true;
  }

  private findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'username', 'password'],
    });
  }

  private hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }

  private validatePassword(password: string, storedPassword: string) {
    return bcrypt.compare(password, storedPassword);
  }
}
