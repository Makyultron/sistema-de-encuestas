import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // Necesitamos el UsersModule
import { PassportModule } from '@nestjs/passport'; //
import { JwtModule } from '@nestjs/jwt'; //
import { ConfigModule, ConfigService } from '@nestjs/config'; // Para leer el JWT_SECRET del .env
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule, // El AuthModule necesita acceder a los servicios de Users para validar credenciales.
    PassportModule,
    JwtModule.registerAsync({ // Usa registerAsync para leer variables de entorno.
      imports: [ConfigModule], // Importa ConfigService para que JwtModule pueda usarlo.
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key', // Obtiene el secreto de las variables de entorno.
        signOptions: { expiresIn: '60m' }, // Opciones del token: expira en 60 minutos.
      }),
      inject: [ConfigService], // Inyecta ConfigService en el useFactory.
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}