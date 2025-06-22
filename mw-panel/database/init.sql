-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'family');
CREATE TYPE educational_level_code AS ENUM ('INFANTIL', 'PRIMARIA', 'SECUNDARIA');
CREATE TYPE period_type AS ENUM ('continuous', 'trimester_1', 'trimester_2', 'trimester_3', 'final', 'extraordinary');
CREATE TYPE evaluation_status AS ENUM ('draft', 'submitted', 'reviewed', 'finalized');
CREATE TYPE family_relationship AS ENUM ('father', 'mother', 'guardian', 'other');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_evaluations_student_id ON evaluations(student_id);
CREATE INDEX idx_evaluations_teacher_id ON evaluations(teacher_id);
CREATE INDEX idx_evaluations_period_id ON evaluations(period_id);
CREATE INDEX idx_competency_evaluations_evaluation_id ON competency_evaluations(evaluation_id);

-- Grant permissions to the application user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mwpanel;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mwpanel;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO mwpanel;