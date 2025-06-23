import { PartialType } from '@nestjs/swagger';
import { CreateTeacherDto } from './create-teacher.dto';
import { IsOptional, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'Nueva contraseña para el profesor (solo si se quiere cambiar)',
    example: 'NewPassword123!',
    required: false,
    minLength: 8,
  })
  @IsOptional()
  @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message:
        'La nueva contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial',
    },
  )
  newPassword?: string;
}