import { IPaginationOptions } from 'nestjs-typeorm-paginate';

export type TPage = Pick<IPaginationOptions, 'page' | 'limit'>;
