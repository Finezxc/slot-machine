import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RegisterOutput {
  @IsNumber()
  @IsNotEmpty()
  status: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}
