import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SurveysModule } from './surveys/surveys.module';

// Importar entidades explícitamente
import { User } from './users/entities/user.entity';
import { Survey } from './surveys/entities/survey.entity';
import { Question } from './surveys/entities/question.entity';
import { QuestionOption } from './surveys/entities/question-option.entity';
import { Response } from './surveys/entities/response.entity';
import { Answer } from './surveys/entities/answer.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', 
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost', 
      port: parseInt(process.env.DB_PORT || '3306', 10), 
      username: process.env.DB_USERNAME || 'user', 
      password: process.env.DB_PASSWORD || 'password', 
      database: process.env.DB_NAME || 'encuestas', 
      entities: [User, Survey, Question, QuestionOption, Response, Answer],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    SurveysModule,
  ],
  controllers: [], 
  providers: [], 
})
export class AppModule {}