"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAreas = void 0;
const educational_level_entity_1 = require("../../modules/students/entities/educational-level.entity");
const area_entity_1 = require("../../modules/competencies/entities/area.entity");
const seedAreas = async (dataSource) => {
    const educationalLevelRepository = dataSource.getRepository(educational_level_entity_1.EducationalLevel);
    const areaRepository = dataSource.getRepository(area_entity_1.Area);
    const infantil = await educationalLevelRepository.findOne({
        where: { code: educational_level_entity_1.EducationalLevelCode.INFANTIL },
    });
    const primaria = await educationalLevelRepository.findOne({
        where: { code: educational_level_entity_1.EducationalLevelCode.PRIMARIA },
    });
    const secundaria = await educationalLevelRepository.findOne({
        where: { code: educational_level_entity_1.EducationalLevelCode.SECUNDARIA },
    });
    if (!infantil || !primaria || !secundaria) {
        throw new Error('Educational levels must be created first');
    }
    const areasInfantil = [
        {
            name: 'Crecimiento en Armonía',
            code: 'CA',
            description: 'Área que aborda el desarrollo físico, emocional y social del niño',
        },
        {
            name: 'Descubrimiento y Exploración del Entorno',
            code: 'DE',
            description: 'Área que fomenta la curiosidad, el pensamiento científico y matemático',
        },
        {
            name: 'Comunicación y Representación de la Realidad',
            code: 'CR',
            description: 'Área que desarrolla los diferentes lenguajes y formas de comunicación',
        },
    ];
    const areasPrimaria = [
        {
            name: 'Lengua Castellana y Literatura',
            code: 'LCL',
            description: 'Desarrollo de la competencia comunicativa en lengua castellana',
        },
        {
            name: 'Matemáticas',
            code: 'MAT',
            description: 'Desarrollo del pensamiento matemático y resolución de problemas',
        },
        {
            name: 'Conocimiento del Medio Natural, Social y Cultural',
            code: 'CMNSC',
            description: 'Comprensión del entorno natural, social y cultural',
        },
        {
            name: 'Lengua Extranjera (Inglés)',
            code: 'ING',
            description: 'Desarrollo de la competencia comunicativa en lengua inglesa',
        },
        {
            name: 'Educación Artística',
            code: 'EAR',
            description: 'Desarrollo de la expresión y apreciación artística',
        },
        {
            name: 'Educación Física',
            code: 'EF',
            description: 'Desarrollo de las capacidades físicas y hábitos saludables',
        },
        {
            name: 'Religión/Valores Sociales y Cívicos',
            code: 'REL',
            description: 'Formación en valores y dimensión espiritual',
        },
    ];
    const areasSecundaria = [
        {
            name: 'Lengua Castellana y Literatura',
            code: 'LCL',
            description: 'Desarrollo avanzado de la competencia comunicativa',
        },
        {
            name: 'Matemáticas',
            code: 'MAT',
            description: 'Matemáticas académicas y aplicadas',
        },
        {
            name: 'Primera Lengua Extranjera (Inglés)',
            code: 'ING',
            description: 'Competencia comunicativa avanzada en inglés',
        },
        {
            name: 'Geografía e Historia',
            code: 'GH',
            description: 'Comprensión del espacio geográfico y el tiempo histórico',
        },
        {
            name: 'Biología y Geología',
            code: 'BG',
            description: 'Estudio de los seres vivos y la Tierra',
        },
        {
            name: 'Física y Química',
            code: 'FQ',
            description: 'Fundamentos de la física y la química',
        },
        {
            name: 'Educación Física',
            code: 'EF',
            description: 'Desarrollo integral de la persona a través del movimiento',
        },
        {
            name: 'Religión/Valores Éticos',
            code: 'REL',
            description: 'Formación ética y moral',
        },
        {
            name: 'Tecnología y Digitalización',
            code: 'TD',
            description: 'Competencia digital y tecnológica',
        },
        {
            name: 'Educación Plástica, Visual y Audiovisual',
            code: 'EPVA',
            description: 'Expresión artística y visual',
        },
        {
            name: 'Música',
            code: 'MUS',
            description: 'Educación musical y expresión sonora',
        },
    ];
    for (const areaData of areasInfantil) {
        const existingArea = await areaRepository.findOne({
            where: { code: areaData.code, educationalLevel: { id: infantil.id } },
        });
        if (!existingArea) {
            const area = areaRepository.create({
                ...areaData,
                educationalLevel: infantil,
            });
            await areaRepository.save(area);
            console.log(`✓ Área Infantil creada: ${areaData.name}`);
        }
        else {
            console.log(`→ Área Infantil ya existe: ${areaData.name}`);
        }
    }
    for (const areaData of areasPrimaria) {
        const existingArea = await areaRepository.findOne({
            where: { code: areaData.code, educationalLevel: { id: primaria.id } },
        });
        if (!existingArea) {
            const area = areaRepository.create({
                ...areaData,
                educationalLevel: primaria,
            });
            await areaRepository.save(area);
            console.log(`✓ Área Primaria creada: ${areaData.name}`);
        }
        else {
            console.log(`→ Área Primaria ya existe: ${areaData.name}`);
        }
    }
    for (const areaData of areasSecundaria) {
        const existingArea = await areaRepository.findOne({
            where: { code: areaData.code, educationalLevel: { id: secundaria.id } },
        });
        if (!existingArea) {
            const area = areaRepository.create({
                ...areaData,
                educationalLevel: secundaria,
            });
            await areaRepository.save(area);
            console.log(`✓ Área Secundaria creada: ${areaData.name}`);
        }
        else {
            console.log(`→ Área Secundaria ya existe: ${areaData.name}`);
        }
    }
};
exports.seedAreas = seedAreas;
//# sourceMappingURL=03-areas.seed.js.map