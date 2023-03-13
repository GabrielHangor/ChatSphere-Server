import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './model/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './model/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  findAll(options: IPaginationOptions) {
    options.limit = options.limit > 100 ? 100 : options.limit;
    return paginate<User>(this.userRepository, options);
  }

  async create(createUserDto: CreateUserDto) {
    const doesEmailExist = await this.checkIfEmailExists(createUserDto.email);

    if (doesEmailExist) {
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

  private async checkIfEmailExists(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  private hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }
}
