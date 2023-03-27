import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { Request } from '@nestjs/common';
import { User } from './../../user/model/user.entity';

export type TPage = Pick<IPaginationOptions, 'page' | 'limit'>;

export interface CustomReq extends Request {
  user: User;
}
