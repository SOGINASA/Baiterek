import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FolderOpen, Upload, Search, FileText, FileImage,
  FileSpreadsheet, File, Download, Eye, PenLine,
  CheckCircle2, Clock, AlertCircle, Trash2,
} from 'lucide-react';

const FILE_ICONS = {
  pdf:  { icon: FileText,        color: 'text-red-500',   bg: 'bg-red-50' },
  docx: { icon: FileText,        color: 'text-blue-600',  bg: 'bg-blue-50' },
  xlsx: { icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-50' },
  jpg:  { icon: FileImage,       color: 'text-purple-600',bg: 'bg-purple-50' },
  png:  { icon: FileImage,       color: 'text-purple-600',bg: 'bg-purple-50' },
  other:{ icon: File,            color: 'text-primary/40',bg: 'bg-primary/5' },
};

const DOC_STATUSES = {
  signed:   { label: 'Подписан',         color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle2 },
  pending:  { label: 'Ожидает подписи',  color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
  review:   { label: 'На согласовании',  color: 'text-blue-600 bg-blue-50 border-blue-200',    icon: AlertCircle },
};

const MOCK_DOCS = [
  { id: 1, name: 'Заявка_ZAY-2024-00342.pdf',          ext: 'pdf',  size: '1.2 МБ', date: '14.01.2025', app: 'ZAY-2024-00342', status: 'signed' },
  { id: 2, name: 'Бизнес-план_2025.docx',              ext: 'docx', size: '3.5 МБ', date: '14.01.2025', app: 'ZAY-2024-00342', status: 'pending' },
  { id: 3, name: 'Финансовая_отчётность_2024.xlsx',    ext: 'xlsx', size: '890 КБ', date: '28.12.2024', app: 'ZAY-2024-00298', status: 'signed' },
  { id: 4, name: 'Договор_гарантии.pdf',               ext: 'pdf',  size: '2.1 МБ', date: '28.12.2024', app: 'ZAY-2024-00298', status: 'review' },
  { id: 5, name: 'Копия_свидетельства.jpg',            ext: 'jpg',  size: '645 КБ', date: '05.12.2024', app: 'ZAY-2024-00251', status: 'signed' },
  { id: 6, name: 'Акт_приёма_оборудования.pdf',        ext: 'pdf',  size: '780 КБ', date: '05.12.2024', app: 'ZAY-2024-00251', status: 'pending' },
];

const getFileIcon = (ext) => FILE_ICONS[ext] || FILE_ICONS.other;

export default function CabinetDocuments() {
  const [search, setSearch] = useState('');
  const [dragging, setDragging] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = MOCK_DOCS.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.app.includes(search);
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingSign = MOCK_DOCS.filter(d => d.status === 'pending');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-primary">Документы</h1>
        <p className="text-primary/45 text-sm mt-0.5">Управление документами по вашим заявкам</p>
      </div>

      {/* Pending signature alert */}
      {pendingSign.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl"
        >
          <Clock size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {pendingSign.length} {pendingSign.length === 1 ? 'документ ожидает' : 'документа ожидают'} вашей подписи
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {pendingSign.map(d => d.name).join(', ')}
            </p>
          </div>
          <button className="ml-auto flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-lg transition-colors">
            <PenLine size={12} /> Подписать
          </button>
        </motion.div>
      )}

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
          dragging
            ? 'border-accent bg-accent/6'
            : 'border-primary/15 hover:border-accent/40 hover:bg-accent/3'
        }`}
      >
        <Upload size={22} className={`mx-auto mb-2 ${dragging ? 'text-accent' : 'text-primary/30'}`} />
        <p className="text-sm font-medium text-primary/60">Перетащите файлы или <span className="text-accent underline cursor-pointer">выберите</span></p>
        <p className="text-xs text-primary/30 mt-1">PDF, DOCX, XLSX, JPG, PNG — до 25 МБ</p>
      </div>

      {/* Filters + search */}
      <div className="bg-surface border border-primary/8 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/8 flex-wrap">
          {[
            { key: 'all',     label: 'Все документы' },
            { key: 'pending', label: 'Ожидают подписи' },
            { key: 'review',  label: 'На согласовании' },
            { key: 'signed',  label: 'Подписанные' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterStatus === f.key ? 'bg-accent text-white' : 'text-primary/55 hover:bg-primary/6'
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="ml-auto relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary/35" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="pl-7 pr-3 py-1.5 text-xs bg-bg border border-primary/10 rounded-full focus:outline-none focus:border-accent/50 transition-colors w-36"
            />
          </div>
        </div>

        {/* Documents list */}
        <div className="divide-y divide-primary/5">
          {filtered.length === 0 && (
            <div className="py-14 text-center text-primary/35 text-sm">Документы не найдены</div>
          )}
          {filtered.map((doc, i) => {
            const FI = getFileIcon(doc.ext);
            const FIcon = FI.icon;
            const S = DOC_STATUSES[doc.status];
            const SIcon = S.icon;
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-primary/2 transition-colors group"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${FI.bg}`}>
                  <FIcon size={16} className={FI.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-primary/35">
                    <span>{doc.size}</span>
                    <span>·</span>
                    <span>{doc.date}</span>
                    <span>·</span>
                    <span className="text-primary/30">#{doc.app}</span>
                  </div>
                </div>

                <span className={`flex items-center gap-1 px-2 py-0.5 border rounded-full text-xs font-medium flex-shrink-0 ${S.color}`}>
                  <SIcon size={10} />
                  {S.label}
                </span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-lg hover:bg-primary/8 text-primary/40 hover:text-primary transition-colors">
                    <Eye size={14} />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-primary/8 text-primary/40 hover:text-primary transition-colors">
                    <Download size={14} />
                  </button>
                  {doc.status === 'pending' && (
                    <button className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500 hover:text-amber-600 transition-colors">
                      <PenLine size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}