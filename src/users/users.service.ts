import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUsersDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-users.dto';

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

  async updateUser(id: number, body: UpdateUserDto): Promise<any> {
    const userId = await this.getUserById(id);
    if (!userId) {
      return null;
    }
    return this.prisma.user.update({ where: { id }, data: body });
  }

  async deleteUser(id: number): Promise<any> {
    const userId = await this.getUserById(id);
    if (!userId) {
      return null;
    }
    return this.prisma.user.delete({ where: { id } });
  }
}
