import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Edit2, Trash2, Copy, WandSparkles } from 'lucide-react';

const MOCK_FORMS = [
  { id: 1, name: 'Стандартная форма заявки на финансирование', fields: 8, services: 3, updatedAt: '12 мая 2025' },
  { id: 2, name: 'Заявка на лизинг оборудования', fields: 6, services: 1, updatedAt: '3 апр 2025' },
  { id: 3, name: 'Форма экспортного страхования', fields: 5, services: 1, updatedAt: '21 мар 2025' },
];

export default function AdminForms() {
  const navigate = useNavigate();
  const [forms, setForms] = useState(MOCK_FORMS);

  const handleDelete = (id) => {
    setForms(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-primary">Формы заявок</h1>
          <p className="text-sm text-primary/40 mt-0.5">Управление формами для подачи заявок на услуги</p>
        </div>
        <button
          onClick={() => navigate('/admin/forms/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-light transition-colors duration-150"
        >
          <Plus size={15} />Создать форму
        </button>
      </div>

      {/* List */}
      {forms.length === 0 ? (
        <div className="border-2 border-dashed border-primary/10 rounded-2xl py-20 text-center">
          <WandSparkles size={28} className="text-primary/20 mx-auto mb-3" />
          <p className="text-sm font-medium text-primary/35">Нет форм</p>
          <p className="text-xs text-primary/25 mt-1">Создайте первую форму для сбора заявок</p>
        </div>
      ) : (
        <div className="space-y-3">
          {forms.map(form => (
            <div key={form.id}
              className="bg-surface border border-primary/8 rounded-2xl p-5 flex items-center gap-4 hover:border-primary/15 transition-colors duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-accent" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary truncate">{form.name}</p>
                <p className="text-xs text-primary/40 mt-0.5">
                  {form.fields} полей · используется в {form.services} услугах · обновлено {form.updatedAt}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => navigate(`/admin/forms/${form.id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-primary/10 text-primary/55 hover:text-primary hover:border-primary/25 transition-colors duration-150"
                >
                  <Edit2 size={12} />Редактировать
                </button>
                <button
                  onClick={() => setForms(prev => [...prev, { ...form, id: Date.now(), name: form.name + ' (копия)' }])}
                  className="w-8 h-8 rounded-xl border border-primary/10 flex items-center justify-center text-primary/40 hover:text-primary hover:border-primary/25 transition-colors duration-150"
                >
                  <Copy size={13} />
                </button>
                <button
                  onClick={() => handleDelete(form.id)}
                  className="w-8 h-8 rounded-xl border border-primary/10 flex items-center justify-center text-primary/40 hover:text-rose-400 hover:border-rose-400/30 transition-colors duration-150"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
