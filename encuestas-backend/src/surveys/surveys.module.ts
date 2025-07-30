import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveysService } from './surveys.service';
import { SurveysController, UserStatsController } from './surveys.controller';
import { Survey } from './entities/survey.entity';
import { Question } from './entities/question.entity';
import { QuestionOption } from './entities/question-option.entity';
import { Response } from './entities/response.entity';
import { Answer } from './entities/answer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Survey,
      Question,
      QuestionOption,
      Response,
      Answer
    ])
  ],
  controllers: [SurveysController, UserStatsController],
  providers: [SurveysService],
  exports: [SurveysService]
})
export class SurveysModule {}
