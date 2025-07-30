# Sistema de Encuestas - Backend NestJS

API REST robusta y escalable para el sistema de encuestas, construida con NestJS, TypeORM y MySQL.

## Características

### Autenticación y Seguridad
- **JWT Authentication**: Autenticación segura con tokens JWT
- **Password Hashing**: Encriptación de contraseñas con bcrypt
- **Route Guards**: Protección de rutas con guards personalizados
- **CORS**: Configuración de CORS para frontend

### Gestión de Encuestas
- **CRUD Completo**: Crear, leer, actualizar y eliminar encuestas
- **Preguntas Flexibles**: Soporte para preguntas abiertas y cerradas
- **Opciones Múltiples**: Preguntas de opción única y múltiple
- **Enlaces Públicos**: Compartir encuestas mediante UUID únicos
- **Estado de Encuestas**: Activar/desactivar encuestas

### Respuestas Anónimas
- **Participación Sin Registro**: Respuestas completamente anónimas
- **Prevención de Duplicados**: Control por IP y cookies de sesión
- **Validación de Datos**: Validación robusta con class-validator
- **Almacenamiento Seguro**: Respuestas almacenadas de forma segura

### Estadísticas y Reportes
- **Análisis en Tiempo Real**: Estadísticas actualizadas automáticamente
- **Métricas del Usuario**: Dashboard con métricas personales
- **Resultados Detallados**: Análisis por pregunta y opción
- **Exportación de Datos**: APIs para exportar resultados

## Stack Tecnológico

- **Framework**: NestJS 11+
- **Base de Datos**: MySQL con TypeORM
- **Autenticación**: JWT + Passport
- **Validación**: class-validator + class-transformer
- **Encriptación**: bcryptjs
- **Contenedores**: Docker & Docker Compose

## Estructura del Proyecto

```
src/
├── auth/                       # Módulo de autenticación
│   ├── dto/                   # DTOs para login/register
│   ├── auth.controller.ts     # Controlador de autenticación
│   ├── auth.service.ts        # Servicio de autenticación
│   ├── auth.module.ts         # Módulo de autenticación
│   ├── jwt-auth.guard.ts      # Guard JWT
│   └── jwt.strategy.ts        # Estrategia JWT
├── users/                      # Módulo de usuarios
│   ├── entities/              # Entidad User
│   ├── dto/                   # DTOs de usuarios
│   ├── users.controller.ts    # Controlador de usuarios
│   ├── users.service.ts       # Servicio de usuarios
│   └── users.module.ts        # Módulo de usuarios
├── surveys/                    # Módulo de encuestas
│   ├── entities/              # Entidades del dominio
│   │   ├── survey.entity.ts   # Encuesta principal
│   │   ├── question.entity.ts # Preguntas
│   │   ├── question-option.entity.ts # Opciones
│   │   ├── response.entity.ts # Respuestas
│   │   └── answer.entity.ts   # Respuestas individuales
│   ├── dto/                   # DTOs para APIs
│   ├── surveys.controller.ts  # Controlador principal
│   ├── surveys.service.ts     # Lógica de negocio
│   └── surveys.module.ts      # Módulo de encuestas
├── app.module.ts              # Módulo principal
└── main.ts                    # Punto de entrada
```

## Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- Docker y Docker Compose
- MySQL (si no usas Docker)

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd encuestas-backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear archivo `.env`:
   ```env
   # Base de datos
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=user
   DB_PASSWORD=password
   DB_NAME=encuestas

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here

   # Aplicación
   PORT=3000
   ```

4. **Ejecutar con Docker (Recomendado)**
   ```bash
   docker-compose up -d
   ```

5. **O ejecutar manualmente**
   ```bash
   # Desarrollo
   npm run start:dev

   # Producción
   npm run build
   npm run start:prod
   ```

## API Endpoints

### Autenticación
```http
POST /auth/register
POST /auth/login
```

### Encuestas (Protegidas)
```http
GET    /surveys              # Obtener encuestas del usuario
POST   /surveys              # Crear nueva encuesta
GET    /surveys/:id          # Obtener encuesta específica
PATCH  /surveys/:id          # Actualizar encuesta
DELETE /surveys/:id          # Eliminar encuesta
GET    /surveys/:id/results  # Obtener resultados
```

