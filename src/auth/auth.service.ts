import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compare, hash } from 'bcrypt';
import { User } from '@prisma/client';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.userService.getUserByEmail(email);
      const authenticated = await compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (e) {
      throw new UnauthorizedException('Credentials are not valid');
    }
  }

  async login(user: User, response: Response) {
    const expireAccessToken = new Date();
    expireAccessToken.setMilliseconds(
      expireAccessToken.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const expireRefreshToken = new Date();
    expireRefreshToken.setMilliseconds(
      expireRefreshToken.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const tokenPayload: TokenPayload = {
      userId: user.id,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION_MS')}ms`,
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRATION_MS')}ms`,
    });

    // Lưu refreshToken vào database
    await this.userService.updateUser(user.id, {
      refreshToken: await hash(refreshToken, 10),
    });

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expireAccessToken,
    });
    response.cookie('RefreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expireRefreshToken,
    });
  }

  async verifyUserRefreshToken(refreshToken: string, userId: number) {
    try {
      const user = await this.userService.getUserById(userId);
      const authenticated = await compare(refreshToken, user.refreshToken);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      throw new UnauthorizedException('Refresh token is not valid.');
    }
  }

  async logout(userId: number, response: Response) {
    await this.userService.updateUser(userId, { refreshToken: null });
    response.clearCookie('Authentication');
    response.clearCookie('RefreshToken');
  }

  async refreshToken(user: User, refreshToken: string, response: Response) {
    // Kiểm tra refresh token hợp lệ
    const validUser = await this.verifyUserRefreshToken(refreshToken, user.id);
    if (!validUser) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Tạo token mới
    const tokenPayload: TokenPayload = { userId: user.id };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION_MS')}ms`,
    });

    const newRefreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRATION_MS')}ms`,
    });

    // Cập nhật refresh token trong database
    await this.userService.updateUser(user.id, {
      refreshToken: await hash(newRefreshToken, 10),
    });

    // Đặt cookie mới
    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
    });

    response.cookie('RefreshToken', newRefreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
    });

    return { accessToken, refreshToken: newRefreshToken };
  }
}
