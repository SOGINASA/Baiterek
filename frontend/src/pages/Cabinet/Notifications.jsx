import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationsStore } from '../../store/notificationsStore';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

export default function Notifications() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, markAsRead, clearNotifications } = useNotificationsStore();
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, we would fetch notifications from the backend
    // For now, we'll use the mock data from the notifications store
    // But we can also simulate fetching from backend
    const fetchNotifications = async () => {
      // We'll simulate an API call
      // In a real app, we would call the backend API here
      // For now, we'll just use the existing store data
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = (id) => {
    markAsRead(id);
    // In a real app, we would also update the backend
    // markNotificationRead(id);
  };

  const handleClearAll = () => {
    if (window.confirm('Вы уверены, что хотите удалить все уведомления?')) {
      clearNotifications();
      // In a real app, we would also clear from backend
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Уведомления</h1>
          <p className="text-primary/55 mt-1">
            История уведомлений о статусе заявок и важных событиях
          </p>
        </div>
        
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-primary/60 mb-4">
              У вас нет уведомлений
            </h2>
            <p className="text-primary/50">
              Все важные события будут отображаться здесь.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-primary">
                Уведомления ({unreadCount} непрочитанных)
              </h2>
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="text-sm"
              >
                Очистить все
              </Button>
            </div>
            
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="bg-bg border border-primary/5 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 flex justify-between items-start border-b border-primary/5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 flex-shrink-0 bg-primary/10 rounded-flex items-center justify-center">
                          {/* Notification type icon */}
                          {notification.type === 'application_status' && (
                            <span className="text-primary/60">📋</span>
                          )}
                          {notification.type === 'document_required' && (
                            <span className="text-primary/60">📎</span>
                          )}
                          {notification.type === 'document_approved' && (
                            <span className="text-primary/60">✅</span>
                          )}
                          {notification.type === 'general' && (
                            <span className="text-primary/60">ℹ️</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-primary">{notification.title}</h3>
                          <p className="text-primary/50 text-sm">
                            {new Date(notification.timestamp).toLocaleString('ru-KZ')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-x-2">
                      {!notification.read && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-accent hover:text-accent-light"
                        >
                          Отметить как прочитанное
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-primary/60 whitespace-pre-line">
                      {notification.message}
                    </p>
                    
                    {notification.related_application_id && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigate(`/cabinet/applications/${notification.related_application_id}`);
                          }}
                        >
                          Перейти к заявке
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}