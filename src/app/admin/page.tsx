"use client";

import React, { useState, useEffect } from 'react';
import { Send, Loader2, Bell, Clock, Plus, Trash2, Edit2, Check, X, Eye } from 'lucide-react';
import { useAdmin } from '@/components/shared/AdminProvider';
import './admin.css';

import { syncFolders } from '@/actions/admin';

function AiAnalytics() {
  const [analyzed, setAnalyzed] = useState<any[]>([]);
  const [ignored, setIgnored] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newIgnore, setNewIgnore] = useState('');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resAnalyzed, resIgnored] = await Promise.all([
        fetch('/api/bot/ai_analyzed_chats'),
        fetch('/api/bot/ai_ignored_chats')
      ]);
      if (resAnalyzed.ok) {
        setAnalyzed(await resAnalyzed.json());
      }
      if (resIgnored.ok) {
        setIgnored(await resIgnored.json());
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddIgnore = async () => {
    if (!newIgnore.trim()) return;
    try {
      // Assuming newIgnore is chat_id for simplicity, since AI blacklist uses chat_id
      const res = await fetch('/api/bot/ai_ignored_chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: newIgnore.trim() })
      });
      if (res.ok) {
        setNewIgnore('');
        fetchData();
      } else {
        alert("Ошибка при добавлении (возможно нужен точный ID чата)");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveIgnore = async (chat_id: string) => {
    try {
      const res = await fetch('/api/bot/ai_ignored_chats', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Analyzed Chats */}
      <div className="glassPanel">
        <h2 className="botAdminTitle" style={{ marginBottom: 15 }}>Проанализированные чаты (AI)</h2>
        <p style={{ color: 'var(--text-light)', fontSize: 14, marginBottom: 20 }}>
          Здесь отображаются затихшие чаты, которые были проанализированы нейросетью.
        </p>

        <div>
          {loading ? (
            <p style={{ color: 'var(--text-light)' }}>Загрузка...</p>
          ) : analyzed.length === 0 ? (
            <p style={{ color: 'var(--text-light)' }}>Пока нет проанализированных чатов</p>
          ) : (
            analyzed.map(chat => (
              <div key={chat.chat_id} className="reminderItem" style={{ borderLeft: chat.status === 'success' ? '4px solid #38A169' : '4px solid #E53E3E' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <h4 style={{ margin: 0, color: 'var(--text-dark)', fontSize: 16 }}>{chat.title || `Chat ID: ${chat.chat_id}`}</h4>
                  <div style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, background: chat.status === 'success' ? '#C6F6D5' : '#FED7D7', color: chat.status === 'success' ? '#2F855A' : '#C53030', fontWeight: 'bold' }}>
                    {chat.status === 'success' ? 'Успешная сделка' : 'Сорвалась / Молчат'}
                  </div>
                </div>
                <p style={{ fontSize: 12, color: '#888', margin: '4px 0 10px' }}>
                  Проанализировано: {new Date(chat.analyzed_at).toLocaleString('ru-RU')}
                </p>
                
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="botBtn" style={{ background: '#edf2f7', color: '#4a5568', padding: '6px 12px', fontSize: 13, flex: 1 }} onClick={() => setExpandedReport(expandedReport === chat.chat_id ? null : chat.chat_id)}>
                    {expandedReport === chat.chat_id ? 'Скрыть отчет' : 'Читать полный отчет'}
                  </button>
                  <button className="botBtn" style={{ background: '#FED7D7', color: '#C53030', padding: '6px 12px', fontSize: 13 }} onClick={() => { setNewIgnore(String(chat.chat_id)); handleAddIgnore(); }}>
                    В игнор ИИ
                  </button>
                </div>

                {expandedReport === chat.chat_id && (
                  <div style={{ marginTop: 15, padding: 15, background: '#f7fafc', borderRadius: 8, fontSize: 13, color: '#2d3748', whiteSpace: 'pre-wrap', border: '1px solid #e2e8f0' }}>
                    <p style={{fontStyle: 'italic', color: '#718096'}}>Отчет сохранен на сервере в {chat.report_path}</p>
                    <p>Для просмотра полного содержимого отчета откройте файл {chat.report_path} на сервере. Вскоре здесь появится возможность скачивать файл напрямую.</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Blacklist */}
      <div className="glassPanel">
        <h2 className="botAdminTitle" style={{ marginBottom: 15 }}>Игнор-лист ИИ</h2>
        <p style={{ color: 'var(--text-light)', fontSize: 14, marginBottom: 20 }}>
          Введите ID чата, чтобы ИИ больше никогда не анализировал его.
        </p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input 
            type="text" 
            className="botInput" 
            placeholder="ID чата (например: -1001234567)" 
            value={newIgnore} 
            onChange={(e) => setNewIgnore(e.target.value)} 
            style={{ marginBottom: 0 }}
          />
          <button className="botBtn" onClick={handleAddIgnore} disabled={!newIgnore.trim()}>
            <Plus size={20} />
          </button>
        </div>
        <div>
          {ignored.length === 0 ? (
            <p style={{ color: 'var(--text-light)' }}>Игнор-лист пуст</p>
          ) : (
            ignored.map(chat_id => (
              <div key={chat_id} className="reminderItem" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-dark)' }}>Chat ID: {chat_id}</span>
                <Trash2 size={20} color="#E53E3E" style={{ cursor: 'pointer' }} onClick={() => handleRemoveIgnore(chat_id)} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { isAdmin, error } = useAdmin();
  const [activeTab, setActiveTab] = useState('reminders');
  const [syncing, setSyncing] = useState(false);

  if (!isAdmin) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: '#111' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Доступ закрыт</h1>
          <p style={{ color: '#888' }}>У вас нет прав для просмотра этой страницы.</p>
          {error && <p style={{ color: '#ef4444', marginTop: '10px', maxWidth: '300px', margin: '10px auto' }}>{error}</p>}
          <p style={{ color: '#555', fontSize: '12px', marginTop: '20px' }}>(Нажмите Ctrl+Alt+Y для входа)</p>
        </div>
      </div>
    );
  }

  const handleSyncFolders = async () => {
    setSyncing(true);
    try {
      const res = await syncFolders();
      if (res.success) {
        const c = res.count || {blogger: 0, project: 0, advertiser: 0};
        const total = c.blogger + c.project + c.advertiser;
        alert(`Синхронизация завершена успешно!\n\nВсего чатов в базе: ${total}\nИз них:\n— Блогеры: ${c.blogger}\n— Проекты: ${c.project}\n— Рекламодатели: ${c.advertiser}`);
      } else {
        alert("Ошибка: " + res.error);
      }
    } catch (e) {
      alert("Ошибка синхронизации");
    }
    setSyncing(false);
  };

  return (
    <div className="botAdminBody">
      <div className="appContainer">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h1 className="botAdminTitle" style={{ justifyContent: 'center' }}>Панель Управления</h1>
          <p style={{ color: 'var(--text-light)', marginTop: -10, marginBottom: 15 }}>Агентство 82 (Telegram Bot)</p>
          
          <button 
            className="botBtn" 
            onClick={handleSyncFolders} 
            disabled={syncing}
            style={{ padding: '8px 16px', fontSize: 14, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {syncing ? <Loader2 className="animate-spin" size={16}/> : '🔄'}
            {syncing ? 'Синхронизация...' : 'Синхронизировать чаты'}
          </button>
        </div>

        <div className="botTabs">
          <div 
            className={`botTab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            Задачи
          </div>
          <div 
            className={`botTab ${activeTab === 'reminders' ? 'active' : ''}`}
            onClick={() => setActiveTab('reminders')}
          >
            Напоминания
          </div>
          <div 
            className={`botTab ${activeTab === 'broadcast' ? 'active' : ''}`}
            onClick={() => setActiveTab('broadcast')}
          >
            Рассылка
          </div>
          <div 
            className={`botTab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Чат с ИИ
          </div>
          <div 
            className={`botTab ${activeTab === 'generator' ? 'active' : ''}`}
            onClick={() => setActiveTab('generator')}
          >
            Генератор
          </div>
          <div 
            className={`botTab ${activeTab === 'ignore' ? 'active' : ''}`}
            onClick={() => setActiveTab('ignore')}
          >
            Игнор-радар
          </div>
          <div 
            className={`botTab ${activeTab === 'blacklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('blacklist')}
          >
            Игнор-чаты
          </div>
          <div 
            className={`botTab ${activeTab === 'ai_analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai_analytics')}
          >
            AI Аналитика
          </div>
        </div>


        {activeTab === 'tasks' && <TasksTab />}
        {activeTab === 'reminders' && <Reminders />}
        {activeTab === 'broadcast' && <Broadcast />}
        {activeTab === 'chat' && <AILogs />}
        {activeTab === 'generator' && <Generator />}
        {activeTab === 'ignore' && <IgnoreRadar />}
        {activeTab === 'blacklist' && <Blacklist />}
        {activeTab === 'ai_analytics' && <AiAnalytics />}
        
      </div>
    </div>
  );
}

import { getActiveTasks, getCompletedTasks, saveTask, updateTaskStatus, deleteTask } from '@/actions/tasks';
import type { Task } from '@prisma/client';
import GeneratorTab from '@/components/admin/GeneratorTab';

function TasksTab() {
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [deadline, setDeadline] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fetchTasks = async () => {
    try {
      const active = await getActiveTasks();
      setActiveTasks(active);
      const completed = await getCompletedTasks();
      setCompletedTasks(completed);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async () => {
    if (!title) return;
    setLoading(true);
    try {
      let attachmentUrl = undefined;
      
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'agency_uploads'); // Or use server action
        
        // Since we don't know the exact cloudinary setup, let's use a server action we will create
        const { uploadTaskFile } = await import('@/actions/upload');
        const res = await uploadTaskFile(formData);
        if (res.url) {
          attachmentUrl = res.url;
        }
      }

      let parsedDeadline: Date | undefined = undefined;
      if (deadline) {
        // Handle smart dates if it doesn't parse as normal date
        const lower = deadline.toLowerCase().trim();
        const now = new Date();
        if (lower === 'завтра') {
          now.setDate(now.getDate() + 1);
          now.setHours(12, 0, 0, 0);
          parsedDeadline = now;
        } else if (lower === 'послезавтра') {
          now.setDate(now.getDate() + 2);
          now.setHours(12, 0, 0, 0);
          parsedDeadline = now;
        } else if (lower.startsWith('через')) {
           const match = lower.match(/через\s+(\d+)\s+(дн|час|мин)/);
           if (match) {
             const val = parseInt(match[1]);
             if (match[2].startsWith('дн')) now.setDate(now.getDate() + val);
             if (match[2].startsWith('час')) now.setHours(now.getHours() + val);
             if (match[2].startsWith('мин')) now.setMinutes(now.getMinutes() + val);
             parsedDeadline = now;
           }
        }
        
        if (!parsedDeadline) {
          parsedDeadline = new Date(deadline);
        }
      }
      
      await saveTask({
        title,
        description,
        priority,
        deadline: parsedDeadline,
        attachmentUrl
      });
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setDeadline('');
      setFile(null);
      fetchTasks();
    } catch (e) {
      alert("Ошибка создания задачи: " + String(e));
    }
    setLoading(false);
  };
  
  const setQuickDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(12, 0, 0, 0);
    // format as YYYY-MM-DDTHH:mm
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
    setDeadline(localISOTime);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoading(true);
    try {
      await updateTaskStatus(id, newStatus);
      fetchTasks();
    } catch (e) {
      alert("Ошибка обновления статуса");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить задачу?')) return;
    setLoading(true);
    try {
      await deleteTask(id);
      fetchTasks();
    } catch (e) {
      alert("Ошибка удаления");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="glassPanel" style={{ marginBottom: 20 }}>
        <h2 className="botAdminTitle" style={{ marginBottom: 15 }}><Plus size={24} style={{ marginRight: 8 }} /> Создать задачу</h2>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <input className="botInput" style={{ flex: 2, minWidth: 200, marginBottom: 0 }} placeholder="Название задачи" value={title} onChange={e => setTitle(e.target.value)} />
          <select className="botSelect" style={{ flex: 1, minWidth: 120, marginBottom: 0 }} value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="LOW">🟢 Низкий</option>
            <option value="MEDIUM">🟡 Средний</option>
            <option value="HIGH">🔴 Высокий</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input className="botInput" type="datetime-local" style={{ flex: 1, marginBottom: 0 }} value={deadline} onChange={e => setDeadline(e.target.value)} />
            <input className="botInput" type="text" placeholder='Или текстом: "завтра", "через 2 часа"' style={{ flex: 1, marginBottom: 0 }} value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            <button className="botBtn" style={{ padding: '4px 10px', fontSize: 12, background: 'rgba(255,255,255,0.5)', color: '#333' }} onClick={() => setQuickDate(1)}>На завтра</button>
            <button className="botBtn" style={{ padding: '4px 10px', fontSize: 12, background: 'rgba(255,255,255,0.5)', color: '#333' }} onClick={() => setQuickDate(2)}>Послезавтра</button>
            <button className="botBtn" style={{ padding: '4px 10px', fontSize: 12, background: 'rgba(255,255,255,0.5)', color: '#333' }} onClick={() => setQuickDate(7)}>Через неделю</button>
          </div>
        </div>
        
        <textarea className="botTextarea" rows={2} placeholder="Описание (опционально)" value={description} onChange={e => setDescription(e.target.value)} style={{ marginBottom: 10 }} />
        
        <div style={{ marginBottom: 15 }}>
          <label style={{ fontSize: 14, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid var(--primary-pink)', padding: '8px 12px', borderRadius: 8, fontSize: 14 }}>
              {file ? file.name : "📎 Прикрепить фото/файл"}
            </div>
            <input type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
          </label>
        </div>

        <button className="botBtn" onClick={handleCreate} disabled={loading || !title}>Добавить задачу</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button className="botBtn" style={{ background: !showArchive ? 'var(--primary-pink)' : '#333' }} onClick={() => setShowArchive(false)}>Активные задачи ({activeTasks.length})</button>
        <button className="botBtn" style={{ background: showArchive ? 'var(--primary-pink)' : '#333' }} onClick={() => setShowArchive(true)}>Архив ({completedTasks.length})</button>
      </div>

      <div className="glassPanel">
        <h2 className="botAdminTitle" style={{ marginBottom: 15 }}>
          {showArchive ? 'Архив (Завершенные)' : 'Активные задачи'}
        </h2>
        
        {(showArchive ? completedTasks : activeTasks).length === 0 ? (
          <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>Нет задач</p>
        ) : (
          (showArchive ? completedTasks : activeTasks).map(task => (
            <div key={task.id} className="reminderItem" style={{ opacity: task.status === 'COMPLETED' ? 0.6 : 1, flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', wordBreak: 'break-word' }}>
                    {task.title}
                    {task.priority === 'HIGH' && <span style={{ background: '#E53E3E', color: 'white', fontSize: 10, padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>СРОЧНО</span>}
                  </h3>
                  {task.deadline && (
                    <span style={{ fontSize: 12, color: 'var(--primary-pink)', display: 'inline-flex', alignItems: 'center', marginTop: 4 }}>
                      <Clock size={12} style={{ marginRight: 4 }}/> Дедлайн: {new Date(task.deadline).toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  <select 
                    className="botSelect" 
                    value={task.status} 
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    style={{ padding: '4px 8px', fontSize: 12, height: 'auto', minWidth: '100px' }}
                  >
                    <option value="NEW">Новая</option>
                    <option value="IN_PROGRESS">В процессе</option>
                    <option value="COMPLETED">Выполнено</option>
                  </select>
                  <Trash2 size={18} color="#E53E3E" style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => handleDelete(task.id)} />
                </div>
              </div>
              {task.description && <p style={{ margin: '0 0 10px 0', fontSize: 14, color: 'var(--text-light)', wordBreak: 'break-word', whiteSpace: 'pre-wrap', width: '100%' }}>{task.description}</p>}
              {task.attachmentUrl && (
                <a href={task.attachmentUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--primary-pink)', textDecoration: 'underline' }}>
                  📎 Посмотреть вложение
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Broadcast() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: string, text: string} | null>(null);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    if (!confirm('Вы уверены, что хотите отправить это сообщение ВСЕМ блогерам?')) return;

    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch(`/api/bot/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      if (response.ok) {
        setStatus({ type: 'success', text: `Успешно отправлено ${data.sent} блогерам!` });
        setMessage('');
      } else {
        setStatus({ type: 'error', text: data.error || 'Произошла ошибка' });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'Ошибка соединения с сервером бота. Проверьте, что бот запущен.' });
    }
    setLoading(false);
  };

  return (
    <div className="glassPanel">
      <h2 className="botAdminTitle" style={{ marginBottom: 15 }}><Send size={24} style={{ marginRight: 8 }} /> Массовая рассылка</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>
        Это сообщение будет отправлено всем чатам из папки "блогеры" от вашего лица.
      </p>
      
      <textarea 
        className="botTextarea"
        rows={6} 
        placeholder="Здравствуйте! Пожалуйста, пришлите актуальную статистику..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      
      {status && (
        <div style={{ 
          padding: 12, 
          borderRadius: 8, 
          marginBottom: 16,
          backgroundColor: status.type === 'success' ? '#C6F6D5' : '#FED7D7',
          color: status.type === 'success' ? '#2F855A' : '#C53030'
        }}>
          {status.text}
        </div>
      )}

      <button className="botBtn" onClick={handleSend} disabled={loading || !message.trim()} style={{ width: '100%' }}>
        {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
        {loading ? 'Отправка...' : 'Отправить всем'}
      </button>
    </div>
  );
}

function Reminders() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newInterval, setNewInterval] = useState('5');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingMessage, setEditingMessage] = useState('');

  const fetchReminders = async () => {
    try {
      const res = await fetch(`/api/bot/reminders`);
      const data = await res.json();
      if (Array.isArray(data)) {
          setReminders(data);
      }
    } catch (e) {
      console.error("Fetch reminders error:", e);
    }
  };

  useEffect(() => {
    fetchReminders();
    const interval = setInterval(fetchReminders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAdd = async () => {
    if (!newUsername || !newMessage || !newInterval) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bot/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          message: newMessage,
          interval_hours: newInterval
        })
      });
      const data = await res.json();
      if (res.ok) {
        setNewUsername('');
        setNewMessage('');
        setNewInterval('5');
        fetchReminders();
      } else {
        alert('Ошибка: ' + (data.error || 'Не удалось добавить'));
      }
    } catch (e) {
      alert('Ошибка соединения с сервером бота');
    }
    setLoading(false);
  };

  const handleEdit = (rem: any) => {
    setEditingId(rem.id);
    setEditingMessage(rem.message);
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/bot/reminders/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, message: editingMessage })
      });
      if (res.ok) {
        setEditingId(null);
        fetchReminders();
      } else {
        const data = await res.json();
        alert('Ошибка: ' + (data.error || 'Не удалось сохранить'));
      }
    } catch (e) {
      alert('Ошибка соединения с сервером бота');
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await fetch(`/api/bot/reminders/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchReminders();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить напоминание?')) return;
    try {
      await fetch(`/api/bot/reminders/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchReminders();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="glassPanel">
        <h2 className="botAdminTitle" style={{ marginBottom: 15 }}><Plus size={24} style={{ marginRight: 8 }} /> Новое напоминание</h2>
        
        <div style={{ display: 'flex', gap: 10 }}>
          <input 
            className="botInput"
            type="text" 
            placeholder="@username" 
            value={newUsername}
            onChange={e => setNewUsername(e.target.value)}
            style={{ flex: 1, marginBottom: 10 }}
          />
          <select className="botSelect" value={newInterval} onChange={e => setNewInterval(e.target.value)} style={{ width: '120px', marginBottom: 10 }}>
            <option value="1">1 час</option>
            <option value="3">3 часа</option>
            <option value="5">5 часов</option>
            <option value="12">12 часов</option>
            <option value="24">24 часа</option>
          </select>
        </div>
        
        <textarea 
          className="botTextarea"
          rows={3} 
          placeholder="Напоминаю, нужно обновить сценарий!"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        
        <button className="botBtn" onClick={handleAdd} disabled={loading || !newUsername || !newMessage} style={{ padding: '8px 16px' }}>
          Добавить
        </button>
      </div>

      <div className="glassPanel">
        <h2 className="botAdminTitle" style={{ marginBottom: 15 }}><Bell size={24} style={{ marginRight: 8 }} /> Активные напоминания</h2>
        
        {reminders.length === 0 ? (
          <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>Нет активных напоминаний</p>
        ) : (
          reminders.map(rem => (
            <div key={rem.id} className="reminderItem" style={{ opacity: rem.is_active ? 1 : 0.6 }}>
              <div className="reminderInfo" style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>{rem.username}</span>
                  <span style={{ fontSize: 12, color: 'var(--primary-pink)', display: 'inline-flex', alignItems: 'center', background: 'rgba(255, 107, 158, 0.1)', padding: '2px 8px', borderRadius: 12 }}>
                    <Clock size={12} style={{ marginRight: 4 }}/> 
                    Каждые {rem.interval_hours} ч.
                  </span>
                  <span style={{ fontSize: 12, color: '#888', background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: 12 }}>
                    Отправлено: {rem.sent_count || 0} раз
                  </span>
                </div>
                {editingId === rem.id ? (
                  <div style={{ marginTop: 8 }}>
                    <textarea 
                      className="botTextarea" 
                      rows={3} 
                      value={editingMessage}
                      onChange={(e) => setEditingMessage(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="botBtn" onClick={() => handleSaveEdit(rem.id)} style={{ padding: '6px 12px', fontSize: 14 }}><Check size={16} style={{ marginRight: 4 }}/> Сохранить</button>
                      <button className="botBtn" onClick={() => setEditingId(null)} style={{ padding: '6px 12px', fontSize: 14, background: '#555' }}><X size={16} style={{ marginRight: 4 }}/> Отмена</button>
                    </div>
                  </div>
                ) : (
                  <p style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{rem.message}</p>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <Edit2 
                  size={20} 
                  color="#bbb" 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => handleEdit(rem)}
                />
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={rem.is_active} 
                    onChange={() => handleToggle(rem.id)}
                  />
                  <span className="slider"></span>
                </label>
                <Trash2 
                  size={20} 
                  color="#E53E3E" 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => handleDelete(rem.id)}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AIChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`/api/bot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: `Ошибка: ${data.error}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Ошибка соединения с сервером бота.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="glassPanel" style={{ display: 'flex', flexDirection: 'column', height: '60vh' }}>
      <h2 className="botAdminTitle" style={{ marginBottom: 15 }}>Чат с нейросетью</h2>
      
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 15, padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
        {messages.length === 0 ? (
          <p style={{ color: 'var(--text-light)', textAlign: 'center', marginTop: 20 }}>Задайте вопрос по базе данных агентства...</p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} style={{ 
              marginBottom: 10, 
              textAlign: msg.role === 'user' ? 'right' : 'left' 
            }}>
              <span style={{ 
                display: 'inline-block', 
                padding: '8px 12px', 
                borderRadius: 12,
                backgroundColor: msg.role === 'user' ? 'var(--primary-pink)' : '#333',
                color: 'white',
                maxWidth: '80%',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.text}
              </span>
            </div>
          ))
        )}
        {loading && <div style={{ color: 'var(--text-light)', fontSize: 12 }}>Нейросеть печатает...</div>}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <input 
          className="botInput"
          type="text" 
          placeholder="Напишите сообщение..." 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          style={{ flex: 1 }}
        />
        <button className="botBtn" onClick={handleSend} disabled={loading || !input.trim()}>
          Отправить
        </button>
      </div>
    </div>
  );
}

function IgnoreRadar() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchIgnoreStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bot/ignore_status');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error("Ignore radar error:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIgnoreStatus();
    const interval = setInterval(fetchIgnoreStatus, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  const waitingForThem = data.filter(d => d.is_waiting_for_them);
  const waitingForUs = data.filter(d => !d.is_waiting_for_them);

  const renderCard = (msg: any) => {
    let timerText = "";
    let statusColor = "";
    let bgColor = "";
    let progress = 0;
    
    const now = new Date();
    
    // Вычисляем время
    const hrsPassed = Math.floor(msg.hours_passed || 0);
    const minsPassed = Math.floor(((msg.hours_passed || 0) - hrsPassed) * 60);
    const passedStr = `${hrsPassed}ч ${minsPassed}м`;
    
    if (msg.is_weekend) {
      timerText = "⏸ Пауза (Выходной)";
      statusColor = "#718096";
      bgColor = "rgba(113, 128, 150, 0.1)";
      progress = 0;
    } else if (msg.is_nighttime) {
      timerText = "🌙 Ночь (Пауза до 10:00)";
      statusColor = "#805AD5";
      bgColor = "rgba(128, 90, 213, 0.1)";
      progress = 0;
    } else if (msg.is_notified && msg.notified_at) {
      // Если уже было отправлено уведомление, ждем 5 часов с момента последнего
      const nextTime = new Date(new Date(msg.notified_at).getTime() + 5 * 3600 * 1000);
      const diffMs = nextTime.getTime() - now.getTime();
      
      if (diffMs > 0) {
        const hrsLeft = Math.floor(diffMs / 3600000);
        const minsLeft = Math.floor((diffMs % 3600000) / 60000);
        timerText = `🔔 Уведомлен (Повтор через ${hrsLeft}ч ${minsLeft}м)`;
        statusColor = "#D69E2E"; // Желтый/оранжевый
        bgColor = "rgba(214, 158, 46, 0.1)";
        progress = Math.max(0, Math.min(100, 100 - (diffMs / (5 * 3600000)) * 100)); // прогресс от 0 до 100% за 5 часов
      } else {
        timerText = "❗️ Ожидает уведомления (Очередь)";
        statusColor = "#E53E3E"; // Красный
        bgColor = "rgba(229, 62, 62, 0.1)";
        progress = 100;
      }
    } else {
      // Первое ожидание (до первого уведомления)
      const timeLeft = msg.time_left_hours || 0;
      if (timeLeft > 0) {
        const hrsLeft = Math.floor(timeLeft);
        const minsLeft = Math.floor((timeLeft - hrsLeft) * 60);
        timerText = `🟢 Ожидаем ответа (Осталось ${hrsLeft}ч ${minsLeft}м)`;
        statusColor = "#38A169"; // Зеленый
        bgColor = "rgba(56, 161, 105, 0.1)";
        progress = Math.max(0, Math.min(100, ((5 - timeLeft) / 5) * 100));
      } else {
        timerText = "❗️ Ожидает уведомления (Просрочено)";
        statusColor = "#E53E3E"; // Красный
        bgColor = "rgba(229, 62, 62, 0.1)";
        progress = 100;
      }
    }

    return (
      <div key={`${msg.chat_id}_${msg.topic_id}`} className="reminderItem" style={{ flexDirection: 'column', alignItems: 'flex-start', borderLeft: `4px solid ${statusColor}`, padding: '16px', gap: 12 }}>
        
        {/* Заголовок и статус */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <h3 style={{ margin: 0, fontSize: 17, color: 'var(--text-dark)', fontWeight: 'bold', wordBreak: 'break-word', display: 'flex', alignItems: 'center', gap: 8 }}>
              {msg.chat_title}
              {msg.topic_title && <span style={{ color: 'var(--primary-pink)', fontSize: 13, fontWeight: 'normal', background: 'rgba(255,107,158,0.1)', padding: '2px 8px', borderRadius: 10 }}>{msg.topic_title}</span>}
            </h3>
            <div style={{ fontSize: 12, color: '#888', marginTop: 6, display: 'flex', gap: 12 }}>
              <span>От: <strong style={{ color: '#555' }}>{msg.sender_id === 7915041131 ? 'вас' : msg.sender_id || 'Неизвестно'}</strong></span>
              <span>Время: <strong style={{ color: '#555' }}>{passedStr}</strong> назад</span>
            </div>
          </div>
          
          <div style={{ 
            fontSize: 12, 
            padding: '6px 12px', 
            borderRadius: 8, 
            background: bgColor, 
            color: statusColor,
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            boxShadow: `0 2px 5px ${bgColor.replace('0.1)', '0.3)')}`
          }}>
            {timerText}
          </div>
        </div>
        
        {/* Текст сообщения */}
        <div style={{ 
          margin: '0', 
          fontSize: 14, 
          color: '#4a5568', 
          background: '#f7fafc', 
          padding: '12px 14px', 
          borderRadius: 8, 
          fontStyle: 'italic', 
          wordBreak: 'break-word', 
          width: '100%', 
          lineHeight: '1.5',
          borderLeft: '2px solid #e2e8f0'
        }}>
          «{msg.text_preview}»
        </div>
        
        {/* Прогресс-бар */}
        {progress > 0 && !msg.is_weekend && !msg.is_nighttime && (
          <div style={{ width: '100%', height: '6px', background: '#edf2f7', borderRadius: '3px', overflow: 'hidden', marginTop: 4 }}>
            <div style={{ 
              height: '100%', 
              width: `${progress}%`, 
              background: statusColor,
              borderRadius: '3px',
              transition: 'width 0.5s ease'
            }}></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <h2 className="botAdminTitle" style={{ marginBottom: 0 }}><Eye size={24} style={{ marginRight: 8 }} /> Игнор-Радар</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
            {lastUpdated ? `Обновлено: ${lastUpdated.toLocaleTimeString('ru-RU')}` : 'Загрузка...'}
          </span>
          <button className="botBtn" onClick={fetchIgnoreStatus} disabled={loading} style={{ padding: '6px 12px', fontSize: 12 }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : '🔄 Обновить'}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.02); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 107, 158, 0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 107, 158, 0.6); }
      `}} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <div className="glassPanel">
          <h3 style={{ fontSize: 16, marginBottom: 15, color: '#C53030', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C53030' }}></span> 
            Ждем ответа от других ({waitingForThem.length})
          </h3>
          <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '400px', overflowY: 'auto', overscrollBehavior: 'contain', paddingRight: 8 }}>
            {waitingForThem.length === 0 ? (
              <p style={{ fontSize: 14, color: '#888', textAlign: 'center', margin: '20px 0' }}>Все отлично! Никто вас не игнорирует.</p>
            ) : waitingForThem.map(renderCard)}
          </div>
        </div>

        <div className="glassPanel">
          <h3 style={{ fontSize: 16, marginBottom: 15, color: '#2F855A', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2F855A' }}></span> 
            Нужно ответить нам ({waitingForUs.length})
          </h3>
          <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '400px', overflowY: 'auto', overscrollBehavior: 'contain', paddingRight: 8 }}>
            {waitingForUs.length === 0 ? (
              <p style={{ fontSize: 14, color: '#888', textAlign: 'center', margin: '20px 0' }}>У вас нет неотвеченных диалогов.</p>
            ) : waitingForUs.map(renderCard)}
          </div>
        </div>
      </div>
    </div>
  );
}

function Blacklist() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newChat, setNewChat] = useState('');

  const fetchChats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bot/ignored_chats');
      if (res.ok) {
        const json = await res.json();
        setChats(json);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleAdd = async () => {
    if (!newChat.trim()) return;
    try {
      const res = await fetch('/api/bot/ignored_chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newChat.trim() })
      });
      if (res.ok) {
        setNewChat('');
        fetchChats();
      } else {
        alert("Ошибка при добавлении");
      }
    } catch (e) {
      alert("Ошибка при добавлении");
    }
  };

  const handleRemove = async (username: string) => {
    if (!confirm(`Удалить ${username} из черного списка?`)) return;
    try {
      const res = await fetch('/api/bot/ignored_chats', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      if (res.ok) {
        fetchChats();
      } else {
        alert("Ошибка при удалении");
      }
    } catch (e) {
      alert("Ошибка при удалении");
    }
  };

  return (
    <div className="glassPanel">
      <h2 className="botAdminTitle" style={{ marginBottom: 15 }}>Черный список чатов</h2>
      <p style={{ color: 'var(--text-light)', fontSize: 14, marginBottom: 20 }}>
        Боту не будут приходить уведомления из этих чатов, и они не будут отображаться в Игнор-радаре. Можно добавлять @username, названия чатов, или ID.
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input 
          type="text" 
          className="botInput" 
          placeholder="@username или Название чата" 
          value={newChat} 
          onChange={(e) => setNewChat(e.target.value)} 
          style={{ marginBottom: 0 }}
        />
        <button className="botBtn" onClick={handleAdd} disabled={!newChat.trim()}>
          <Plus size={20} />
        </button>
      </div>

      <div>
        {loading ? (
          <p style={{ color: 'var(--text-light)' }}>Загрузка...</p>
        ) : chats.length === 0 ? (
          <p style={{ color: 'var(--text-light)' }}>Список пуст</p>
        ) : (
          chats.map(chat => (
            <div key={chat.username} className="reminderItem" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {chat.username}
                  {chat.found ? (
                    <span style={{ fontSize: 11, background: 'rgba(47, 133, 90, 0.1)', color: '#2F855A', padding: '2px 8px', borderRadius: 10, fontWeight: 'normal' }}>чат найден, игнорируется</span>
                  ) : (
                    <span style={{ fontSize: 11, background: 'rgba(197, 48, 48, 0.1)', color: '#C53030', padding: '2px 8px', borderRadius: 10, fontWeight: 'normal' }}>не получилось найти чат по этим данным</span>
                  )}
                </h4>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>
                  Добавлено: {new Date(chat.added_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
              <Trash2 size={20} color="#E53E3E" style={{ cursor: 'pointer' }} onClick={() => handleRemove(chat.username)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
