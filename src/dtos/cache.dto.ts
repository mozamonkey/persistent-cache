import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCacheDto {
  @IsString()
  @IsNotEmpty()
  public key: string;
  @IsString()
  @IsNotEmpty()
  public value: string;
  @IsNumber()
  public ttl?: number;
}

export class UpdateExpireDto {
  @IsNumber()
  public ttl: number;
}
