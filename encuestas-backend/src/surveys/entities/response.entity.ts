import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity('responses')
export class Response {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  sessionId: string; // Para identificar respuestas por cookie/sesión

  @Column({ nullable: true })
  ipAddress: string; // Para prevenir duplicados por IP

  @Column({ nullable: true })
  userAgent: string; // Información adicional del navegador

  @ManyToOne('Survey', 'responses', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'surveyId' })
  survey: any;

  @Column()
  surveyId: number;

  @OneToMany('Answer', 'response', { cascade: true })
  answers: any[];

  @CreateDateColumn()
  submittedAt: Date;
}
