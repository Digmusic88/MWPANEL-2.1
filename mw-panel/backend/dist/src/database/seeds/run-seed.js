"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
const dotenv_1 = require("dotenv");
const _01_educational_levels_seed_1 = require("./01-educational-levels.seed");
const _02_competencies_seed_1 = require("./02-competencies.seed");
const _03_areas_seed_1 = require("./03-areas.seed");
const _04_users_seed_1 = require("./04-users.seed");
const _05_academic_structure_seed_1 = require("./05-academic-structure.seed");
const _06_teachers_seed_1 = require("./06-teachers.seed");
const _07_evaluations_seed_1 = require("./07-evaluations.seed");
const _08_subject_assignments_seed_1 = require("./08-subject-assignments.seed");
const _09_communications_seed_1 = require("./09-communications.seed");
(0, dotenv_1.config)();
const configService = new config_1.ConfigService();
const AppDataSource = new typeorm_1.DataSource({
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
        await (0, _01_educational_levels_seed_1.seedEducationalLevels)(AppDataSource);
        console.log('');
        console.log('🎯 Creando competencias...');
        await (0, _02_competencies_seed_1.seedCompetencies)(AppDataSource);
        console.log('');
        console.log('📖 Creando áreas curriculares...');
        await (0, _03_areas_seed_1.seedAreas)(AppDataSource);
        console.log('');
        console.log('👥 Creando usuarios de prueba...');
        await (0, _04_users_seed_1.seedUsers)(AppDataSource);
        console.log('');
        console.log('🏫 Creando estructura académica...');
        await (0, _05_academic_structure_seed_1.seedAcademicStructure)(AppDataSource);
        console.log('');
        console.log('👨‍🏫 Creando profesores...');
        await (0, _06_teachers_seed_1.seedTeachers)(AppDataSource);
        console.log('');
        console.log('📝 Creando sistema de evaluaciones...');
        await (0, _07_evaluations_seed_1.seedEvaluations)(AppDataSource);
        console.log('');
        console.log('📚 Creando asignaciones de asignaturas...');
        await (0, _08_subject_assignments_seed_1.seedSubjectAssignments)(AppDataSource);
        console.log('');
        console.log('💬 Creando sistema de comunicaciones...');
        await (0, _09_communications_seed_1.seedCommunications)(AppDataSource);
        console.log('');
        console.log('🎉 ¡Semillas ejecutadas exitosamente!');
        console.log('\n📋 Usuarios de prueba creados:');
        console.log('  👨‍💼 Admin: admin@mwpanel.com / Admin123!');
        console.log('  👨‍🏫 Profesor: profesor@mwpanel.com / Profesor123!');
        console.log('  👨‍🎓 Estudiante: estudiante@mwpanel.com / Estudiante123!');
        console.log('  👨‍👩‍👧‍👦 Familia: familia@mwpanel.com / Familia123!');
        console.log('\n✨ El sistema está listo para usar');
    }
    catch (error) {
        console.error('❌ Error ejecutando las semillas:', error);
        process.exit(1);
    }
    finally {
        await AppDataSource.destroy();
    }
}
if (require.main === module) {
    runSeeds();
}
exports.default = runSeeds;
//# sourceMappingURL=run-seed.js.map