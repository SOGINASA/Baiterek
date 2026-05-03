import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useApplicationsStore } from '../../store/applicationsStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { serviceStatusBadge } from '../../utils/helpers';

export default function ApplicationDetail() {
  const { user } = useAuthStore();
  const { application, loading, error, fetchApplication } = useApplicationsStore();
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({});
  const [statusReason, setStatusReason] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchApplication(parseInt(id));
    }
  }, [id, fetchApplication]);

  useEffect(() => {
    if (application && Object.keys(formData).length === 0) {
      setFormData(application.form_data || {});
    }
  }, [application]);

  if (loading && !application) {
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
            Ошибка загрузки заявки
          </h2>
          <p className="text-primary/60">{error}</p>
          <Button onClick={() => navigate('/cabinet/applications')}>
            Вернуться к списку заявок
          </Button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">
            Заявка не найдена
          </h2>
          <p className="text-primary/60">Заявка с указанным ID не существует или у вас нет доступа к ней.</p>
          <Button onClick={() => navigate('/cabinet/applications')}>
            Вернуться к списку заявок
          </Button>
        </div>
      </div>
    );
  }

  // Check if current user owns this application
  if (application.user_id !== user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">
            Доступ запрещен
          </h2>
          <p className="text-primary/60">У вас нет прав для просмотра этой заявки.</p>
          <Button onClick={() => navigate('/cabinet/applications')}>
            Вернуться к списку заявок
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      // Update application
      // In a real app, this would be an API call
      // For now, we'll just show a success message
      alert('Заявка успешно обновлена!');
      setSubmitLoading(false);
      navigate('/cabinet/applications');
    } catch (error) {
      console.error('Application update error:', error);
      setSubmitLoading(false);
      alert('Ошибка обновления заявки');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить эту заявку? Это действие нельзя отменить.')) {
      // In a real app, this would be an API call
      alert('Заявка успешно удалена!');
      navigate('/cabinet/applications');
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Детали заявки</h1>
          <p className="text-primary/55 mt-1">
            Информация о вашей заявке на получение услуги
          </p>
        </div>
        
        <div className="bg-bg border border-primary/5 rounded-lg overflow-hidden">
          {/* Application Header */}
          <div className="px-5 py-4 border-b border-primary/5 flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h2 className="font-medium text-primary truncate">
                {application.service?.title || 'Заявка на услугу'}
              </h2>
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
          
          {/* Application Details */}
          <div className="px-5 py-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-primary">Информация о заявке</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-primary/50">Номер заявки</p>
                  <p className="text-primary/60 font-medium">#{application.id}</p>
                </div>
                <div>
                  <p className="text-xs text-primary/50">Дата создания</p>
                  <p className="text-primary/60">
                    {new Date(application.created_at).toLocaleDateString('ru-KZ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-primary/50">Статус</p>
                  <p className="text-primary/60 font-medium">
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
                <div>
                  <p className="text-xs text-primary/50">Срок рассмотрения</p>
                  <p className="text-primary/60">
                    {application.service?.timeline || 'По запросу'}
                  </p>
                </div>
              </div>
              
              {application.status_reason && (
                <div className="mt-4">
                  <p className="text-xs text-primary/50">Комментарий специалиста</p>
                  <p className="text-primary/60 whitespace-pre-line">
                    {application.status_reason}
                  </p>
                </div>
              )}
            </div>
            
            {/* Form Data */}
            <div className="space-y-4">
              <h3 className="font-medium text-primary">Данные заявки</h3>
              {Object.keys(application.form_data).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(application.form_data).map(([key, value]) => (
                    <div key={key} className="border border-primary/5 rounded-lg p-4">
                      <p className="text-xs text-primary/50 mb-1">{key}</p>
                      <p className="text-primary/60 whitespace-pre-line">
                        {value !== null && value !== undefined ? value : 'Не указано'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-primary/50 text-center py-4">
                  Данные заявки не были заполнены
                </p>
              )}
            </div>
            
            {/* Documents */}
            <div className="space-y-4">
              <h3 className="font-medium text-primary">Документы</h3>
              {application.documents && application.documents.length > 0 ? (
                <div className="space-y-3">
                  {application.documents.map((doc) => (
                    <div key={doc.id} className="border border-primary/5 rounded-lg overflow-hidden">
                      <div className="px-4 py-3 flex justify-between items-center border-b border-primary/5">
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 flex-shrink-0">
                            {/* Document type icon */}
                            <span className="text-primary/60">
                              {doc.file_type.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-primary">{doc.file_name}</p>
                            <p className="text-primary/50 text-sm">
                              {(doc.file_size / 1024 / 1024).toFixed(2)} МБ
                            </p>
                          </div>
                        </div>
                        <div className="text-xs space-x-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                            doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            doc.status === 'signed' ? 'bg-blue-100 text-blue-800' :
                            'bg-primary/10 text-primary'
                          }`}>
                            {doc.status
                              .charAt(0)
                              .toUpperCase() + doc.status.slice(1)}
                          </span>
                          {doc.is_signed && (
                            <span className="text-primary/60">✓ Подписано</span>
                          )}
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // In a real app, this would trigger download
                              window.open(`/api/documents/${doc.id}/download`, '_blank');
                            }}
                          >
                            Скачать
                          </Button>
                          
                          {!doc.is_signed && (
                            <Button
                              size="sm"
                              onClick={() => {
                                // In a real app, this would trigger e-signature process
                                alert('Функция электронной подписи будет доступна в будущих версиях');
                              }}
                            >
                              Подписать
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-primary/50 text-center py-4">
                  К заявке не прикреплено документов
                </p>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="px-5 py-5 border-t border-primary/5 flex justify-end space-x-4">
            {application.status === 'draft' && (
              <>
                <Button
                  onClick={handleSubmit}
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
                
                <Button
                  onClick={() => navigate(`/cabinet/applications/${application.id}/documents`)},
                  className="ml-2"
                >
                  Управление документами
                </Button>
              </>
            )}
            
            {application.status === 'submitted' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                >
                  Удалить заявку
                </Button>
              </>
            )}
            
            {application.status === 'draft' && (
              <Button
                size="sm"
                ml="2"
                onClick={() => {
                  // In a real app, this would be an API call to submit
                  alert('Заявка отправлена на рассмотрение!');
                  navigate('/cabinet/applications');
                }}
              >
                Отправить на рассмотрение
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}