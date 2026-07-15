"use client";

import React, { useState, useEffect } from 'react';
import { Send, Loader2, Bell, Clock, Plus, Trash2 } from 'lucide-react';
import { useAdmin } from '@/components/shared/AdminProvider';
import './admin.css';

// РџРѕР»СѓС‡Р°РµРј URL Р±СЌРєРµРЅРґР° Р±РѕС‚Р° РёР· РїРµСЂРµРјРµРЅРЅС‹С… РѕРєСЂСѓР¶РµРЅРёСЏ. Р•СЃР»Рё РЅРµ Р·Р°РґР°РЅ - РёСЃРїРѕР»СЊР·СѓРµРј Р»РѕРєР°Р»СЊРЅС‹Р№
const API_BASE = process.env.NEXT_PUBLIC_BOT_API || 'http://localhost:8080';

export default function AdminPage() {
  const { isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState('reminders');

  if (!isAdmin) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: '#111' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Р”РѕСЃС‚СѓРї Р·Р°РєСЂС‹С‚</h1>
          <p style={{ color: '#888' }}>РЈ РІР°СЃ РЅРµС‚ РїСЂР°РІ РґР»СЏ РїСЂРѕСЃРјРѕС‚СЂР° СЌС‚РѕР№ СЃС‚СЂР°РЅРёС†С‹.</p>
          <p style={{ color: '#555', fontSize: '12px', marginTop: '20px' }}>(РќР°Р¶РјРёС‚Рµ Ctrl+Alt+Y РґР»СЏ РІС…РѕРґР°)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="botAdminBody">
      <div className="appContainer">
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 className="botAdminTitle" style={{ justifyContent: 'center' }}>РџР°РЅРµР»СЊ РЈРїСЂР°РІР»РµРЅРёСЏ</h1>
          <p style={{ color: 'var(--text-light)', marginTop: -10 }}>РђРіРµРЅС‚СЃС‚РІРѕ 82 (Telegram Bot)</p>
        </div>

        <div className="botTabs">
          <div 
            className={`botTab ${activeTab === 'reminders' ? 'active' : ''}`}
            onClick={() => setActiveTab('reminders')}
          >
            РќР°РїРѕРјРёРЅР°РЅРёСЏ
          </div>
          <div 
            className={`botTab ${activeTab === 'broadcast' ? 'active' : ''}`}
            onClick={() => setActiveTab('broadcast')}
          >
            Р Р°СЃСЃС‹Р»РєР°
          </div>
          <div 
            className={`botTab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Р§Р°С‚ СЃ РР
          </div>
        </div>

        {activeTab === 'reminders' && <Reminders />}
        {activeTab === 'broadcast' && <Broadcast />}
        {activeTab === 'chat' && <AIChat />}
        
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
    
    if (!confirm('Р’С‹ СѓРІРµСЂРµРЅС‹, С‡С‚Рѕ С…РѕС‚РёС‚Рµ РѕС‚РїСЂР°РІРёС‚СЊ СЌС‚Рѕ СЃРѕРѕР±С‰РµРЅРёРµ Р’РЎР•Рњ Р±Р»РѕРіРµСЂР°Рј?')) return;

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
        setStatus({ type: 'success', text: `РЈСЃРїРµС€РЅРѕ РѕС‚РїСЂР°РІР»РµРЅРѕ ${data.sent} Р±Р»РѕРіРµСЂР°Рј!` });
        setMessage('');
      } else {
        setStatus({ type: 'error', text: data.error || 'РџСЂРѕРёР·РѕС€Р»Р° РѕС€РёР±РєР°' });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'РћС€РёР±РєР° СЃРѕРµРґРёРЅРµРЅРёСЏ СЃ СЃРµСЂРІРµСЂРѕРј Р±РѕС‚Р°. РџСЂРѕРІРµСЂСЊС‚Рµ, С‡С‚Рѕ Р±РѕС‚ Р·Р°РїСѓС‰РµРЅ.' });
    }
    setLoading(false);
  };

  return (
    <div className="glassPanel">
      <h2 className="botAdminTitle" style={{ marginBottom: 15 }}><Send size={24} style={{ marginRight: 8 }} /> РњР°СЃСЃРѕРІР°СЏ СЂР°СЃСЃС‹Р»РєР°</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>
        Р­С‚Рѕ СЃРѕРѕР±С‰РµРЅРёРµ Р±СѓРґРµС‚ РѕС‚РїСЂР°РІР»РµРЅРѕ РІСЃРµРј С‡Р°С‚Р°Рј РёР· РїР°РїРєРё "Р±Р»РѕРіРµСЂС‹" РѕС‚ РІР°С€РµРіРѕ Р»РёС†Р°.
      </p>
      
      <textarea 
        className="botTextarea"
        rows={6} 
        placeholder="Р—РґСЂР°РІСЃС‚РІСѓР№С‚Рµ! РџРѕР¶Р°Р»СѓР№СЃС‚Р°, РїСЂРёС€Р»РёС‚Рµ Р°РєС‚СѓР°Р»СЊРЅСѓСЋ СЃС‚Р°С‚РёСЃС‚РёРєСѓ..."
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
        {loading ? 'РћС‚РїСЂР°РІРєР°...' : 'РћС‚РїСЂР°РІРёС‚СЊ РІСЃРµРј'}
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
    const interval = setInterval(fetchReminders, 10000); // refresh every 10s
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
        alert('РћС€РёР±РєР°: ' + (data.error || 'РќРµ СѓРґР°Р»РѕСЃСЊ РґРѕР±Р°РІРёС‚СЊ'));
      }
    } catch (e) {
      alert('РћС€РёР±РєР° СЃРѕРµРґРёРЅРµРЅРёСЏ СЃ СЃРµСЂРІРµСЂРѕРј Р±РѕС‚Р°');
    }
    setLoading(false);
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
    if (!confirm('РЈРґР°Р»РёС‚СЊ РЅР°РїРѕРјРёРЅР°РЅРёРµ?')) return;
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
        <h2 className="botAdminTitle" style={{ marginBottom: 15 }}><Plus size={24} style={{ marginRight: 8 }} /> РќРѕРІРѕРµ РЅР°РїРѕРјРёРЅР°РЅРёРµ</h2>
        
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
            <option value="1">1 С‡Р°СЃ</option>
            <option value="3">3 С‡Р°СЃР°</option>
            <option value="5">5 С‡Р°СЃРѕРІ</option>
            <option value="12">12 С‡Р°СЃРѕРІ</option>
            <option value="24">24 С‡Р°СЃР°</option>
          </select>
        </div>
        
        <textarea 
          className="botTextarea"
          rows={3} 
          placeholder="РќР°РїРѕРјРёРЅР°СЋ, РЅСѓР¶РЅРѕ РѕР±РЅРѕРІРёС‚СЊ СЃС†РµРЅР°СЂРёР№!"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        
        <button className="botBtn" onClick={handleAdd} disabled={loading || !newUsername || !newMessage} style={{ padding: '8px 16px' }}>
          Р”РѕР±Р°РІРёС‚СЊ
        </button>
      </div>

      <div className="glassPanel">
        <h2 className="botAdminTitle" style={{ marginBottom: 15 }}><Bell size={24} style={{ marginRight: 8 }} /> РђРєС‚РёРІРЅС‹Рµ РЅР°РїРѕРјРёРЅР°РЅРёСЏ</h2>
        
        {reminders.length === 0 ? (
          <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>РќРµС‚ Р°РєС‚РёРІРЅС‹С… РЅР°РїРѕРјРёРЅР°РЅРёР№</p>
        ) : (
          reminders.map(rem => (
            <div key={rem.id} className="reminderItem" style={{ opacity: rem.is_active ? 1 : 0.6 }}>
              <div className="reminderInfo">
                <h4>{rem.username} <span style={{ fontSize: 12, color: 'var(--primary-pink)' }}><Clock size={12} style={{verticalAlign: 'middle'}}/> РљР°Р¶РґС‹Рµ {rem.interval_hours} С‡.</span></h4>
                <p>{rem.message.length > 50 ? rem.message.substring(0, 50) + '...' : rem.message}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
        setMessages(prev => [...prev, { role: 'ai', text: `РћС€РёР±РєР°: ${data.error}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'РћС€РёР±РєР° СЃРѕРµРґРёРЅРµРЅРёСЏ СЃ СЃРµСЂРІРµСЂРѕРј Р±РѕС‚Р°.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="glassPanel" style={{ display: 'flex', flexDirection: 'column', height: '60vh' }}>
      <h2 className="botAdminTitle" style={{ marginBottom: 15 }}>Р§Р°С‚ СЃ РЅРµР№СЂРѕСЃРµС‚СЊСЋ</h2>
      
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 15, padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
        {messages.length === 0 ? (
          <p style={{ color: 'var(--text-light)', textAlign: 'center', marginTop: 20 }}>Р—Р°РґР°Р№С‚Рµ РІРѕРїСЂРѕСЃ РїРѕ Р±Р°Р·Рµ РґР°РЅРЅС‹С… Р°РіРµРЅС‚СЃС‚РІР°...</p>
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
        {loading && <div style={{ color: 'var(--text-light)', fontSize: 12 }}>РќРµР№СЂРѕСЃРµС‚СЊ РїРµС‡Р°С‚Р°РµС‚...</div>}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <input 
          className="botInput"
          type="text" 
          placeholder="РќР°РїРёС€РёС‚Рµ СЃРѕРѕР±С‰РµРЅРёРµ..." 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          style={{ flex: 1 }}
        />
        <button className="botBtn" onClick={handleSend} disabled={loading || !input.trim()}>
          РћС‚РїСЂР°РІРёС‚СЊ
        </button>
      </div>
    </div>
  );
}

