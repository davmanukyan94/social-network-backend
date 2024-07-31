import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class SearchUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  @Transform(({ value }) => parseInt(value, 10))
  age?: number;

  @IsOptional()
  @IsString()
  page?: number;

  @IsOptional()
  @IsString()
  limit?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
}
