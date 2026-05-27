import { IsString, IsOptional } from 'class-validator';

export class JoinChatDto {
  @IsString()
  @IsOptional()
  encryptedVocabulary?: string;
}
