import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsUniqueProductName } from 'src/common/validator/isUniqueProduct';

class RatingInput {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  count?: number;
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsUniqueProductName()
  name!: string;

  @ApiProperty()
  @IsNumber()
  price!: number;

  @ApiPropertyOptional({ type: RatingInput })
  @IsOptional()
  @ValidateNested()
  @Type(() => RatingInput)
  rating?: RatingInput;
}
