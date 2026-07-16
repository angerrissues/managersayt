"use client";

import React, { useState, useEffect } from 'react';
import { Send, Loader2, Bell, Clock, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useAdmin } from '@/components/shared/AdminProvider';
import './admin.css';

import { syncFolders } from '@/actions/admin';

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
        alert(`Синхронизация завершена успешно! Актуальных чатов в папках: ${res.count}`);
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
        </div>

        {activeTab === 'tasks' && <TasksTab />}
        {activeTab === 'reminders' && <Reminders />}
        {activeTab === 'broadcast' && <Broadcast />}
        {activeTab === 'chat' && <AIChat />}
        
      </div>
    </div>
  );
}

import { getActiveTasks, getCompletedTasks, saveTask, updateTaskStatus, deleteTask } from '@/actions/tasks';
import type { Task } from '@prisma/client';

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
      await saveTask({
        title,
        description,
        priority,
        deadline: deadline ? new Date(deadline) : undefined,
      });
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setDeadline('');
      fetchTasks();
    } catch (e) {
      alert("Ошибка создания задачи");
    }
    setLoading(false);
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
          <input className="botInput" style={{ flex: 2, minWidth: 200 }} placeholder="Название задачи" value={title} onChange={e => setTitle(e.target.value)} />
          <select className="botSelect" style={{ flex: 1, minWidth: 120 }} value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="LOW">Низкий (LOW)</option>
            <option value="MEDIUM">Средний (MEDIUM)</option>
            <option value="HIGH">Высокий (HIGH)</option>
          </select>
          <input className="botInput" type="datetime-local" style={{ flex: 1, minWidth: 150 }} value={deadline} onChange={e => setDeadline(e.target.value)} />
        </div>
        <textarea className="botTextarea" rows={2} placeholder="Описание (опционально)" value={description} onChange={e => setDescription(e.target.value)} style={{ marginBottom: 10 }} />
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
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {task.title}
                    {task.priority === 'HIGH' && <span style={{ background: '#E53E3E', color: 'white', fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>СРОЧНО</span>}
                  </h3>
                  {task.deadline && (
                    <span style={{ fontSize: 12, color: 'var(--primary-pink)', display: 'inline-flex', alignItems: 'center', marginTop: 4 }}>
                      <Clock size={12} style={{ marginRight: 4 }}/> Дедлайн: {new Date(task.deadline).toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select 
                    className="botSelect" 
                    value={task.status} 
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    style={{ padding: '4px 8px', fontSize: 12, height: 'auto' }}
                  >
                    <option value="NEW">Новая</option>
                    <option value="IN_PROGRESS">В процессе</option>
                    <option value="COMPLETED">Выполнено</option>
                  </select>
                  <Trash2 size={18} color="#E53E3E" style={{ cursor: 'pointer', alignSelf: 'center' }} onClick={() => handleDelete(task.id)} />
                </div>
              </div>
              {task.description && <p style={{ margin: 0, fontSize: 14, color: '#bbb' }}>{task.description}</p>}
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
