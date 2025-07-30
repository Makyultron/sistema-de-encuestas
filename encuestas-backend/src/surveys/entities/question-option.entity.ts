import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('question_options')
export class QuestionOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column({ default: 0 })
  order: number;

  @ManyToOne('Question', 'options', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: any;

  @Column()
  questionId: number;
}
