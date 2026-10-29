import React, { useState } from 'react';
import { Send, Users } from 'lucide-react';
import { SAMPLE_CHAT_MESSAGES } from '../../data/mockData';

export default function ProjectWorkspaceChat() {
  const [messages, setMessages] = useState(SAMPLE_CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderRole: 'customer',
      senderName: 'You (Project Owner)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputText,
      attachment: null
    };

    setMessages([...messages, newMsg]);
    setInputText('');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'engineer':
        return <span className="lc-badge lc-badge-indigo">CONSULTING ENGINEER</span>;
      case 'worker':
        return <span className="lc-badge lc-badge-amber">MASTER MASON GANG</span>;
      case 'supplier':
        return <span className="lc-badge lc-badge-rose">CEMENT SUPPLIER</span>;
      default:
        return <span className="lc-badge lc-badge-cyan">HOME OWNER</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="lc-card lc-card-banner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}>
              <Users style={{ width: '24px', height: '24px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                Project Collaboration Room • 3BHK Duplex
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Direct communication between Home Owner, Structural Engineer, Masonry Gangs, and Material Suppliers.
              </p>
            </div>
          </div>

          <span className="lc-badge lc-badge-emerald">4 Active Participants</span>
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="lc-card" style={{ display: 'flex', flexDirection: 'column', height: '520px', justifyContent: 'space-between', padding: '20px' }}>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
          {messages.map(msg => (
            <div 
              key={msg.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                flexDirection: msg.senderRole === 'customer' ? 'row-reverse' : 'row'
              }}
            >
              <img 
                src={msg.avatar}
                alt={msg.senderName}
                style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}
              />

              <div style={{
                maxWidth: '70%',
                background: msg.senderRole === 'customer' ? 'rgba(245, 158, 11, 0.14)' : '#0a0e1a',
                border: msg.senderRole === 'customer' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                padding: '14px 18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#ffffff' }}>{msg.senderName}</span>
                    {getRoleBadge(msg.senderRole)}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>{msg.time}</span>
                </div>

                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.45' }}>{msg.text}</p>

                {msg.attachment && (
                  <div style={{ marginTop: '10px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={msg.attachment} alt="Attachment" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Type a message or milestone update to site crew..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="lc-input"
            style={{ flex: 1, fontSize: '0.85rem' }}
          />
          <button type="submit" className="lc-btn lc-btn-primary">
            <Send style={{ width: '15px', height: '15px' }} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
