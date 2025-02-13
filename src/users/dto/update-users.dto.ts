import { IsEmail, IsString, Length, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(4, 50, { message: 'Vui lòng nhập tên từ 4 đến 50 ký tự' })
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @Length(4, 100, { message: 'Vui lòng nhập email hợp lệ' })
  email: string;

  @IsOptional()
  @Length(6, 50, { message: 'Mật khẩu phải từ 6 đến 50 ký tự' })
  password: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  @IsString()
  updated_at: string;
}
