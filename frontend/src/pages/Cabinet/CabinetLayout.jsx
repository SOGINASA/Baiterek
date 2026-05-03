import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationsStore } from '../../store/notificationsStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Spinner } from '../ui/Spinner';

export default function CabinetLayout({ children }) {
  const { user, isAuth, loading, logout } = useAuthStore();
  const { notifications, unreadCount } = useNotificationsStore();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Spinner />
      </div>
    );
  }

  if (!isAuth) {
    navigate('/auth');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-primary text-white">
          <div className="px-4 py-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                🇰🇿
              </div>
              <div>
                <h2 className="font-bold text-xl">Байтерек</h2>
                <p className="text-white/60 text-sm">Личный кабинет</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              <NavLink
                to="/cabinet/profile"
                className={(props) => `
                  flex items-center px-3 py-2 rounded-md text-sm font-medium
                  ${props.isActive ? 'bg-accent/20 text-accent' : 'text-white/70 hover:bg-primary/20'}
                  transition-all duration-150
                `}
              >
                <span className="mr-3">👤</span>
                Профиль
              </NavLink>
              
              <NavLink
                to="/cabinet/applications"
                className={(props) => `
                  flex items-center px-3 py-2 rounded-md text-sm font-medium
                  ${props.isActive ? 'bg-accent/20 text-accent' : 'text-white/70 hover:bg-primary/20'}
                  transition-all duration-150
                `}
              >
                <span className="mr-3">📋</span>
                Мои заявки
                {unreadCount > 0 && (
                  <Badge variant="dot" className="ml-auto">
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                  </Badge>
                )}
              </NavLink>
              
              <NavLink
                to="/cabinet/notifications"
                className={(props) => `
                  flex items-center px-3 py-2 rounded-md text-sm font-medium
                  ${props.isActive ? 'bg-accent/20 text-accent' : 'text-white/70 hover:bg-primary/20'}
                  transition-all duration-150
                `}
              >
                <span className="mr-3">🔔</span>
                Уведомления
                {unreadCount > 0 && (
                  <Badge className="ml-auto">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </NavLink>
              
              <NavLink
                to="/cabinet/documents"
                className={(props) => `
                  flex items-center px-3 py-2 rounded-md text-sm font-medium
                  ${props.isActive ? 'bg-accent/20 text-accent' : 'text-white/70 hover:bg-primary/20'}
                  transition-all duration-150
                `}
              >
                <span className="mr-3">📁</span>
                Документы
              </NavLink>
            </nav>
          </div>
          
          <div className="px-4 pt-4 mt-auto border-t border-primary/10">
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="w-full text-white/70 hover:text-white"
            >
              Выйти
            </Button>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 bg-surface overflow-y-auto">
          <div className="px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}