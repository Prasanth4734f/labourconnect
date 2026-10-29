import React, { useState } from 'react';

export default function ProjectChatScreen({ messages = [], onSendMessage }) {
  const [chatList, setChatList] = useState(messages);
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderRole: 'customer',
      senderName: 'Prasanth Kumar (Owner)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      time: 'Just now',
      text,
      attachment: null
    };
    setChatList([...chatList, newMsg]);
    setText('');
  };

  return (
    <div className="project-chat-screen" style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px 0 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Project Site Chat & Team Channel
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Real-time coordination channel between Owner, Consulting Engineer, Lead Mason & Material Suppliers
        </p>
      </div>

      {/* Chat Container */}
      <div
        style={{
          background: '#101522',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          height: '560px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Chat Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {chatList.map((m) => (
            <div key={m.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <img src={m.avatar} alt={m.senderName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{m.senderName}</span>
                  <span style={{ fontSize: '0.7rem', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 600 }}>• {m.senderRole}</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: 'auto' }}>{m.time}</span>
                </div>
                <div style={{ background: '#0b0f19', padding: '12px 16px', borderRadius: '12px', color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.45, border: '1px solid rgba(255,255,255,0.04)' }}>
                  {m.text}
                  {m.attachment && (
                    <div style={{ marginTop: '10px' }}>
                      <img src={m.attachment} alt="site snapshot" style={{ maxWidth: '240px', borderRadius: '8px', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '14px 20px', background: '#0b0f19', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }} title="Attach site photo">📷</button>
          <input
            type="text"
            placeholder="Type your message to project stakeholders..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{ flex: 1, background: '#101522', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
          />
          <button
            onClick={handleSend}
            style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
