import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { seedEducationalLevels } from './01-educational-levels.seed';
import { seedCompetencies } from './02-competencies.seed';
import { seedAreas } from './03-areas.seed';
import { seedUsers } from './04-users.seed';
import { seedAcademicStructure } from './05-academic-structure.seed';
import { seedTeachers } from './06-teachers.seed';
import { seedEvaluations } from './07-evaluations.seed';
import { seedSubjectAssignments } from './08-subject-assignments.seed';
import { seedCommunications } from './09-communications.seed';

// Load environment variables
config();

const configService = new ConfigService();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'mwpanel',
  password: process.env.DB_PASSWORD || 'changeme-strong-password',
  database: process.env.DB_NAME || 'mwpanel',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: false,
});

async function runSeeds() {
  try {
    console.log('🌱 Iniciando semillas de la base de datos...\n');

    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida\n');

    console.log('📚 Creando niveles educativos...');
    await seedEducationalLevels(AppDataSource);
    console.log('');

    console.log('🎯 Creando competencias...');
    await seedCompetencies(AppDataSource);
    console.log('');

    console.log('📖 Creando áreas curriculares...');
    await seedAreas(AppDataSource);
    console.log('');

    console.log('👥 Creando usuarios de prueba...');
    await seedUsers(AppDataSource);
    console.log('');

    console.log('🏫 Creando estructura académica...');
    await seedAcademicStructure(AppDataSource);
    console.log('');

    console.log('👨‍🏫 Creando profesores...');
    await seedTeachers(AppDataSource);
    console.log('');

    console.log('📝 Creando sistema de evaluaciones...');
    await seedEvaluations(AppDataSource);
    console.log('');

    console.log('📚 Creando asignaciones de asignaturas...');
    await seedSubjectAssignments(AppDataSource);
    console.log('');

    console.log('💬 Creando sistema de comunicaciones...');
    await seedCommunications(AppDataSource);
    console.log('');

    console.log('🎉 ¡Semillas ejecutadas exitosamente!');
    console.log('\n📋 Usuarios de prueba creados:');
    console.log('  👨‍💼 Admin: admin@mwpanel.com / Admin123!');
    console.log('  👨‍🏫 Profesor: profesor@mwpanel.com / Profesor123!');
    console.log('  👨‍🎓 Estudiante: estudiante@mwpanel.com / Estudiante123!');
    console.log('  👨‍👩‍👧‍👦 Familia: familia@mwpanel.com / Familia123!');
    console.log('\n✨ El sistema está listo para usar');

  } catch (error) {
    console.error('❌ Error ejecutando las semillas:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

// Execute if run directly
if (require.main === module) {
  runSeeds();
}

export default runSeeds;