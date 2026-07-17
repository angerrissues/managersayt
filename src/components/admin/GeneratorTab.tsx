"use client";

import React, { useState, useEffect } from 'react';
import { getBloggers } from '@/actions/admin';
import { sendQuestionnaire } from '@/actions/admin';
import { Loader2, Send } from 'lucide-react';
import type { Blogger } from '@/types/blogger';

const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', formats: ['Преролл', 'Интеграция 1 слот', 'Интеграция 2 слот', 'YT Shorts'] },
  { id: 'tiktok', label: 'TikTok', formats: ['Ролик'] },
  { id: 'instagram', label: 'Instagram', formats: ['Рилс', 'Стори'] },
  { id: 'telegram', label: 'Telegram', formats: ['Текстовый пост', 'Фотопост', 'Видеопост', 'Кружок + текст'] },
  { id: 'vk', label: 'VK', formats: ['Текстовый/фотопост', 'Клип'] },
  { id: 'twitch', label: 'Twitch', formats: ['Стрим'] },
  { id: 'likee', label: 'Likee', formats: ['Ролик'] }
];

export default function GeneratorTab() {
  const [bloggers, setBloggers] = useState<Blogger[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<Record<string, string[]>>({});
  const [selectedBloggers, setSelectedBloggers] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getBloggers().then(b => {
      setBloggers(b as unknown as Blogger[]);
      setLoading(false);
    });
  }, []);

  const togglePlatform = (pId: string) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(pId)) {
        // Remove platform and its selected formats
        const newFormats = { ...selectedFormats };
        delete newFormats[pId];
        setSelectedFormats(newFormats);
        return prev.filter(x => x !== pId);
      } else {
        return [...prev, pId];
      }
    });
  };

  const toggleFormat = (pId: string, format: string) => {
    setSelectedFormats(prev => {
      const current = prev[pId] || [];
      if (current.includes(format)) {
        return { ...prev, [pId]: current.filter(f => f !== format) };
      } else {
        return { ...prev, [pId]: [...current, format] };
      }
    });
  };

  const toggleBlogger = (id: string) => {
    setSelectedBloggers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleGenerate = async () => {
    if (selectedBloggers.length === 0) return alert('Выберите хотя бы одного блогера');
    
    let text = "";
    
    for (const bId of selectedBloggers) {
      const b = bloggers.find(x => x.id === bId);
      if (!b) continue;
      
      let bText = `${b.name}\n`;
      let addedAnyPlatform = false;
      
      // Ищем нужные соцсети
      Object.entries(b.socials || {}).forEach(([key, social]) => {
        const platformId = key.split('_')[0];
        const platformDef = PLATFORMS.find(p => p.id === platformId);
        
        if (selectedPlatforms.length === 0 || selectedPlatforms.includes(platformId)) {
          if (social.url) {
            bText += `${platformDef ? platformDef.label : platformId}: ${social.url}\n`;
            
            const formatsForPlatform = selectedFormats[platformId] || [];
            if (formatsForPlatform.length > 0) {
              formatsForPlatform.forEach(f => {
                bText += `${f} —\n`;
              });
            }
            
            bText += "\n";
            addedAnyPlatform = true;
          }
        }
      });
      
      // Добавляем блогера в итоговый текст, даже если у него нет ссылок на нужные платформы
      text += addedAnyPlatform ? bText : `${b.name}\n\n`;
    }
    
    if (!text.trim()) {
      return alert('Текст пуст. Попробуйте выбрать другие параметры.');
    }
    
    setSending(true);
    const res = await sendQuestionnaire(text.trim());
    setSending(false);
    
    if (res.success) {
      alert('Анкета успешно отправлена в Telegram!');
      setSelectedBloggers([]); 
      setSelectedPlatforms([]);
      setSelectedFormats({});
    } else {
      alert('Ошибка отправки: ' + res.error);
    }
  };

  if (loading) return <div style={{padding: 20, textAlign: 'center', color: '#888'}}>Загрузка блогеров...</div>;

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div className="glassPanel" style={{ marginBottom: 20 }}>
        <h2 className="botAdminTitle" style={{ marginBottom: 15 }}>Шаг 1. Выберите нужные соцсети и форматы</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {PLATFORMS.map(p => (
              <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: selectedPlatforms.includes(p.id) ? 'var(--primary-pink)' : 'rgba(0,0,0,0.1)', padding: '6px 12px', borderRadius: 20, color: 'var(--text-dark)', fontSize: 14, transition: '0.2s', border: '1px solid rgba(0,0,0,0.1)' }}>
                <input type="checkbox" style={{ display: 'none' }} checked={selectedPlatforms.includes(p.id)} onChange={() => togglePlatform(p.id)} />
                {p.label}
              </label>
            ))}
            {selectedPlatforms.length === 0 && <span style={{ color: '#888', fontSize: 14, alignSelf: 'center', marginLeft: 10 }}>(Выбраны все платформы)</span>}
          </div>

          {/* Render format selection for selected platforms */}
          {selectedPlatforms.map(pId => {
            const pDef = PLATFORMS.find(p => p.id === pId);
            if (!pDef || !pDef.formats || pDef.formats.length === 0) return null;
            const currentFormats = selectedFormats[pId] || [];

            return (
              <div key={`format-${pId}`} style={{ background: 'rgba(0,0,0,0.03)', padding: '10px 15px', borderRadius: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: 'var(--text-dark)' }}>Форматы для {pDef.label}:</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {pDef.formats.map(f => (
                    <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: currentFormats.includes(f) ? '#333' : 'white', color: currentFormats.includes(f) ? 'white' : '#333', border: '1px solid #ccc', padding: '4px 10px', borderRadius: 8, fontSize: 12, transition: '0.2s' }}>
                      <input type="checkbox" style={{ display: 'none' }} checked={currentFormats.includes(f)} onChange={() => toggleFormat(pId, f)} />
                      {f}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glassPanel" style={{ marginBottom: 20 }}>
        <h2 className="botAdminTitle" style={{ marginBottom: 15 }}>Шаг 2. Выберите блогеров</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 15 }}>
          {bloggers.map(b => (
            <label key={b.id} style={{ 
              display: 'flex', alignItems: 'center', gap: 12, padding: 12, 
              background: selectedBloggers.includes(b.id) ? 'rgba(255,107,158,0.1)' : 'rgba(0,0,0,0.02)', 
              borderRadius: 12, cursor: 'pointer',
              border: selectedBloggers.includes(b.id) ? '1px solid var(--primary-pink)' : '1px solid rgba(0,0,0,0.1)',
              transition: '0.2s'
            }}>
              <input 
                type="checkbox" 
                checked={selectedBloggers.includes(b.id)}
                onChange={() => toggleBlogger(b.id)}
                style={{ width: 18, height: 18, accentColor: 'var(--primary-pink)', flexShrink: 0 }}
              />
              <img src={b.avatarPath || "https://placehold.co/100x100?text=Avatar"} alt={b.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #eee' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--text-dark)', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
                <div style={{ color: '#888', fontSize: 12 }}>
                  {Object.keys(b.socials || {}).map(k => k.split('_')[0]).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', padding: '0 10px', boxSizing: 'border-box' }}>
        <button className="botBtn" onClick={handleGenerate} disabled={sending || selectedBloggers.length === 0} style={{ width: '100%', padding: 15, fontSize: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box', maxWidth: '100%' }}>
          {sending ? <Loader2 className="animate-spin" style={{ marginRight: 10 }} size={20}/> : <Send style={{ marginRight: 10 }} size={20}/>}
          {sending ? 'Отправка...' : 'Создать анкету и отправить в ТГ'}
        </button>
      </div>
    </div>
  );
}
