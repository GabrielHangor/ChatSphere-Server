import { LoginUserDto } from './login-user.dto';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto extends LoginUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
