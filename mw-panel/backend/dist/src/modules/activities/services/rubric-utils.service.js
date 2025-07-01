"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RubricUtilsService = void 0;
const common_1 = require("@nestjs/common");
let RubricUtilsService = class RubricUtilsService {
    generateLevelColors(levelCount) {
        if (levelCount === 1) {
            return ['#4CAF50'];
        }
        const colors = [];
        const startColor = { r: 255, g: 76, b: 76 };
        const endColor = { r: 76, g: 175, b: 80 };
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
    parseMarkdownTable(markdownData) {
        const lines = markdownData.trim().split('\n').map(line => line.trim());
        const dataLines = lines.filter(line => {
            if (line.length === 0)
                return false;
            const cleanLine = line.replace(/\|/g, '').trim();
            const isSeparatorLine = /^[\s\-:]+$/.test(cleanLine);
            return !isSeparatorLine;
        });
        if (dataLines.length < 2) {
            throw new Error('Formato de tabla inválido. Se requiere al menos una fila de encabezados y una fila de datos.');
        }
        const headerCells = this.parseTableRow(dataLines[0]);
        const criterionHeader = headerCells[0];
        const hasWeightColumn = headerCells.length > 2 &&
            (headerCells[1].toLowerCase().includes('peso') || headerCells[1].includes('%'));
        let levelNames;
        let weightColumnIndex = -1;
        if (hasWeightColumn) {
            weightColumnIndex = 1;
            levelNames = headerCells.slice(2);
        }
        else {
            levelNames = headerCells.slice(1);
        }
        if (levelNames.length === 0) {
            throw new Error('Se requiere al menos un nivel de desempeño.');
        }
        const colors = this.generateLevelColors(levelNames.length);
        const levels = levelNames.map((name, index) => ({
            name: name.trim(),
            description: `Nivel ${index + 1}: ${name.trim()}`,
            order: index,
            scoreValue: index + 1,
            color: colors[index],
        }));
        const criteria = [];
        const cells = [];
        const defaultWeight = 1 / (dataLines.length - 1);
        for (let i = 1; i < dataLines.length; i++) {
            const row = this.parseTableRow(dataLines[i]);
            if (row.length < 2) {
                continue;
            }
            const criterionName = row[0].trim();
            let weight = defaultWeight;
            if (hasWeightColumn && row.length > weightColumnIndex) {
                const weightStr = row[weightColumnIndex].replace('%', '').trim();
                const parsedWeight = parseFloat(weightStr);
                if (!isNaN(parsedWeight)) {
                    weight = parsedWeight / 100;
                }
            }
            const cellStartIndex = hasWeightColumn ? 2 : 1;
            const cellContents = row.slice(cellStartIndex);
            const criterion = {
                name: criterionName,
                description: `Criterio: ${criterionName}`,
                order: i - 1,
                weight: weight,
            };
            criteria.push(criterion);
            for (let j = 0; j < Math.min(cellContents.length, levels.length); j++) {
                const cell = {
                    criterionId: `criterion_${i - 1}`,
                    levelId: `level_${j}`,
                    content: cellContents[j].trim(),
                };
                cells.push(cell);
            }
        }
        return { criteria, levels, cells };
    }
    parseCSVTable(csvData) {
        const lines = csvData.trim().split('\n').map(line => line.trim());
        if (lines.length < 2) {
            throw new Error('Formato CSV inválido. Se requiere al menos una fila de encabezados y una fila de datos.');
        }
        const headers = this.parseCSVRow(lines[0]);
        const hasWeightColumn = headers.length > 2 &&
            (headers[1].toLowerCase().includes('peso') || headers[1].includes('%'));
        let levelNames;
        let weightColumnIndex = -1;
        if (hasWeightColumn) {
            weightColumnIndex = 1;
            levelNames = headers.slice(2);
        }
        else {
            levelNames = headers.slice(1);
        }
        if (levelNames.length === 0) {
            throw new Error('Se requiere al menos un nivel de desempeño.');
        }
        const colors = this.generateLevelColors(levelNames.length);
        const levels = levelNames.map((name, index) => ({
            name: name.trim(),
            description: `Nivel ${index + 1}: ${name.trim()}`,
            order: index,
            scoreValue: index + 1,
            color: colors[index],
        }));
        const criteria = [];
        const cells = [];
        const defaultWeight = 1 / (lines.length - 1);
        for (let i = 1; i < lines.length; i++) {
            const row = this.parseCSVRow(lines[i]);
            if (row.length < 2) {
                continue;
            }
            const criterionName = row[0].trim();
            let weight = defaultWeight;
            if (hasWeightColumn && row.length > weightColumnIndex) {
                const weightStr = row[weightColumnIndex].replace('%', '').trim();
                const parsedWeight = parseFloat(weightStr);
                if (!isNaN(parsedWeight)) {
                    weight = parsedWeight / 100;
                }
            }
            const cellStartIndex = hasWeightColumn ? 2 : 1;
            const cellContents = row.slice(cellStartIndex);
            const criterion = {
                name: criterionName,
                description: `Criterio: ${criterionName}`,
                order: i - 1,
                weight: weight,
            };
            criteria.push(criterion);
            for (let j = 0; j < Math.min(cellContents.length, levels.length); j++) {
                const cell = {
                    criterionId: `criterion_${i - 1}`,
                    levelId: `level_${j}`,
                    content: cellContents[j].trim(),
                };
                cells.push(cell);
            }
        }
        return { criteria, levels, cells };
    }
    parseTableRow(row) {
        const cleanRow = row.replace(/^\|/, '').replace(/\|$/, '');
        return cleanRow.split('|').map(cell => cell.trim());
    }
    parseCSVRow(row) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            }
            else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            }
            else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    calculateRubricScore(criterionAssessments, maxScore = 100) {
        let weightedSum = 0;
        let maxWeightedSum = 0;
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
    validateCriteriaWeights(criteria) {
        const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
        return Math.abs(totalWeight - 1) < 0.01;
    }
    normalizeCriteriaWeights(criteria) {
        const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
        if (totalWeight === 0) {
            const uniformWeight = 1 / criteria.length;
            return criteria.map(criterion => ({ ...criterion, weight: uniformWeight }));
        }
        return criteria.map(criterion => ({
            ...criterion,
            weight: criterion.weight / totalWeight,
        }));
    }
};
exports.RubricUtilsService = RubricUtilsService;
exports.RubricUtilsService = RubricUtilsService = __decorate([
    (0, common_1.Injectable)()
], RubricUtilsService);
//# sourceMappingURL=rubric-utils.service.js.map