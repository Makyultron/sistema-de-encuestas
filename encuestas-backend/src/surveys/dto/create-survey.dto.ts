import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsBoolean, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuestionOptionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsEnum(['open', 'single', 'multiple'])
  type: 'open' | 'single' | 'multiple';

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionOptionDto)
  options?: CreateQuestionOptionDto[];
}

export class CreateSurveyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  allowMultipleResponses?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
