import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../api/auth';
import { useNotificationsStore } from '../store/notificationsStore';
import { Spinner } from '../components/ui/Spinner';

export default function Profile() {
  const { user, isAuth, login, logout } = useAuthStore();
  const { addNotification } = useNotificationsStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    bin_number: user?.bin_number || '',
  });
  
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Load user data on mount
  useEffect(() => {
    if (isAuth && !user) {
      const loadUserProfile = async () => {
        setLoading(true);
        try {
          // In a real app, we would fetch from API
          // For now, we'll use mock data from authStore
          setLoading(false);
        } catch (error) {
          setLoading(false);
          addNotification('Ошибка загрузки профиля', 'error');
        }
      };
      
      loadUserProfile();
    }
  }, [isAuth, user, addNotification]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      // Validate form
      const newErrors = {};
      if (!formData.full_name.trim()) {
        newErrors.full_name = 'ФИО обязательно';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email обязателен';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Неверный формат email';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }
      
      // Update profile via API
      // For now, we'll update the auth store directly
      // In a real app, this would be an API call
      const updatedUser = {
        ...user,
        full_name: formData.full_name,
        email: formData.email,
        bin_number: formData.bin_number,
      };
      
      login(updatedUser);
      setSuccessMessage('Профиль успешно обновлен!');
      
      // Add notification
      addNotification('Профиль успешно обновлен', 'success');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Profile update error:', error);
      addNotification('Ошибка обновления профиля', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (!isAuth) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Личный кабинет</h1>
          <p className="text-primary/55 mt-1">Управление вашим профилем и настройками</p>
        </div>
        
        {successMessage && (
          <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg text-accent">
            {successMessage}
          </div>
        )}
        
        <div className="bg-bg border border-primary/5 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-primary/5">
            <h2 className="text-lg font-medium text-primary">Профиль</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  ФИО
                </label>
                <Input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={errors.full_name ? 'border-destructive' : ''}
                  placeholder="Введите ваше полное имя"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-destructive">{errors.full_name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'border-destructive' : ''}
                  placeholder="Введите ваш email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-primary mb-2">
                  БИН (для юридических лиц)
                </label>
                <Input
                  type="text"
                  name="bin_number"
                  value={formData.bin_number}
                  onChange={handleChange}
                  placeholder="Введите БИН организации (если применимо)"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Button 
                type="submit" 
                disabled={loading}
                className={loading ? 'opacity-50' : ''}
              >
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleLogout}
                className="text-destructive hover:bg-destructive/5"
              >
                Выйти
              </Button>
            </div>
          </form>
        </div>
        
        {/* Security Section */}
        <div className="mt-8 bg-bg border border-primary/5 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-primary/5">
            <h2 className="text-lg font-medium text-primary">Безопасность</h2>
          </div>
          
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-primary">Изменить пароль</h3>
                <p className="text-primary/50 text-sm">
                  Для изменения пароля обратитесь в службу поддержки
                </p>
              </div>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => navigate('/auth/password-reset')}
              >
                Изменить пароль
              </Button>
            </div>
            
            <div className="border-t border-primary/5 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-primary">Активные сессии</h3>
                  <p className="text-primary/50 text-sm">
                    1 активная сессия • Последний вход: сегодня, 10:30
                  </p>
                </div>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // In a real app, this would revoke all sessions except current
                    addNotification('Все другие сессии завершены', 'success');
                  }}
                >
                  Выйти из всех устройств
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}