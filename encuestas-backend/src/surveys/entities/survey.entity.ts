import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('surveys')
export class Survey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ unique: true })
  publicId: string; // UUID para acceso público

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  allowMultipleResponses: boolean;

  @ManyToOne('User', 'surveys')
  @JoinColumn({ name: 'creatorId' })
  creator: any;

  @Column()
  creatorId: number;

  @OneToMany('Question', 'survey', { cascade: true })
  questions: any[];

  @OneToMany('Response', 'survey')
  responses: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generatePublicId() {
    this.publicId = uuidv4();
  }
}
