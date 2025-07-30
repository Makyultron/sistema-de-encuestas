import { IsString, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitAnswerDto {
  @IsNumber()
  questionId: number;

  @IsOptional()
  @IsString()
  textAnswer?: string; // Para preguntas abiertas

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  selectedOptions?: number[]; // Para preguntas cerradas
}

export class SubmitResponseDto {
  @IsOptional()
  @IsString()
  sessionId?: string; // ID de sesión del navegador

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers: SubmitAnswerDto[];
}
