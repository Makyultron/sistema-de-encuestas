import { PartialType } from '@nestjs/mapped-types';
import { CreateSurveyDto } from './create-survey.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateSurveyDto extends PartialType(CreateSurveyDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
