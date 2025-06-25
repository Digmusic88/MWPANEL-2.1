import { useState, useEffect } from 'react';
import apiClient from '@services/apiClient';
import { message } from 'antd';

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  educationalLevelId: string;
  order: number;
  isActive: boolean;
  educationalLevel?: {
    id: string;
    name: string;
    code: string;
  };
}

const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/courses');
      setCourses(response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar cursos';
      setError(errorMessage);
      // Don't show error message for missing endpoint
      if (!error.response?.status || error.response.status !== 404) {
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getCoursesByLevel = async (educationalLevelId: string): Promise<Course[]> => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/courses/by-level/${educationalLevelId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar cursos del nivel';
      message.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (data: Partial<Course>) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/courses', data);
      message.success('Curso creado exitosamente');
      await fetchCourses();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear curso';
      message.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCourse = async (id: string, data: Partial<Course>) => {
    try {
      setLoading(true);
      const response = await apiClient.patch(`/courses/${id}`, data);
      message.success('Curso actualizado exitosamente');
      await fetchCourses();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar curso';
      message.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      setLoading(true);
      await apiClient.delete(`/courses/${id}`);
      message.success('Curso eliminado exitosamente');
      await fetchCourses();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar curso';
      message.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    courses,
    loading,
    error,
    fetchCourses,
    getCoursesByLevel,
    createCourse,
    updateCourse,
    deleteCourse,
  };
};

export default useCourses;