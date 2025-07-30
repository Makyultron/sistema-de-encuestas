import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  text: string;

  @Column({
    type: 'enum',
    enum: ['open', 'single', 'multiple'],
    default: 'single'
  })
  type: 'open' | 'single' | 'multiple';

  @Column({ default: true })
  isRequired: boolean;

  @Column({ default: 0 })
  order: number; // Para ordenar las preguntas

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne('Survey', 'questions', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'surveyId' })
  survey: any;

  @Column()
  surveyId: number;

  @OneToMany('QuestionOption', 'question', { cascade: true })
  options: any[]; // Solo para preguntas cerradas

  @OneToMany('Answer', 'question')
  answers: any[];
}
