import { useState, useEffect } from 'react';
import apiClient from '@services/apiClient';
import { message } from 'antd';

export interface ClassGroup {
  id: string;
  name: string;
  academicYearId: string;
  educationalLevelId?: string;
  courseId?: string;
  tutorId?: string;
  capacity: number;
  educationalLevel?: {
    id: string;
    name: string;
  };
  course?: {
    id: string;
    name: string;
  };
  tutor?: {
    id: string;
    user: {
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  };
  students?: Array<{
    id: string;
    enrollmentNumber: string;
    user: {
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  }>;
  _count?: {
    students: number;
  };
}

const useClassGroups = () => {
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClassGroups();
  }, []);

  const fetchClassGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/class-groups');
      setClassGroups(response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar grupos de clase';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getClassGroup = async (id: string): Promise<ClassGroup | null> => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/class-groups/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar grupo de clase';
      message.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createClassGroup = async (data: Partial<ClassGroup>) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/class-groups', data);
      message.success('Grupo de clase creado exitosamente');
      await fetchClassGroups();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear grupo de clase';
      message.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateClassGroup = async (id: string, data: Partial<ClassGroup>) => {
    try {
      setLoading(true);
      const response = await apiClient.patch(`/class-groups/${id}`, data);
      message.success('Grupo de clase actualizado exitosamente');
      await fetchClassGroups();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar grupo de clase';
      message.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteClassGroup = async (id: string) => {
    try {
      setLoading(true);
      await apiClient.delete(`/class-groups/${id}`);
      message.success('Grupo de clase eliminado exitosamente');
      await fetchClassGroups();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar grupo de clase';
      message.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addStudentToClass = async (classGroupId: string, studentId: string) => {
    try {
      setLoading(true);
      await apiClient.post(`/class-groups/${classGroupId}/students/${studentId}`);
      message.success('Estudiante añadido al grupo exitosamente');
      await fetchClassGroups();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al añadir estudiante';
      message.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeStudentFromClass = async (classGroupId: string, studentId: string) => {
    try {
      setLoading(true);
      await apiClient.delete(`/class-groups/${classGroupId}/students/${studentId}`);
      message.success('Estudiante eliminado del grupo exitosamente');
      await fetchClassGroups();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar estudiante';
      message.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    classGroups,
    loading,
    error,
    fetchClassGroups,
    getClassGroup,
    createClassGroup,
    updateClassGroup,
    deleteClassGroup,
    addStudentToClass,
    removeStudentFromClass,
  };
};

export default useClassGroups;