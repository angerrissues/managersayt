"use client";

import React, { useState, useEffect } from 'react';
import { getBloggers } from '@/actions/admin';
import { sendQuestionnaire } from '@/actions/admin';
import { Loader2, Send } from 'lucide-react';
import type { Blogger } from '@/types/blogger';

const PLATFORMS = [
  { id: 'youtube', label: 'YouTube' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'vk', label: 'VK' },
  { id: 'twitch', label: 'Twitch' },
  { id: 'likee', label: 'Likee' }
];

export default function GeneratorTab() {
  const [bloggers, setBloggers] = useState<Blogger[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedBloggers, setSelectedBloggers] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getBloggers().then(b => {
      setBloggers(b as unknown as Blogger[]);
      setLoading(false);
    });
  }, []);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const toggleBlogger = (id: string) => {
    setSelectedBloggers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleGenerate = async () => {
    if (selectedBloggers.length === 0) return alert('Выберите хотя бы одного блогера');
    
    // Формируем текст
    let text = "";
    
    for (const bId of selectedBloggers) {
      const b = bloggers.find(x => x.id === bId);
      if (!b) continue;
      
      let hasLinks = false;
      let bText = `${b.name}\n`;
      
      // Ищем нужные соцсети
      Object.entries(b.socials || {}).forEach(([key, social]) => {
        const platform = key.split('_')[0];
        if (selectedPlatforms.length === 0 || selectedPlatforms.includes(platform)) {
          if (social.url) {
            bText += `${social.url}\n`;
            hasLinks = true;
          }
        }
      });
      
      text += bText + "\n";
    }
    
    if (!text.trim()) {
      return alert('У выбранных блогеров нет ссылок для выбранных соцсетей.');
    }
    
    setSending(true);
    const res = await sendQuestionnaire(text.trim());
    setSending(false);
    
    if (res.success) {
      alert('Анкета успешно отправлена в Telegram!');
      setSelectedBloggers([]); // Сбрасываем выбор после успешной отправки
    } else {
      alert('Ошибка отправки: ' + res.error);
    }
  };

  if (loading) return <div style={{padding: 20, textAlign: 'center', color: '#888'}}>Загрузка блогеров...</div>;

  return (
    <div>
      <div className="glassPanel" style={{ marginBottom: 20 }}>
        <h2 className="botAdminTitle" style={{ marginBottom: 15 }}>Шаг 1. Выберите нужные соцсети</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {PLATFORMS.map(p => (
            <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: selectedPlatforms.includes(p.id) ? 'var(--primary-pink)' : '#333', padding: '6px 12px', borderRadius: 20, color: 'white', fontSize: 14, transition: '0.2s' }}>
              <input type="checkbox" style={{ display: 'none' }} checked={selectedPlatforms.includes(p.id)} onChange={() => togglePlatform(p.id)} />
              {p.label}
            </label>
          ))}
          {selectedPlatforms.length === 0 && <span style={{ color: '#888', fontSize: 14, alignSelf: 'center', marginLeft: 10 }}>(Если не выбрано ничего — берутся все соцсети)</span>}
        </div>
      </div>

      <div className="glassPanel" style={{ marginBottom: 20 }}>
        <h2 className="botAdminTitle" style={{ marginBottom: 15 }}>Шаг 2. Выберите блогеров</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 15 }}>
          {bloggers.map(b => (
            <label key={b.id} style={{ 
              display: 'flex', alignItems: 'center', gap: 12, padding: 12, 
              background: 'rgba(255,255,255,0.05)', borderRadius: 12, cursor: 'pointer',
              border: selectedBloggers.includes(b.id) ? '1px solid var(--primary-pink)' : '1px solid transparent',
              transition: '0.2s'
            }}>
              <input 
                type="checkbox" 
                checked={selectedBloggers.includes(b.id)}
                onChange={() => toggleBlogger(b.id)}
                style={{ width: 18, height: 18, accentColor: 'var(--primary-pink)', flexShrink: 0 }}
              />
              <img src={b.avatarPath || "https://placehold.co/100x100?text=Avatar"} alt={b.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
                <div style={{ color: '#888', fontSize: 12 }}>
                  {Object.keys(b.socials || {}).map(k => k.split('_')[0]).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button className="botBtn" onClick={handleGenerate} disabled={sending || selectedBloggers.length === 0} style={{ width: '100%', padding: 15, fontSize: 16, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {sending ? <Loader2 className="animate-spin" style={{ marginRight: 10 }} size={20}/> : <Send style={{ marginRight: 10 }} size={20}/>}
        {sending ? 'Отправка...' : 'Создать анкету и отправить в ТГ'}
      </button>
    </div>
  );
}