### Encuestas Públicas (Sin autenticación)
```http
GET  /surveys/public/:publicId                    # Obtener encuesta pública
POST /surveys/public/:publicId/responses          # Enviar respuesta
GET  /surveys/public/:publicId/check-duplicate    # Verificar duplicados
```

### Estadísticas de Usuario
```http
GET /users/stats             # Estadísticas del usuario
```

## Modelos de Datos

### Survey (Encuesta)
```typescript
{
  id: number;
  title: string;
  description: string;
  publicId: string;           // UUID para acceso público
  isActive: boolean;
  allowMultipleResponses: boolean;
  creatorId: number;
  questions: Question[];
  responses: Response[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Question (Pregunta)
```typescript
{
  id: number;
  text: string;
  type: 'open' | 'single' | 'multiple';
  isRequired: boolean;
  order: number;
  surveyId: number;
  options: QuestionOption[];  // Solo para preguntas cerradas
  answers: Answer[];
}
```

### Response (Respuesta)
```typescript
{
  id: number;
  sessionId: string;          // Cookie de sesión
  ipAddress: string;          // IP para prevenir duplicados
  userAgent: string;
  surveyId: number;
  answers: Answer[];
  submittedAt: Date;
}
```

## Ejemplos de Uso

### Crear Encuesta
```typescript
POST /surveys
{
  "title": "Encuesta de Satisfacción",
  "description": "Queremos conocer tu opinión",
  "questions": [
    {
      "text": "¿Cómo calificarías nuestro servicio?",
      "type": "single",
      "isRequired": true,
      "options": [
        { "text": "Excelente" },
        { "text": "Bueno" },
        { "text": "Regular" },
        { "text": "Malo" }
      ]
    },
    {
      "text": "¿Qué podríamos mejorar?",
      "type": "open",
      "isRequired": false
    }
  ]
}
```

### Enviar Respuesta
```typescript
POST /surveys/public/{publicId}/responses
{
  "sessionId": "browser-session-id",
  "answers": [
    {
      "questionId": 1,
      "selectedOptions": [2]  // ID de la opción seleccionada
    },
    {
      "questionId": 2,
      "textAnswer": "Mejorar la velocidad de respuesta"
    }
  ]
}
```

## Seguridad

### Autenticación JWT
- Tokens con expiración configurable (60 minutos por defecto)
- Secreto JWT almacenado en variables de entorno
- Refresh tokens para sesiones largas

### Prevención de Duplicados
- Validación por IP address
- Control por cookies de sesión
- Configuración por encuesta (permitir/no permitir duplicados)

### Validación de Datos
- DTOs con class-validator para todas las entradas
- Sanitización automática de datos
- Validación de tipos y formatos

## Docker

### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
      - DB_PORT=3306
      - DB_USERNAME=user
      - DB_PASSWORD=password
      - DB_NAME=encuestas
      - JWT_SECRET=your-secret-key
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=encuestas
      - MYSQL_USER=user
      - MYSQL_PASSWORD=password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## Testing

### Ejecutar Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Estructura de Tests
- **Unit Tests**: Cada servicio y controlador
- **Integration Tests**: Flujos completos de API
- **E2E Tests**: Casos de uso end-to-end

## Deployment

### Variables de Entorno de Producción
```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PORT=3306
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=encuestas_prod
JWT_SECRET=your-super-secure-jwt-secret
PORT=3000
```

### Build de Producción
```bash
npm run build
npm run start:prod
```

## Monitoreo y Logs

### Logs Estructurados
- Logs de aplicación con NestJS Logger
- Logs de base de datos con TypeORM
- Logs de errores y excepciones

### Métricas
- Tiempo de respuesta de APIs
- Número de encuestas creadas
- Respuestas por minuto
- Errores de validación

## Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.

## Soporte

Para problemas o preguntas:
1. Revisar logs de la aplicación
2. Verificar configuración de base de datos
3. Comprobar variables de entorno
4. Crear issue con detalles específicos

---

**Desarrollado con ❤️ usando NestJS y TypeORM**
