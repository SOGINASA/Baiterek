import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, ClipboardList, Paperclip, CheckCircle2, Info, AlertCircle, CheckCheck } from 'lucide-react';
import { useNotificationsStore } from '../../store/notificationsStore';
import Button from '../../components/ui/Button';

const TYPE_ICON = {
  application_status: ClipboardList,
  document_required:  Paperclip,
  document_approved:  CheckCircle2,
  general:            Info,
};

function NotifIcon({ type, urgent }) {
  if (urgent) return <AlertCircle size={15} className="text-accent flex-shrink-0 mt-0.5" />;
  const Icon = TYPE_ICON[type] ?? Bell;
  return <Icon size={15} className="text-primary/35 flex-shrink-0 mt-0.5" />;
}

export default function Notifications() {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationsStore();
  const navigate = useNavigate();

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const isEmpty = notifications.length === 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Уведомления</h1>
          <p className="text-primary/50 text-sm mt-0.5">
            {unreadCount > 0 ? `${unreadCount} непрочитанных` : 'Все прочитано'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="flex items-center gap-2">
            <CheckCheck size={14} />
            Прочитать все
          </Button>
        )}
      </div>

      {isEmpty ? (
        <div className="text-center py-16">
          <Bell size={44} className="text-primary/15 mx-auto mb-3" />
          <h2 className="text-base font-medium text-primary/50 mb-1">Нет уведомлений</h2>
          <p className="text-primary/40 text-sm">Все важные события будут отображаться здесь.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const isRead = n.is_read || n.read;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className={`bg-surface border rounded-2xl overflow-hidden transition-colors duration-150 ${
                  isRead ? 'border-primary/8' : 'border-accent/20 bg-accent/3'
                }`}
              >
                <div className="p-4 flex gap-3">
                  <NotifIcon type={n.type} urgent={!isRead && n.urgent} />
                  <div className="flex-1 min-w-0">
                    {n.title && (
                      <p className={`text-sm font-semibold mb-0.5 ${isRead ? 'text-primary/70' : 'text-primary'}`}>
                        {n.title}
                      </p>
                    )}
                    <p className={`text-sm leading-relaxed ${isRead ? 'text-primary/55' : 'text-primary/80'}`}>
                      {n.message ?? n.text}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-primary/35">
                        {n.timestamp
                          ? new Date(n.timestamp).toLocaleString('ru-KZ', { dateStyle: 'short', timeStyle: 'short' })
                          : n.time}
                      </span>
                      {n.related_application_id && (
                        <button
                          onClick={() => navigate(`/cabinet/applications/${n.related_application_id}`)}
                          className="text-xs text-accent hover:text-accent-light transition-colors duration-150"
                        >
                          Перейти к заявке →
                        </button>
                      )}
                    </div>
                  </div>
                  {!isRead && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="flex-shrink-0 text-xs text-primary/40 hover:text-accent transition-colors duration-150 self-start pt-0.5"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
