import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

function toIds(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  return value.split(',').map((id) => id.trim());
}

export class SearchVideosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  per_page?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @Transform(({ value }) => toIds(value))
  @IsArray()
  @IsUUID('4', { each: true })
  categories_id?: string[];

  @IsOptional()
  @Transform(({ value }) => toIds(value))
  @IsArray()
  @IsUUID('4', { each: true })
  genres_id?: string[];

  @IsOptional()
  @Transform(({ value }) => toIds(value))
  @IsArray()
  @IsUUID('4', { each: true })
  cast_members_id?: string[];
}
