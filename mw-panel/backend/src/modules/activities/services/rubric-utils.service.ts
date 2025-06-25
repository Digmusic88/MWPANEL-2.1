import { Injectable } from '@nestjs/common';
import { CreateRubricDto, CreateRubricCriterionDto, CreateRubricLevelDto, CreateRubricCellDto } from '../dto/create-rubric.dto';

@Injectable()
export class RubricUtilsService {
  
  /**
   * Genera colores automáticamente para los niveles de la rúbrica
   * Gradiente de rojo (#FF4C4C) a verde (#4CAF50)
   */
  generateLevelColors(levelCount: number): string[] {
    if (levelCount === 1) {
      return ['#4CAF50']; // Verde para un solo nivel
    }

    const colors: string[] = [];
    const startColor = { r: 255, g: 76, b: 76 }; // Rojo #FF4C4C
    const endColor = { r: 76, g: 175, b: 80 };   // Verde #4CAF50

    for (let i = 0; i < levelCount; i++) {
      const ratio = i / (levelCount - 1);
      
      const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
      const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
      const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);
      
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      colors.push(hex.toUpperCase());
    }

    return colors;
  }

  /**
   * Parsea una tabla en formato Markdown y la convierte en datos de rúbrica
   */
  parseMarkdownTable(markdownData: string): { criteria: CreateRubricCriterionDto[], levels: CreateRubricLevelDto[], cells: CreateRubricCellDto[] } {
    const lines = markdownData.trim().split('\n').map(line => line.trim());
    
    // Filtrar líneas vacías y separadores
    const dataLines = lines.filter(line => 
      line.length > 0 && 
      !line.match(/^\|[\s\-:]+\|$/) // Excluir líneas de separación como |---|---|
    );

    if (dataLines.length < 2) {
      throw new Error('Formato de tabla inválido. Se requiere al menos una fila de encabezados y una fila de datos.');
    }

    // Parsear encabezados (primera línea)
    const headerCells = this.parseTableRow(dataLines[0]);
    const criterionHeader = headerCells[0]; // Primera columna es para criterios
    const levelNames = headerCells.slice(1); // Resto son niveles

    if (levelNames.length === 0) {
      throw new Error('Se requiere al menos un nivel de desempeño.');
    }

    // Crear niveles
    const colors = this.generateLevelColors(levelNames.length);
    const levels: CreateRubricLevelDto[] = levelNames.map((name, index) => ({
      name: name.trim(),
      description: `Nivel ${index + 1}: ${name.trim()}`,
      order: index,
      scoreValue: index + 1, // Puntuación creciente
      color: colors[index],
    }));

    // Parsear filas de datos
    const criteria: CreateRubricCriterionDto[] = [];
    const cells: CreateRubricCellDto[] = [];
    const defaultWeight = 1 / (dataLines.length - 1); // Peso uniforme

    for (let i = 1; i < dataLines.length; i++) {
      const row = this.parseTableRow(dataLines[i]);
      
      if (row.length < 2) {
        continue; // Saltar filas incompletas
      }

      const criterionName = row[0].trim();
      const cellContents = row.slice(1);

      // Crear criterio
      const criterion: CreateRubricCriterionDto = {
        name: criterionName,
        description: `Criterio: ${criterionName}`,
        order: i - 1,
        weight: defaultWeight,
      };
      criteria.push(criterion);

      // Crear celdas para este criterio
      for (let j = 0; j < Math.min(cellContents.length, levels.length); j++) {
        const cell: CreateRubricCellDto = {
          criterionId: `criterion_${i - 1}`, // Placeholder que se resolverá en el servicio
          levelId: `level_${j}`, // Placeholder que se resolverá en el servicio
          content: cellContents[j].trim(),
        };
        cells.push(cell);
      }
    }

    return { criteria, levels, cells };
  }

  /**
   * Parsea una tabla en formato CSV
   */
  parseCSVTable(csvData: string): { criteria: CreateRubricCriterionDto[], levels: CreateRubricLevelDto[], cells: CreateRubricCellDto[] } {
    const lines = csvData.trim().split('\n').map(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('Formato CSV inválido. Se requiere al menos una fila de encabezados y una fila de datos.');
    }

    // Parsear encabezados
    const headers = this.parseCSVRow(lines[0]);
    const levelNames = headers.slice(1);

    if (levelNames.length === 0) {
      throw new Error('Se requiere al menos un nivel de desempeño.');
    }

    // Crear niveles
    const colors = this.generateLevelColors(levelNames.length);
    const levels: CreateRubricLevelDto[] = levelNames.map((name, index) => ({
      name: name.trim(),
      description: `Nivel ${index + 1}: ${name.trim()}`,
      order: index,
      scoreValue: index + 1,
      color: colors[index],
    }));

    // Parsear filas de datos
    const criteria: CreateRubricCriterionDto[] = [];
    const cells: CreateRubricCellDto[] = [];
    const defaultWeight = 1 / (lines.length - 1);

    for (let i = 1; i < lines.length; i++) {
      const row = this.parseCSVRow(lines[i]);
      
      if (row.length < 2) {
        continue;
      }

      const criterionName = row[0].trim();
      const cellContents = row.slice(1);

      const criterion: CreateRubricCriterionDto = {
        name: criterionName,
        description: `Criterio: ${criterionName}`,
        order: i - 1,
        weight: defaultWeight,
      };
      criteria.push(criterion);

      for (let j = 0; j < Math.min(cellContents.length, levels.length); j++) {
        const cell: CreateRubricCellDto = {
          criterionId: `criterion_${i - 1}`,
          levelId: `level_${j}`,
          content: cellContents[j].trim(),
        };
        cells.push(cell);
      }
    }

    return { criteria, levels, cells };
  }

  /**
   * Parsea una fila de tabla Markdown
   */
  private parseTableRow(row: string): string[] {
    // Remover | del inicio y final, luego dividir por |
    const cleanRow = row.replace(/^\|/, '').replace(/\|$/, '');
    return cleanRow.split('|').map(cell => cell.trim());
  }

  /**
   * Parsea una fila CSV teniendo en cuenta comillas y comas dentro de campos
   */
  private parseCSVRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Calcula la puntuación total de una evaluación con rúbrica
   */
  calculateRubricScore(
    criterionAssessments: Array<{
      criterion: { weight: number };
      selectedLevel: { scoreValue: number };
    }>,
    maxScore: number = 100
  ): { totalScore: number; maxPossibleScore: number; percentage: number } {
    let weightedSum = 0;
    let maxWeightedSum = 0;
    
    // Encontrar el valor máximo de nivel
    const maxLevelValue = Math.max(...criterionAssessments.map(ca => ca.selectedLevel.scoreValue));
    
    for (const assessment of criterionAssessments) {
      const weight = assessment.criterion.weight;
      const levelValue = assessment.selectedLevel.scoreValue;
      
      weightedSum += weight * levelValue;
      maxWeightedSum += weight * maxLevelValue;
    }
    
    const percentage = maxWeightedSum > 0 ? (weightedSum / maxWeightedSum) * 100 : 0;
    const totalScore = (percentage / 100) * maxScore;
    const maxPossibleScore = maxScore;
    
    return {
      totalScore: Math.round(totalScore * 100) / 100,
      maxPossibleScore,
      percentage: Math.round(percentage * 100) / 100,
    };
  }

  /**
   * Valida que los pesos de los criterios sumen 1 (100%)
   */
  validateCriteriaWeights(criteria: CreateRubricCriterionDto[]): boolean {
    const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
    return Math.abs(totalWeight - 1) < 0.01; // Tolerancia de 1%
  }

  /**
   * Normaliza los pesos para que sumen exactamente 1
   */
  normalizeCriteriaWeights(criteria: CreateRubricCriterionDto[]): CreateRubricCriterionDto[] {
    const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
    
    if (totalWeight === 0) {
      // Si todos los pesos son 0, asignar peso uniforme
      const uniformWeight = 1 / criteria.length;
      return criteria.map(criterion => ({ ...criterion, weight: uniformWeight }));
    }
    
    // Normalizar para que sumen 1
    return criteria.map(criterion => ({
      ...criterion,
      weight: criterion.weight / totalWeight,
    }));
  }
}