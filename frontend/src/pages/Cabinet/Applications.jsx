import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useApplicationsStore } from '../../store/applicationsStore';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { serviceStatusBadge } from '../../utils/helpers';

export default function Applications() {
  const { user } = useAuthStore();
  const { applications, loading, error, fetchApplications } = useApplicationsStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">
            Ошибка загрузки заявок
          </h2>
          <p className="text-primary/60">{error}</p>
          <Button onClick={() => fetchApplications()}>
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Мои заявки</h1>
          <p className="text-primary/55 mt-1">
            История и статус ваших заявок на получение услуг
          </p>
        </div>
        
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-primary/60 mb-4">
              У вас пока нет заявок
            </h2>
            <p className="text-primary/50">
              Начните свое путешествие с подачи первой заявки на получение
              государственной поддержки.
            </p>
            <Button
              onClick={() => navigate('/catalog')}
              className="mt-6"
            >
              Посмотреть доступные услуги
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <div key={application.id} className="bg-bg border border-primary/5 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-primary/5 flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-primary truncate">
                      {application.service?.title || 'Заявка на услугу'}
                    </h3>
                    <p className="text-primary/50 text-sm mt-1 truncate">
                      {application.service?.subtitle || ''}
                    </p>
                  </div>
                  <div className="text-right space-x-3">
                    {serviceStatusBadge(application.status)}
                    <span className="text-xs text-primary/50">
                      {new Date(application.created_at).toLocaleDateString('ru-KZ')}
                    </span>
                  </div>
                </div>
                
                <div className="px-5 py-4 space-y-3">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-xs text-primary/50">Статус</p>
                      <p className="font-medium text-primary">
                        {application.status
                          .charAt(0)
                          .toUpperCase() + application.status.slice(1)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-primary/50">Тип услуги</p>
                      <p className="text-primary/60">
                        {application.service?.type
                          ?.charAt(0)
                          .toUpperCase() + application.service?.type?.slice(1)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-primary/50">Сумма</p>
                      <p className="text-primary/60 font-medium">
                        {application.service?.amount_max
                          ? `${application.service.amount_max
                              .toLocaleString()} ₸`
                          : 'По запросу'}
                      </p>
                    </div>
                  </div>
                  
                  {application.status_reason && (
                    <div className="border-t border-primary/5 pt-4">
                      <p className="text-xs text-primary/50">Комментарий</p>
                      <p className="text-primary/60">{application.status_reason}</p>
                    </div>
                  )}
                </div>
                
                <div className="px-5 py-4 border-t border-primary/5 flex justify-end space-x-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/cabinet/applications/${application.id}`)}
                  >
                    Подробнее
                  </Button>
                  
                  {application.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => navigate(`/cabinet/applications/${application.id}`)}
                    >
                      Редактировать
                    </Button>
                  )}
                  
                  {application.status === 'submitted' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // In a real app, this would cancel the application
                          alert('Отмена заявки будет доступна в будущих версиях');
                        }}
                      >
                        Отозвать
                      </Button>
                      
                      <Button
                        size="sm"
                        ml="2"
                        onClick={() => {
                          // In a real app, this would remind about application
                          alert('Напоминание будет отправлено');
                        }}
                      >
                        Напомнить
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}