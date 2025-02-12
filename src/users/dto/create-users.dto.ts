import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUsersDto {
  @IsString()
  @Length(4, 50, { message: 'Vui lòng nhập tên từ 4 ký tự' })
  name: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @Length(4, 100, { message: 'Vui lòng nhập email hợp lệ' })
  email: string;

  @Length(6, 50, {
    message: 'Mật khẩu phải từ 6 ký tự',
  })
  password: string;

  @IsString()
  created_at: string;

  @IsString()
  updated_at: string;
}
