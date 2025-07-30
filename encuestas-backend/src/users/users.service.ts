import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ 
      where: { id },
      relations: ['surveys']
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ 
      where: { email } 
    });
  }

  async update(id: number, updateData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async getUserStats(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['surveys', 'surveys.responses']
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const totalSurveys = user.surveys.length;
    const activeSurveys = user.surveys.filter(survey => survey.isActive).length;
    const totalResponses = user.surveys.reduce((total, survey) => 
      total + (survey.responses ? survey.responses.length : 0), 0
    );

    const recentSurveys = user.surveys
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(survey => ({
        id: survey.id,
        title: survey.title,
        publicId: survey.publicId,
        isActive: survey.isActive,
        responseCount: survey.responses ? survey.responses.length : 0,
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
