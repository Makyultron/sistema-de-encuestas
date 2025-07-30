import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  textAnswer: string; // Para preguntas abiertas

  @Column({ type: 'json', nullable: true })
  selectedOptions: number[]; // IDs de opciones seleccionadas para preguntas cerradas

  @ManyToOne('Response', 'answers', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'responseId' })
  response: any;

  @Column()
  responseId: number;

  @ManyToOne('Question', 'answers', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: any;

  @Column()
  questionId: number;
}
