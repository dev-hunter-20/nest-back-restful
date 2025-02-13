import { Injectable, NotFoundException } from '@nestjs/common';
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

  async updateUser(id: number, body: Partial<UpdateUserDto>): Promise<any> {
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

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
