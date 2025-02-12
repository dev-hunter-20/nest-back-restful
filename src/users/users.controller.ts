import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UsePipes,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUsersDto } from './dto/create-users.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-users.dto';

@Controller('users')
@UsePipes(
  new ValidationPipe({
    transform: true,
    exceptionFactory: (validationErrors: ValidationError[] = []) => {
      return new BadRequestException(
        validationErrors.map((error) => ({
          field: error.property,
          error: Object.values(error.constraints).join(', '),
        })),
      );
    },
  }),
)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(@Res() res) {
    const users = await this.usersService.getUsers();
    return res.json({
      success: true,
      data: users,
      message: 'Users retrieved successfully',
    });
  }

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number, @Res() res) {
    const user = await this.usersService.getUserById(id);
    return res.json({
      success: true,
      data: user,
      message: 'User retrieved successfully',
    });
  }

  @Post()
  async createUser(@Body() body: CreateUsersDto, @Res() res) {
    const saltOrRounds = 10;
    const password = body.password;
    body.password = await bcrypt.hash(password, saltOrRounds);
    body.created_at = new Date().toISOString();
    body.updated_at = new Date().toISOString();

    const user = await this.usersService.createUser(body);

    return res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully',
    });
  }

  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
    @Res() res,
  ) {
    const saltOrRounds = 10;
    const password = body.password;
    body.password = await bcrypt.hash(password, saltOrRounds);
    body.updated_at = new Date().toISOString();

    const user = await this.usersService.updateUser(id, body);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User ${id} not found`,
      });
    }
    return res.json({
      success: true,
      data: user,
      message: 'User updated successfully',
    });
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number, @Res() res) {
    const user = await this.usersService.deleteUser(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User ${id} not found`,
      });
    }
    return res.json({
      success: true,
      data: user,
      message: 'User deleted successfully',
    });
  }
}
