import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUsersDto } from './dto/create-users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  getUsers(): Promise<any> {
    return this.prisma.user.findMany();
  }

  getUserById(id: number): Promise<any> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  createUser(body: CreateUsersDto): Promise<any> {
    return this.prisma.user.create({ data: body });
  }
}
