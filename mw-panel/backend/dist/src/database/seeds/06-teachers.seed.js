"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedTeachers = void 0;
const user_entity_1 = require("../../modules/users/entities/user.entity");
const teacher_entity_1 = require("../../modules/teachers/entities/teacher.entity");
const seedTeachers = async (dataSource) => {
    const userRepository = dataSource.getRepository(user_entity_1.User);
    const teacherRepository = dataSource.getRepository(teacher_entity_1.Teacher);
    console.log('🎯 Seeding Teachers...');
    const teacherUsers = await userRepository.find({
        where: { role: user_entity_1.UserRole.TEACHER },
        relations: ['profile'],
    });
    if (teacherUsers.length === 0) {
        console.log('⚠️ No teacher users found. Running users seed first...');
        return;
    }
    const teacherData = [
        {
            email: 'profesor@mwpanel.com',
            employeeNumber: 'EMP001',
            specialties: ['Matemáticas', 'Física'],
            department: 'Departamento de Ciencias',
            position: 'Profesor Titular',
            education: 'Licenciado en Matemáticas, Máster en Física',
            hireDate: '2020-09-01',
        },
        {
            email: 'ana.lopez@mwpanel.com',
            employeeNumber: 'EMP002',
            specialties: ['Lengua y Literatura', 'Historia'],
            department: 'Departamento de Humanidades',
            position: 'Profesora Titular',
            education: 'Licenciada en Filología Hispánica',
            hireDate: '2019-09-01',
        },
        {
            email: 'carlos.ruiz@mwpanel.com',
            employeeNumber: 'EMP003',
            specialties: ['Educación Física', 'Deportes'],
            department: 'Departamento de Educación Física',
            position: 'Profesor de Educación Física',
            education: 'Licenciado en Ciencias del Deporte',
            hireDate: '2021-09-01',
        },
    ];
    for (const data of teacherData) {
        const user = teacherUsers.find(u => u.email === data.email);
        if (!user) {
            console.log(`⚠️ User not found for email: ${data.email}`);
            continue;
        }
        const existingTeacher = await teacherRepository.findOne({
            where: { user: { id: user.id } },
        });
        if (!existingTeacher) {
            if (user.profile) {
                user.profile.department = data.department;
                user.profile.position = data.position;
                user.profile.education = data.education;
                user.profile.hireDate = new Date(data.hireDate);
                await dataSource.getRepository('UserProfile').save(user.profile);
            }
            const teacher = teacherRepository.create({
                employeeNumber: data.employeeNumber,
                specialties: data.specialties,
                user,
            });
            await teacherRepository.save(teacher);
            console.log(`✓ Profesor creado: ${user.profile?.firstName} ${user.profile?.lastName} (${data.employeeNumber})`);
        }
        else {
            console.log(`→ Profesor ya existe: ${user.profile?.firstName} ${user.profile?.lastName}`);
        }
    }
};
exports.seedTeachers = seedTeachers;
//# sourceMappingURL=06-teachers.seed.js.map