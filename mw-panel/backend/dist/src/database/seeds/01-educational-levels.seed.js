"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedEducationalLevels = void 0;
const educational_level_entity_1 = require("../../modules/students/entities/educational-level.entity");
const seedEducationalLevels = async (dataSource) => {
    const educationalLevelRepository = dataSource.getRepository(educational_level_entity_1.EducationalLevel);
    const levels = [
        {
            name: 'Educación Infantil',
            code: educational_level_entity_1.EducationalLevelCode.INFANTIL,
            description: 'Etapa educativa de 0 a 6 años que atiende a niñas y niños desde el nacimiento hasta los seis años con la finalidad de contribuir a su desarrollo físico, afectivo, social, cognitivo y artístico.',
        },
        {
            name: 'Educación Primaria',
            code: educational_level_entity_1.EducationalLevelCode.PRIMARIA,
            description: 'Etapa educativa obligatoria de 6 a 12 años que comprende seis cursos académicos organizados en tres ciclos de dos años cada uno.',
        },
        {
            name: 'Educación Secundaria Obligatoria',
            code: educational_level_entity_1.EducationalLevelCode.SECUNDARIA,
            description: 'Etapa educativa obligatoria de 12 a 16 años que comprende cuatro cursos académicos organizados en dos ciclos.',
        },
    ];
    for (const levelData of levels) {
        const existingLevel = await educationalLevelRepository.findOne({
            where: { code: levelData.code },
        });
        if (!existingLevel) {
            const level = educationalLevelRepository.create(levelData);
            await educationalLevelRepository.save(level);
            console.log(`✓ Nivel educativo creado: ${levelData.name}`);
        }
        else {
            console.log(`→ Nivel educativo ya existe: ${levelData.name}`);
        }
    }
};
exports.seedEducationalLevels = seedEducationalLevels;
//# sourceMappingURL=01-educational-levels.seed.js.map