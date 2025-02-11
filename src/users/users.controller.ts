import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUsersDto } from './dto/create-users.dto';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

  @Post()
  async createUser(@Body() body: CreateUsersDto) {
    const saltOrRounds = 10;
    const password = body.password;
    body.password = await bcrypt.hash(password, saltOrRounds);
    body.created_at = new Date().toISOString();
    body.updated_at = new Date().toISOString();

    return this.usersService.createUser(body);
  }
}
