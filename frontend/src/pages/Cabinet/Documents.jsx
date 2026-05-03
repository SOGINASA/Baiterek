import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useApplicationsStore } from '../../store/applicationsStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';

export default function Documents() {
  const { user } = useAuthStore();
  const { applications, loading, error, fetchApplications } = useApplicationsStore();
  const navigate = useNavigate();
  
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  // Get all documents from all applications
  const allDocuments = applications.flatMap(app => 
    app.documents.map(doc => ({
      ...doc,
      applicationTitle: app.service?.title || 'Неизвестная услуга',
      applicationId: app.id
    }))
  ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!selectedApplicationId) {
      alert('Пожалуйста, выберите заявку для загрузки документа');
      return;
    }
    
    // In a real app, this would upload to the backend
    // For demo, we'll simulate upload
    setUploading(true);
    setUploadProgress(0);
    
    const uploadSimulation = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(uploadSimulation);
          setUploading(false);
          setUploadProgress(0);
          e.target.value = ''; // Reset file input
          alert('Документ успешно загружен!');
          // In a real app, we would refetch applications here
          return 100;
        }
        return newProgress;
      });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Мои документы</h1>
          <p className="text-primary/55 mt-1">
            Управление документами, прикрепленными к вашим заявкам
          </p>
        </div>
        
        {/* Upload Section */}
        <div className="bg-bg border border-primary/5 rounded-lg mb-8 overflow-hidden">
          <div className="px-5 py-4 border-b border-primary/5">
            <h2 className="font-medium text-primary">Загрузить документ</h2>
          </div>
          
          <div className="px-5 py-5 space-y-5">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-primary mb-2">
                Выберите заявку
              </label>
              <select
                value={selectedApplicationId || ''}
                onChange={(e) => setSelectedApplicationId(e.target.value)}
                className="w-full rounded-lg border bg-surface px-4 py-2.5 text-sm placeholder:text-primary/40 outline-none
                  transition-[border-color,box-shadow] duration-150
                  border-primary/20 focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                <option value="">Выберите заявку...</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    #{app.id} - {app.service?.title || 'Неизвестная услуга'}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedApplicationId && (
              <>
                <label className="block text-sm font-medium text-primary mb-2">
                  Выберите файл для загрузки
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                    onChange={handleFileChange}
                    className="w-full text-primary/60"
                  >
                    Выбрать файл
                  </input>
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center bg-white rounded-lg p-6 max-w-xs">
                        <div className="mb-4">
                          <div className="w-12 h-12 border-4 border-accent/50 rounded-full border-t-accent animate-spin" />
                        </div>
                        <p className="font-medium text-primary">Загрузка...</p>
                        {uploadProgress > 0 && (
                          <div className="mt-4">
                            <div className="w-full bg-primary/10 rounded-full h-2.5">
                              <div className={`bg-accent h-2.5 rounded-full transition-all duration-200`} 
                                   style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                            <p className="mt-2 text-sm text-primary/60">{uploadProgress}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <p className="mt-2 text-xs text-primary/50">
                  Поддерживаемые форматы: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG, TXT
                </p>
              </>
            )}
          </div>
        </div>
        
        {/* Documents List */}
        <div className="bg-bg border border-primary/5 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-primary/5">
            <h2 className="font-medium text-primary">Список документов</h2>
          </div>
          
          {allDocuments.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-primary/50">
                У вас пока нет загруженных документов.
              </p>
              <p className="text-primary/50 mt-2">
                Прикрепите документы к своим заявкам для прохождения процедуры рассмотрения.
              </p>
            </div>
          ) : (
            <div className="px-5 py-4 space-y-4">
              {allDocuments.map((doc) => (
                <div key={doc.id} className="border border-primary/5 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 flex justify-between items-center border-b border-primary/5">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-5 h-5 flex-shrink-0">
                        {/* Document type icon */}
                        <span className="text-primary/60 flex items-center justify-center">
                          {doc.file_type.toUpperCase() === 'PDF' ? '📄' : 
                           doc.file_type.toUpperCase() === 'DOC' || doc.file_type.toUpperCase() === 'DOCX' ? '📝' :
                           doc.file_type.toUpperCase() === 'XLS' || doc.file_type.toUpperCase() === 'XLSX' ? '📊' :
                           doc.file_type.toUpperCase() === 'JPG' || doc.file_type.toUpperCase() === 'JPEG' || doc.file_type.toUpperCase() === 'PNG' ? '🖼️' : 
                           '📎'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-primary truncate max-w-xs">{doc.file_name}</p>
                        <p className="text-primary/50 text-sm">
                          {(doc.file_size / 1024 / 1024).toFixed(2)} МБ • 
                          {new Date(doc.created_at).toLocaleDateString('ru-KZ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs space-x-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                        doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        doc.status === 'signed' ? 'bg-blue-100 text-blue-800' :
                        doc.status === 'pending' ? 'bg-primary/10 text-primary' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {doc.status
                          .charAt(0)
                          .toUpperCase() + doc.status.slice(1)}
                      </span>
                      {doc.is_signed && (
                        <span className="ml-2 text-primary/60">✓ Подписано</span>
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
                      
                      {doc.uploaded_by_user && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (window.confirm('Вы уверены, что хотите удалить этот документ?')) {
                              // In a real app, this would be a DELETE API call
                              alert('Документ успешно удален!');
                            }
                          }}
                        >
                          Удалить
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}