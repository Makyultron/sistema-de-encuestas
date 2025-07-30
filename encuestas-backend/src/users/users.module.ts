import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; //
import { User } from './entities/user.entity'; //

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Registra la entidad User para este módulo
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // ¡IMPORTANTE! Exporta UsersService para que AuthModule pueda usarlo.
})
export class UsersModule {}