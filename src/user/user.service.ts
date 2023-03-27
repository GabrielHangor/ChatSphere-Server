import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './model/user.entity';
import { Repository, Like } from 'typeorm';
import { CreateUserDto } from './model/dto/create-user.dto';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { LoginUserDto } from './model/dto/login-user.dto';
import { AuthService } from './../auth/auth.service';
import { JWT_LIFESPAN_MS } from './../auth/auth.constants';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authService: AuthService
  ) {}

  findAll(options: IPaginationOptions) {
    options.limit = options.limit > 100 ? 100 : options.limit;
    return paginate<User>(this.userRepository, options);
  }

  async create(createUserDto: CreateUserDto) {
    const foundUserByEmail = await this.findByEmail(createUserDto.email);
    const foundUserByUsername = await this.findByUserName(createUserDto.username);

    if (foundUserByEmail) {
      throw new HttpException(`Email ${createUserDto.email} already exists`, HttpStatus.CONFLICT);
    }

    if (foundUserByUsername) {
      throw new HttpException(`Username ${createUserDto.username} already exists`, HttpStatus.CONFLICT);
    }

    const hashedPassword = await this.authService.hashPassword(createUserDto.password);

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

    const isPasswordValid = await this.authService.validatePassword(
      loginUserDto.password,
      foundUser.password
    );

    if (!isPasswordValid) {
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
    }

    const { password, ...userWithoutPassword } = foundUser;
    const jwt = await this.authService.generateJwt(userWithoutPassword);

    return {
      accessToken: jwt,
      expiresAt: Date.now() + JWT_LIFESPAN_MS,
      tokenType: 'JWT',
      ...userWithoutPassword,
    };
  }

  public findOne(id: number) {
    return this.userRepository.findOneOrFail({ where: { id } });
  }

  public findAllByUserName(username: string, id: number) {
    return this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.username) LIKE :username', { username: `%${username.toLowerCase()}%` })
      .andWhere('user.id <> :id', { id: id })
      .orderBy('LOWER(user.username)', 'ASC')
      .getMany();
  }

  private findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'username', 'password'],
    });
  }

  private findByUserName(username: string) {
    return this.userRepository.findOne({
      where: { username },
      select: ['id', 'email', 'username', 'password'],
    });
  }
}
