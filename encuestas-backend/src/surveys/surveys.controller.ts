import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request, 
  Query,
  Ip,
  Headers
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';

@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  // Rutas protegidas para creadores de encuestas
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createSurveyDto: CreateSurveyDto, @Request() req) {
    return this.surveysService.create(createSurveyDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    return this.surveysService.findAll(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.surveysService.findOne(+id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSurveyDto: UpdateSurveyDto, @Request() req) {
    return this.surveysService.update(+id, updateSurveyDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.surveysService.remove(+id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/results')
  getSurveyResults(@Param('id') id: string, @Request() req) {
    return this.surveysService.getSurveyResults(+id, req.user.userId);
  }

  // Rutas públicas para participación anónima
  @Get('public/:publicId')
  findByPublicId(@Param('publicId') publicId: string) {
    return this.surveysService.findByPublicId(publicId);
  }

  @Post('public/:publicId/responses')
  submitResponse(
    @Param('publicId') publicId: string,
    @Body() submitResponseDto: SubmitResponseDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string
  ) {
    return this.surveysService.submitResponse(publicId, submitResponseDto, ip, userAgent);
  }

  @Get('public/:publicId/check-duplicate')
  checkDuplicate(
    @Param('publicId') publicId: string,
    @Query('sessionId') sessionId?: string,
    @Ip() ip?: string
  ) {
    return this.surveysService.checkDuplicate(publicId, sessionId, ip);
  }
}

// Controlador separado para estadísticas de usuario
@Controller('users')
export class UserStatsController {
  constructor(private readonly surveysService: SurveysService) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getUserStats(@Request() req) {
    return this.surveysService.getUserStats(req.user.userId);
  }
}
