import { useState, useEffect } from 'react';
import apiClient from '@services/apiClient';
import { message } from 'antd';

export interface SubjectGrade {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  averageGrade: number;
  taskAverage?: number;
  activityAverage?: number;
  competencyAverage?: number;
  gradedTasks: number;
  pendingTasks: number;
  activityAssessments: number;
  lastUpdated: Date;
}

export interface GradeDetail {
  id: string;
  type: 'task' | 'activity' | 'evaluation' | 'exam';
  title: string;
  grade: number;
  maxGrade: number;
  weight?: number;
  gradedAt: Date;
  feedback?: string;
  subject: {
    id: string;
    name: string;
    code: string;
  };
}

export interface StudentGrades {
  student: {
    id: string;
    enrollmentNumber: string;
    firstName: string;
    lastName: string;
    classGroup?: {
      id: string;
      name: string;
    };
    educationalLevel?: {
      id: string;
      name: string;
    };
  };
  summary: {
    overallAverage: number;
    totalSubjects: number;
    totalGradedItems: number;
    totalPendingTasks: number;
    lastActivityDate?: Date;
  };
  subjectGrades: SubjectGrade[];
  recentGrades: GradeDetail[];
  academicPeriod: {
    current: string;
    year: string;
  };
}

export interface ClassGrades {
  classGroup: {
    id: string;
    name: string;
    level: string;
    course: string;
  };
  subject: {
    id: string;
    name: string;
    code: string;
  };
  students: Array<{
    id: string;
    enrollmentNumber: string;
    firstName: string;
    lastName: string;
    grades: {
      taskAverage: number;
      activityAverage: number;
      overallAverage: number;
      gradedTasks: number;
      pendingTasks: number;
      lastActivity?: Date;
    };
  }>;
  statistics: {
    classAverage: number;
    highestGrade: number;
    lowestGrade: number;
    passingRate: number;
  };
}

const useGrades = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get student grades
  const getStudentGrades = async (studentId: string): Promise<StudentGrades | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/grades/student/${studentId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar calificaciones';
      setError(errorMessage);
      message.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get my grades (student)
  const getMyGrades = async (): Promise<StudentGrades | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/grades/my-grades');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar mis calificaciones';
      setError(errorMessage);
      message.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get family children grades
  const getFamilyChildrenGrades = async (): Promise<StudentGrades[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/grades/family/children');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar calificaciones de los hijos';
      setError(errorMessage);
      message.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get specific child grades (family)
  const getFamilyChildGrades = async (studentId: string): Promise<StudentGrades | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/grades/family/child/${studentId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar calificaciones del hijo';
      setError(errorMessage);
      message.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get class grades (teacher)
  const getClassGrades = async (classGroupId: string, subjectId: string): Promise<ClassGrades | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/grades/teacher/class/${classGroupId}/subject/${subjectId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar calificaciones de la clase';
      setError(errorMessage);
      message.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get teacher classes summary
  const getTeacherClassesSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/grades/teacher/my-classes');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar resumen de clases';
      setError(errorMessage);
      message.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get school overview (admin)
  const getSchoolGradesOverview = async (filters?: {
    levelId?: string;
    courseId?: string;
    classGroupId?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters?.levelId) params.append('levelId', filters.levelId);
      if (filters?.courseId) params.append('courseId', filters.courseId);
      if (filters?.classGroupId) params.append('classGroupId', filters.classGroupId);
      
      const response = await apiClient.get(`/grades/admin/overview?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar resumen de calificaciones';
      setError(errorMessage);
      message.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Export student grades as PDF
  const exportStudentGrades = async (studentId: string, period?: string) => {
    try {
      setLoading(true);
      const params = period ? `?period=${period}` : '';
      const response = await apiClient.get(`/grades/export/student/${studentId}${params}`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `calificaciones-${studentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      message.success('Calificaciones exportadas exitosamente');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al exportar calificaciones';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getStudentGrades,
    getMyGrades,
    getFamilyChildrenGrades,
    getFamilyChildGrades,
    getClassGrades,
    getTeacherClassesSummary,
    getSchoolGradesOverview,
    exportStudentGrades,
  };
};

export default useGrades;