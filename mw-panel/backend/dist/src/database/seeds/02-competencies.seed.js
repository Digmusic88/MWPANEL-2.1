"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCompetencies = void 0;
const educational_level_entity_1 = require("../../modules/students/entities/educational-level.entity");
const competency_entity_1 = require("../../modules/competencies/entities/competency.entity");
const seedCompetencies = async (dataSource) => {
    const educationalLevelRepository = dataSource.getRepository(educational_level_entity_1.EducationalLevel);
    const competencyRepository = dataSource.getRepository(competency_entity_1.Competency);
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
    const competenciasClaves = [
        {
            code: 'CCL',
            name: 'Competencia en Comunicación Lingüística',
            description: 'Habilidad para expresar e interpretar conceptos, pensamientos, sentimientos, hechos y opiniones de forma oral y escrita.',
        },
        {
            code: 'CP',
            name: 'Competencia Plurilingüe',
            description: 'Habilidad para utilizar distintas lenguas de forma apropiada y eficaz para el aprendizaje y la comunicación.',
        },
        {
            code: 'STEM',
            name: 'Competencia Matemática y Competencia en Ciencia, Tecnología e Ingeniería',
            description: 'Habilidad para desarrollar y aplicar el pensamiento matemático para resolver diversos problemas en situaciones cotidianas.',
        },
        {
            code: 'CD',
            name: 'Competencia Digital',
            description: 'Uso seguro, saludable, sostenible, crítico y responsable de las tecnologías digitales para el aprendizaje, trabajo y participación.',
        },
        {
            code: 'CPSAA',
            name: 'Competencia Personal, Social y de Aprender a Aprender',
            description: 'Habilidad para reflexionar sobre uno mismo, para gestionar el tiempo y la información eficazmente, para colaborar con otros.',
        },
        {
            code: 'CC',
            name: 'Competencia Ciudadana',
            description: 'Habilidad para actuar como ciudadanos responsables y participar plenamente en la vida social y cívica.',
        },
        {
            code: 'CE',
            name: 'Competencia Emprendedora',
            description: 'Habilidad para actuar con creatividad e iniciativa para llevar las ideas a la acción.',
        },
        {
            code: 'CCEC',
            name: 'Competencia en Conciencia y Expresiones Culturales',
            description: 'Comprensión y respeto de la forma en que las ideas y el significado se expresan creativamente.',
        },
    ];
    const competenciasInfantil = [
        {
            code: 'CA1',
            name: 'Crecimiento en Armonía - Desarrollo Personal',
            description: 'Progresar en el conocimiento y control de su cuerpo desarrollando equilibrio, percepción sensorial y coordinación.',
        },
        {
            code: 'CA2',
            name: 'Crecimiento en Armonía - Desarrollo Emocional',
            description: 'Reconocer, manifestar y regular progresivamente sus emociones expresando necesidades y sentimientos.',
        },
        {
            code: 'CA3',
            name: 'Crecimiento en Armonía - Hábitos Saludables',
            description: 'Adoptar modelos, normas y hábitos desarrollando confianza para promover un estilo de vida saludable.',
        },
        {
            code: 'DE1',
            name: 'Descubrimiento del Entorno - Interacción Sociocultural',
            description: 'Identificar las características de materiales, objetos y colecciones estableciendo relaciones entre ellos.',
        },
        {
            code: 'DE2',
            name: 'Descubrimiento del Entorno - Experimentación',
            description: 'Desarrollar los procedimientos del método científico identificando y resolviendo problemas.',
        },
        {
            code: 'DE3',
            name: 'Descubrimiento del Entorno - Pensamiento Matemático',
            description: 'Reconocer elementos y establecer relaciones lógico-matemáticas entre ellos.',
        },
        {
            code: 'CR1',
            name: 'Comunicación y Representación - Comunicación Verbal',
            description: 'Manifestar interés por interactuar en situaciones cotidianas a través del lenguaje oral.',
        },
        {
            code: 'CR2',
            name: 'Comunicación y Representación - Comunicación Escrita',
            description: 'Interpretar y comprender mensajes y representaciones apoyándose en conocimientos previos.',
        },
        {
            code: 'CR3',
            name: 'Comunicación y Representación - Expresión Artística',
            description: 'Producir mensajes expresando ideas, sentimientos y emociones a través del lenguaje artístico.',
        },
    ];
    for (const competencyData of competenciasInfantil) {
        const existingCompetency = await competencyRepository.findOne({
            where: { code: competencyData.code, educationalLevel: { id: infantil.id } },
        });
        if (!existingCompetency) {
            const competency = competencyRepository.create({
                ...competencyData,
                educationalLevel: infantil,
            });
            await competencyRepository.save(competency);
            console.log(`✓ Competencia Infantil creada: ${competencyData.name}`);
        }
        else {
            console.log(`→ Competencia Infantil ya existe: ${competencyData.name}`);
        }
    }
    for (const competencyData of competenciasClaves) {
        const existingCompetency = await competencyRepository.findOne({
            where: { code: competencyData.code, educationalLevel: { id: primaria.id } },
        });
        if (!existingCompetency) {
            const competency = competencyRepository.create({
                ...competencyData,
                educationalLevel: primaria,
            });
            await competencyRepository.save(competency);
            console.log(`✓ Competencia Primaria creada: ${competencyData.name}`);
        }
        else {
            console.log(`→ Competencia Primaria ya existe: ${competencyData.name}`);
        }
    }
    for (const competencyData of competenciasClaves) {
        const existingCompetency = await competencyRepository.findOne({
            where: { code: competencyData.code, educationalLevel: { id: secundaria.id } },
        });
        if (!existingCompetency) {
            const competency = competencyRepository.create({
                ...competencyData,
                educationalLevel: secundaria,
            });
            await competencyRepository.save(competency);
            console.log(`✓ Competencia Secundaria creada: ${competencyData.name}`);
        }
        else {
            console.log(`→ Competencia Secundaria ya existe: ${competencyData.name}`);
        }
    }
};
exports.seedCompetencies = seedCompetencies;
//# sourceMappingURL=02-competencies.seed.js.map