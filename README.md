# 📊 Sistema de Encuestas

Sistema completo de encuestas con **Angular** + **NestJS** + **MySQL** que permite crear encuestas, participación anónima y visualización de resultados con gráficos.

## ✨ Características Principales

- 🔐 **Autenticación JWT** para creadores de encuestas
- 📝 **Tres tipos de preguntas**: Abiertas, única respuesta, múltiple respuesta
- 🌐 **Participación anónima** mediante enlaces públicos
- 🚫 **Anti-duplicación** por cookies e IP
- 📊 **Visualización de resultados** con Chart.js
- 📱 **Responsive Design** con Angular Material
- 🌙 **Tema claro/oscuro**
- 📈 **Dashboard** con estadísticas
- 📄 **Exportación CSV** de resultados

## 🏗️ Arquitectura

```
├── encuestas-frontend/    # Angular 17 + Angular Material
├── encuestas-backend/     # NestJS + TypeORM + MySQL
└── docker-compose.yml     # MySQL en Docker
```

## 🚀 Instalación Rápida

### Prerrequisitos
- **Node.js** 18+ 
- **Docker Desktop**
- **Angular CLI**: `npm install -g @angular/cli`

### 1. Clonar el repositorio
```bash
git clone <tu-repo-url>
cd sistema-de-encuestas
```

### 2. Configurar base de datos
```bash
# Iniciar MySQL con Docker
docker-compose up -d
```

### 3. Configurar backend
```bash
cd encuestas-backend

# Instalar dependencias
npm install

# Crear archivo de entorno
cp .env.example .env

# Iniciar backend
npm run start:dev
```

### 4. Configurar frontend
```bash
cd ../encuestas-frontend

# Instalar dependencias
npm install

# Iniciar frontend
ng serve
```

### 5. Acceder a la aplicación
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000

## ⚙️ Configuración de Entorno

### Backend (.env)
```env
# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=user
DB_PASSWORD=password
DB_NAME=encuestas

# JWT Secret (cambiar por una clave segura)
JWT_SECRET=tu-clave-secreta-jwt-muy-segura-aqui
```

## 🗄️ Base de Datos

### Estructura Principal
- **users**: Usuarios registrados (creadores)
- **surveys**: Encuestas con enlaces públicos únicos
- **questions**: Preguntas (abiertas/cerradas)
- **question_options**: Opciones para preguntas cerradas
- **responses**: Sesiones de respuesta anónimas
- **answers**: Respuestas individuales

### Diagrama ER
Puedes visualizar la estructura completa en [dbdiagram.io](https://dbdiagram.io) con el código DBML incluido en la documentación.

## 🔒 Sistema Anti-Duplicación

### Doble Validación
1. **Frontend**: Cookie `survey_{publicId}_responded` (30 días)
2. **Backend**: Validación por `sessionId` + `ipAddress`

### Flujo
```
Usuario → Enlace público → Verificar cookie → Mostrar formulario → 
Enviar respuesta → Validar duplicación → Guardar → Crear cookie
```

## 🎯 Uso del Sistema

### Para Creadores
1. **Registrarse** en la aplicación
2. **Crear encuestas** con diferentes tipos de preguntas
3. **Compartir enlace público** generado automáticamente
4. **Ver resultados** con gráficos y estadísticas
5. **Exportar datos** en formato CSV

### Para Participantes
1. **Acceder al enlace** público (sin registro)
2. **Responder encuesta** una sola vez
3. **Ver confirmación** de envío

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Angular 17** - Framework principal
- **Angular Material** - Componentes UI
- **Chart.js** - Gráficos interactivos
- **RxJS** - Programación reactiva
- **TypeScript** - Tipado estático

### Backend
- **NestJS** - Framework Node.js
- **TypeORM** - ORM para base de datos
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación
- **bcryptjs** - Hashing de contraseñas

### Infraestructura
- **Docker** - Contenedorización de MySQL
- **Docker Compose** - Orquestación

## 📝 Scripts Disponibles

### Backend
```bash
npm run start:dev    # Desarrollo con hot reload
npm run build        # Compilar para producción
npm run start:prod   # Ejecutar en producción
```

### Frontend
```bash
ng serve            # Desarrollo (puerto 4200)
ng build            # Compilar para producción
ng build --prod     # Compilar optimizado
```

## 🔧 Comandos Docker

```bash
# Iniciar base de datos
docker-compose up -d

# Ver logs de MySQL
docker logs encuesta-db

# Detener servicios
docker-compose down

# Reiniciar base de datos
docker restart encuesta-db
```

## 🚀 Despliegue en Producción

### Variables de Entorno Importantes
```env
NODE_ENV=production
JWT_SECRET=clave-super-segura-para-produccion
DB_HOST=tu-servidor-mysql
DB_PASSWORD=password-seguro
```

### Consideraciones
- Cambiar `JWT_SECRET` por una clave segura
- Configurar HTTPS en producción
- Usar base de datos MySQL externa
- Configurar CORS para tu dominio

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema:

1. Revisa que Docker esté corriendo
2. Verifica las variables de entorno
3. Consulta los logs del backend
4. Abre un issue en GitHub

## 🎉 Características Avanzadas

- **Temas personalizables** (claro/oscuro)
- **Validación en tiempo real** de formularios
- **Responsive design** para móviles
- **Internacionalización** lista para múltiples idiomas
- **API RESTful** bien documentada
- **Arquitectura escalable** y modular

---

**Desarrollado con ❤️ usando Angular + NestJS**
