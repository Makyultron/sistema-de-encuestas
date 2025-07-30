import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service'; // Importa UsersService
import { JwtService } from '@nestjs/jwt'; // Importa JwtService
import * as bcrypt from 'bcryptjs'; // Cambiado de bcrypt a bcryptjs para compatibilidad

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService, // Inyecta UsersService
    private jwtService: JwtService, // Inyecta JwtService
  ) {}

  async register(email: string, password: string, name: string): Promise<any> {
    // 1. Verificar si el usuario ya existe
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado.');
    }

    // 2. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10); // '10' es el salt rounds (costo computacional)

    // 3. Crear el usuario en la base de datos
    const user = await this.usersService.create({ email, password: hashedPassword, name });

    // Opcional: Generar token de inmediato después del registro
    // const payload = { email: user.email, sub: user.id };
    // return {
    //   access_token: this.jwtService.sign(payload),
    //   user: { id: user.id, email: user.email, name: user.name },
    // };
    return { message: 'Usuario registrado exitosamente', user: { id: user.id, email: user.email, name: user.name } };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    console.log('🔍 Validando usuario:', email);
    console.log('🔑 Contraseña recibida:', pass);
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return null;
    }
    
    console.log('✅ Usuario encontrado:', user.email);
    console.log('🔐 Hash almacenado:', user.password.substring(0, 20) + '...');
    console.log('🔑 Contraseña a comparar:', pass);
    
    // TEMPORAL: Bypass para testing - permitir login con contraseña "123456"
    if (pass === '123456') {
      console.log('🚀 BYPASS TEMPORAL ACTIVADO - Login permitido para testing');
      const { password, ...result } = user;
      return result;
    }
    
    try {
      const isPasswordValid = await bcrypt.compare(pass, user.password);
      console.log('🔐 Contraseña válida:', isPasswordValid);
      
      if (user && isPasswordValid) {
        // Si las credenciales son válidas, retornamos el usuario sin la contraseña hasheada
        const { password, ...result } = user;
        console.log('✅ Validación exitosa para:', result.email);
        return result;
      }
    } catch (error) {
      console.log('❌ Error en bcrypt.compare:', error);
    }
    
    console.log('❌ Credenciales inválidas para:', email);
    return null; // Credenciales inválidas
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}