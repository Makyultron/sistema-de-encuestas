import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Survey } from './entities/survey.entity';
import { Question } from './entities/question.entity';
import { QuestionOption } from './entities/question-option.entity';
import { Response } from './entities/response.entity';
import { Answer } from './entities/answer.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(QuestionOption)
    private questionOptionRepository: Repository<QuestionOption>,
    @InjectRepository(Response)
    private responseRepository: Repository<Response>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
  ) {}

  async create(createSurveyDto: CreateSurveyDto, creatorId: number): Promise<Survey> {
    const survey = new Survey();
    survey.title = createSurveyDto.title;
    survey.description = createSurveyDto.description || '';
    survey.publicId = uuidv4();
    survey.allowMultipleResponses = createSurveyDto.allowMultipleResponses || false;
    survey.creatorId = creatorId;

    const savedSurvey = await this.surveyRepository.save(survey);

    // Crear preguntas
    for (let i = 0; i < createSurveyDto.questions.length; i++) {
      const questionDto = createSurveyDto.questions[i];
      const question = new Question();
      question.text = questionDto.text;
      question.type = questionDto.type;
      question.isRequired = questionDto.isRequired ?? true;
      question.order = questionDto.order ?? i;
      question.surveyId = savedSurvey.id;

      const savedQuestion = await this.questionRepository.save(question);

      // Crear opciones para preguntas cerradas
      if (questionDto.options && questionDto.options.length > 0) {
        for (let j = 0; j < questionDto.options.length; j++) {
          const optionDto = questionDto.options[j];
          const option = new QuestionOption();
          option.text = optionDto.text;
          option.order = optionDto.order ?? j;
          option.questionId = savedQuestion.id;

          await this.questionOptionRepository.save(option);
        }
      }
    }

    return this.findOne(savedSurvey.id, creatorId);
  }

  async findAll(creatorId: number): Promise<Survey[]> {
    return this.surveyRepository.find({
      where: { creatorId },
      relations: ['questions', 'questions.options', 'responses'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number, creatorId: number): Promise<Survey> {
    const survey = await this.surveyRepository.findOne({
      where: { id, creatorId },
      relations: ['questions', 'questions.options', 'responses']
    });

    if (!survey) {
      throw new NotFoundException('Encuesta no encontrada');
    }

    return survey;
  }

  async findByPublicId(publicId: string): Promise<Survey> {
    const survey = await this.surveyRepository.findOne({
      where: { publicId, isActive: true },
      relations: ['questions', 'questions.options']
    });

    if (!survey) {
      throw new NotFoundException('Encuesta no encontrada o inactiva');
    }

    return survey;
  }

  async update(id: number, updateSurveyDto: UpdateSurveyDto, creatorId: number): Promise<Survey> {
    const survey = await this.findOne(id, creatorId);
    
    Object.assign(survey, updateSurveyDto);
    await this.surveyRepository.save(survey);

    return this.findOne(id, creatorId);
  }

  async remove(id: number, creatorId: number): Promise<void> {
    const survey = await this.findOne(id, creatorId);
    await this.surveyRepository.remove(survey);
  }

  async submitResponse(publicId: string, submitResponseDto: SubmitResponseDto, ipAddress: string, userAgent: string): Promise<void> {
    const survey = await this.findByPublicId(publicId);

    // Verificar duplicados si no se permiten múltiples respuestas
    if (!survey.allowMultipleResponses) {
      const existingResponse = await this.responseRepository.findOne({
        where: [
          { surveyId: survey.id, sessionId: submitResponseDto.sessionId },
          { surveyId: survey.id, ipAddress }
        ]
      });

      if (existingResponse) {
        throw new BadRequestException('Ya has respondido esta encuesta');
      }
    }

    // Crear respuesta
    const response = new Response();
    response.surveyId = survey.id;
    response.sessionId = submitResponseDto.sessionId || '';
    response.ipAddress = ipAddress;
    response.userAgent = userAgent;

    const savedResponse = await this.responseRepository.save(response);

    // Crear respuestas individuales
    for (const answerDto of submitResponseDto.answers) {
      const answer = new Answer();
      answer.responseId = savedResponse.id;
      answer.questionId = answerDto.questionId;
      answer.textAnswer = answerDto.textAnswer || '';
      answer.selectedOptions = answerDto.selectedOptions || [];

      await this.answerRepository.save(answer);
    }
  }

  async checkDuplicate(publicId: string, sessionId?: string, ipAddress?: string): Promise<boolean> {
    const survey = await this.findByPublicId(publicId);

    if (survey.allowMultipleResponses) {
      return false; // Se permiten múltiples respuestas
    }

    const existingResponse = await this.responseRepository.findOne({
      where: [
        { surveyId: survey.id, sessionId },
        { surveyId: survey.id, ipAddress }
      ]
    });

    return !!existingResponse;
  }

  async getSurveyResults(id: number, creatorId: number): Promise<any> {
    const survey = await this.findOne(id, creatorId);

    const results = {
      survey: {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        isActive: survey.isActive,
        questions: survey.questions
      },
      totalResponses: survey.responses.length,
      statistics: {}
    };

    // Calcular estadísticas por pregunta
    for (const question of survey.questions) {
      const answers = await this.answerRepository.find({
        where: { questionId: question.id },
        relations: ['response']
      });

      if (question.type === 'OPEN') {
        // Para preguntas abiertas, solo contar respuestas
        results.statistics[question.id] = {
          totalResponses: answers.length,
          answers: answers.map(a => a.textAnswer).filter(Boolean)
        };
      } else {
        // Para preguntas cerradas, contar por opción
        const optionCounts = {};
        let totalAnswers = 0;

        for (const answer of answers) {
          if (answer.selectedOptions && answer.selectedOptions.length > 0) {
            totalAnswers++;
            for (const optionId of answer.selectedOptions) {
              const option = question.options.find(o => o.id === optionId);
              if (option) {
                optionCounts[option.text] = (optionCounts[option.text] || 0) + 1;
              }
            }
          }
        }

        results.statistics[question.id] = {
          totalResponses: totalAnswers,
          answers: optionCounts
        };
      }
    }

    return results;
  }

  async getUserStats(creatorId: number): Promise<any> {
    const surveys = await this.surveyRepository.find({
      where: { creatorId },
      relations: ['responses']
    });

    const totalSurveys = surveys.length;
    const activeSurveys = surveys.filter(s => s.isActive).length;
    const totalResponses = surveys.reduce((sum, survey) => sum + survey.responses.length, 0);

    const recentSurveys = surveys
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map(survey => ({
        id: survey.id,
        title: survey.title,
        isActive: survey.isActive,
        responseCount: survey.responses.length,
        createdAt: survey.createdAt
      }));

    return {
      totalSurveys,
      activeSurveys,
      totalResponses,
      recentSurveys
    };
  }
}
