import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/communications/messages/unread-count');
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Polling cada 30 segundos para actualizar el conteo
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshUnreadCount = () => {
    fetchUnreadCount();
  };

  return {
    unreadCount,
    loading,
    refreshUnreadCount,
  };
};