import { IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  ciphertext!: string;
}
