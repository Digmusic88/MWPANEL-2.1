import { DataSource } from 'typeorm';
import { User, UserRole } from '../../modules/users/entities/user.entity';
import { UserProfile } from '../../modules/users/entities/user-profile.entity';

export const seedUsers = async (dataSource: DataSource): Promise<void> => {
  const userRepository = dataSource.getRepository(User);
  const userProfileRepository = dataSource.getRepository(UserProfile);

  const users = [
    // Admin user
    {
      email: 'admin@mwpanel.com',
      password: 'Admin123!',
      role: UserRole.ADMIN,
      profile: {
        firstName: 'Administrador',
        lastName: 'del Sistema',
        phone: '+34 600 000 001',
        dni: '00000001A',
      },
    },
    // Teacher users
    {
      email: 'profesor@mwpanel.com',
      password: 'Profesor123!',
      role: UserRole.TEACHER,
      profile: {
        firstName: 'María',
        lastName: 'García López',
        phone: '+34 600 000 002',
        dni: '12345678B',
      },
    },
    {
      email: 'ana.lopez@mwpanel.com',
      password: 'Profesor123!',
      role: UserRole.TEACHER,
      profile: {
        firstName: 'Ana',
        lastName: 'López Martín',
        phone: '+34 600 000 003',
        dni: '23456789C',
      },
    },
    {
      email: 'carlos.ruiz@mwpanel.com',
      password: 'Profesor123!',
      role: UserRole.TEACHER,
      profile: {
        firstName: 'Carlos',
        lastName: 'Ruiz Sánchez',
        phone: '+34 600 000 004',
        dni: '34567890D',
      },
    },
    // Student users
    {
      email: 'estudiante@mwpanel.com',
      password: 'Estudiante123!',
      role: UserRole.STUDENT,
      profile: {
        firstName: 'Ana',
        lastName: 'García López',
        phone: '+34 600 000 005',
        dni: '45678901E',
      },
    },
    {
      email: 'juan.perez@mwpanel.com',
      password: 'Estudiante123!',
      role: UserRole.STUDENT,
      profile: {
        firstName: 'Juan',
        lastName: 'Pérez González',
        phone: '+34 600 000 006',
        dni: '56789012F',
      },
    },
    {
      email: 'sofia.martinez@mwpanel.com',
      password: 'Estudiante123!',
      role: UserRole.STUDENT,
      profile: {
        firstName: 'Sofía',
        lastName: 'Martínez Rodríguez',
        phone: '+34 600 000 007',
        dni: '67890123G',
      },
    },
    {
      email: 'pablo.fernandez@mwpanel.com',
      password: 'Estudiante123!',
      role: UserRole.STUDENT,
      profile: {
        firstName: 'Pablo',
        lastName: 'Fernández Díaz',
        phone: '+34 600 000 008',
        dni: '78901234H',
      },
    },
    // Family users
    {
      email: 'familia@mwpanel.com',
      password: 'Familia123!',
      role: UserRole.FAMILY,
      profile: {
        firstName: 'Carmen',
        lastName: 'López Martín',
        phone: '+34 600 000 009',
        dni: '89012345I',
      },
    },
    {
      email: 'padre.garcia@mwpanel.com',
      password: 'Familia123!',
      role: UserRole.FAMILY,
      profile: {
        firstName: 'Miguel',
        lastName: 'García Ruiz',
        phone: '+34 600 000 010',
        dni: '90123456J',
      },
    },
    {
      email: 'madre.perez@mwpanel.com',
      password: 'Familia123!',
      role: UserRole.FAMILY,
      profile: {
        firstName: 'Elena',
        lastName: 'Pérez Vega',
        phone: '+34 600 000 011',
        dni: '01234567K',
      },
    },
  ];

  for (const userData of users) {
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (!existingUser) {
      // Create user
      const user = userRepository.create({
        email: userData.email,
        password: userData.password,
        role: userData.role,
      });

      const savedUser = await userRepository.save(user);

      // Create user profile
      const profile = userProfileRepository.create({
        ...userData.profile,
        user: savedUser,
      });

      await userProfileRepository.save(profile);

      console.log(`✓ Usuario creado: ${userData.email} (${userData.role})`);
    } else {
      console.log(`→ Usuario ya existe: ${userData.email}`);
    }
  }
};