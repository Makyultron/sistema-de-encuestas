// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users') // Marca la clase como una entidad de base de datos.
export class User {
  @PrimaryGeneratedColumn() // Define 'id' como la columna de clave primaria generada automáticamente.
  id: number;

  @Column({ unique: true }) // Define 'email' como una columna única.
  email: string;

  @Column() // Define 'password' como una columna.
  password: string;

  @Column() // Define 'name' como una columna.
  name: string;

  @OneToMany('Survey', 'creator')
  surveys: any[];

  @CreateDateColumn() // Define 'createdAt' como una columna que guarda automáticamente la fecha de creación.
  createdAt: Date;

  @UpdateDateColumn() // Define 'updatedAt' como una columna que guarda automáticamente la fecha de actualización.
  updatedAt: Date;
}