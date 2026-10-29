import React, { useState, useEffect, useRef } from 'react';
import { getRoleProfile, PLATFORM_ROLES } from '../../utils/rbac';

export default function FloatingAiAssistant({
  activeNav,
  activeProject,
  activeWorkspaceTab,
  onTriggerAction,
  onNavigate,
  currentUserRole = 'Customer'
}) {
  const profile = getRoleProfile(currentUserRole);
  const isEngineer = currentUserRole === PLATFORM_ROLES.ENGINEER;
  const isAdmin = currentUserRole === PLATFORM_ROLES.ADMIN;

  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'm-1',
      sender: 'ai',
      text: isEngineer
        ? `Hello Er. ${profile.name.split(',')[0]}! I am your Professional Engineering AI. Ready for CAD layer audits, BOQ calculations, and site inspection reports.`
        : `Hello ${profile.name}! I am your LabourConnect Construction AI Assistant. What can I help you build or calculate today?`,
      quickActions: []
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Section 26: Context-Sensitive Suggestions based on active screen & tab
  const getContextSuggestions = () => {
    if (activeNav === 'projects' && activeWorkspaceTab === 'design') {
      return [
        { label: '📐 Modify room', prompt: 'Make the master bedroom 12 × 14 ft' },
        { label: '🚪 Add door/window', prompt: 'Add French balcony window to master bedroom' },
        { label: '🛋️ Design interior', prompt: 'Design modern living room with marble flooring and false ceiling' },
        { label: '🏠 Change exterior', prompt: 'Switch exterior style to modern Indian minimalist' },
        { label: '📏 Measure setbacks', prompt: 'Verify GHMC and CMDA road setbacks for this plot' }
      ];
    }
    if (activeNav === 'projects' && activeWorkspaceTab === 'cost') {
      return [
        { label: '💰 Why is cost high?', prompt: 'Explain why my estimate is ₹40.25 Lakh' },
        { label: '🧱 Show material costs', prompt: 'Breakdown cement, steel and brick quantities' },
        { label: '📊 Compare budget', prompt: 'Compare estimate with standard market rates' },
        { label: '📉 Find cost drivers', prompt: 'Suggest value engineering options to save 10% on structure' }
      ];
    }
    if (activeNav === 'projects' && activeWorkspaceTab === 'construction') {
      return [
        { label: '📅 What’s next?', prompt: 'What construction tasks are scheduled for this week?' },
        { label: '👷 Find workers', prompt: 'Find available 8-man mason gang for upcoming slab pour' },
        { label: '🚜 Find equipment', prompt: 'Rent 10/7 concrete mixer with operator for tomorrow' },
        { label: '🧱 Check materials', prompt: 'Check if UltraTech cement stock is sufficient for slab' },
        { label: '📊 Show progress', prompt: 'Summarize overall site completion milestone' }
      ];
    }
    if (activeNav === 'labours' || activeNav === 'engineers' || activeNav === 'equipment' || activeNav === 'materials' || activeNav === 'loans') {
      return [
        { label: '👷 Find workers', prompt: 'Find verified master masons in Chennai' },
        { label: '🚜 Find equipment', prompt: 'Find JCB backhoe rentals near Velachery' },
        { label: '🧱 Find materials', prompt: 'Compare UltraTech vs ACC cement price' },
        { label: '🏗️ Find engineers', prompt: 'Find structural engineer for foundation inspection' }
      ];
    }
    // Default Home Screen Context
    return [
      { label: '🏠 Start new project', prompt: 'I have a 40x60 plot. I want a 3BHK house with parking and pooja room budget 45 lakhs.' },
      { label: '📐 Design a house', prompt: 'Design a 2-floor modern duplex on 30x40 plot' },
      { label: '💰 Estimate a project', prompt: 'Estimate construction cost for 2,500 sq.ft villa in Chennai' }
    ];
  };

  const handleSend = (textToSend) => {
    const query = textToSend || inputVal;
    if (!query.trim()) return;

    // Add user message
    const newMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');
    setIsTyping(true);

    // Contextual Construction Intelligence Processing
    setTimeout(() => {
      let aiReply = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: '',
        actions: []
      };

      const lower = query.toLowerCase();

      if (lower.includes('design') || lower.includes('build') || lower.includes('3bhk') || lower.includes('40x60') || lower.includes('30x40') || lower.includes('plot') || lower.includes('lakh')) {
        aiReply.text = `I have analyzed your construction intent:
• Target: 2-Floor Modern House
• Engineering Scope: Full 2D Floor Plan, 3D Elevation, Structural BOQ & Material Breakdown.

Let's launch the **AI House Designer Studio** to configure your room zoning, setbacks, and generate your buildable blueprint.`;
        aiReply.actions = [
          { label: '🏠 Launch AI House Designer', handler: () => onTriggerAction('launch_house_designer', query) },
          { label: '📐 View 2D Floor Plan', handler: () => onTriggerAction('open_design_tab') }
        ];
      } else if (lower.includes('bedroom') || lower.includes('12') || lower.includes('14') || lower.includes('modify')) {
        aiReply.text = `📐 **Design Modification Calculated**:
• Current Master Bedroom: 13 × 15 ft (195 sq.ft)
• Requested: 12 × 14 ft (168 sq.ft)
• Affected Zones: Attached Bathroom (+15 sq.ft gained), Corridor circulation.
• Structural Check: Passed (IS 456 column grid intact).

Would you like me to apply this modification to your live project model?`;
        aiReply.actions = [
          { label: '✓ Apply Geometry Modification', handler: () => onTriggerAction('open_design_tab') }
        ];
      } else if (lower.includes('why') || lower.includes('cost') || lower.includes('estimate') || lower.includes('40') || lower.includes('45')) {
        aiReply.text = `💰 **Cost Driver Analysis (Estimate: ₹40,25,000)**:
1. **Civil & Structural (45%)**: ₹18.40L (Tata Tiscon Fe550D rebar + M25 concrete).
2. **Raw Materials (25%)**: ₹10.10L (1,240 bags UltraTech Cement + Class-1 Wire-Cut Red Bricks).
3. **Labour & Gangs (15%)**: ₹5.80L (Certified masons & bar benders).
4. **MEP & Finishing (15%)**: ₹5.95L (Finolex conduits + Kajaria 4x2 GVT).`;
        aiReply.actions = [
          { label: '📊 Open Detailed BOQ Breakdown', handler: () => onTriggerAction('open_cost_tab') }
        ];
      } else if (lower.includes('cement') || lower.includes('material') || lower.includes('steel')) {
        aiReply.text = `🧱 **Engineering Material Quantities**:
• Cement: **1,240 bags** (UltraTech 53 Grade)
• Steel Rebar: **8.4 tonnes** (Fe 550D)
• Bricks: **42,000 pieces** (Class-1 Red Clay)
• M-Sand: **185 m³** (Double Washed)

I have matched 2 verified wholesale distributors in your area ready for stage-wise delivery.`;
        aiReply.actions = [
          { label: '🚚 Request Supplier Quotes', handler: () => onNavigate('materials') }
        ];
      } else if (lower.includes('worker') || lower.includes('mason') || lower.includes('labour') || lower.includes('gang')) {
        aiReply.text = `👷 **Workforce Recommendation**:
For your structural phase, I recommend:
• **4 Master Masons** (Nagaraju / Ravi Kumar)
• **6 Helpers**
• **2 Licensed Wiremen** (Suresh Kumar)
• **2 Certified Plumbers** (Manjunath)`;
        aiReply.actions = [
          { label: '🔨 Book Masons on LabourConnect', handler: () => onNavigate('labours') }
        ];
      } else {
        aiReply.text = `Understood. I am tracking your project design, budget, active milestone tasks, and resource supplies. Let me know what you'd like to calculate or modify.`;
        aiReply.actions = [
          { label: '🏠 Go to Home', handler: () => onNavigate('home') },
          { label: '🏗️ View Projects', handler: () => onNavigate('projects') }
        ];
      }

      setMessages((prev) => [...prev, aiReply]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Small Floating Button (Bottom Right) - Section 1 */}
      <div 
        className="floating-ai-button-container"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999
        }}
      >
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: '#718B73',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.925rem',
              border: '1px solid #718B73',
              borderRadius: '30px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(113, 139, 115, 0.35), 0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: '1.2rem' }}>✨</span>
            <span>AI Assistant</span>
          </button>
        )}

        {/* AI Panel */}
        {isOpen && (
          <div
            style={{
              width: '410px',
              height: '590px',
              maxHeight: 'calc(100vh - 80px)',
              background: '#FFFFFF',
              border: '1px solid #E1E7DF',
              borderRadius: '20px',
              boxShadow: '0 24px 70px rgba(0,0,0,0.12), 0 0 25px rgba(113, 139, 115, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* AI Panel Header */}
            <div
              style={{
                padding: '14px 18px',
                background: '#FAFAF7',
                borderBottom: '1px solid #E1E7DF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#EAF0E8',
                    border: '1px solid #E1E7DF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#718B73',
                    fontWeight: 900,
                    fontSize: '1rem'
                  }}
                >
                  ✨
                </div>
                <div>
                  <div style={{ fontSize: '0.925rem', fontWeight: 800, color: '#26332A' }}>
                    AI Studio Assistant
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#68736A' }}>
                    Your civil & architectural assistant
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: '#EAF0E8',
                  border: 'none',
                  color: '#68736A',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem'
                }}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Quick Action Entry Point */}
            <div style={{ padding: '12px 16px', background: '#FAFAF7', borderBottom: '1px solid #E1E7DF' }}>
              {/* Flagship House Designer Button */}
              <button
                onClick={() => {
                  onTriggerAction('launch_house_designer', '40x60 plot 3BHK modern house with parking pooja room budget 45 lakhs');
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  background: '#EAF0E8',
                  border: '1px solid #718B73',
                  color: '#718B73',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  boxShadow: '0 2px 8px rgba(113, 139, 115, 0.12)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem' }}>🏠</span>
                  <span>Design a new house</span>
                </div>
                <span style={{ fontSize: '0.9rem' }}>→</span>
              </button>

              {/* 2-Column Capability Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {[
                  { label: '📐 Floor Plan', action: () => onTriggerAction('open_design_tab') },
                  { label: '💰 Estimate', action: () => onTriggerAction('open_cost_tab') },
                  { label: '🧱 Materials', action: () => onNavigate('materials') },
                  { label: '👷 Workers', action: () => onNavigate('labours') },
                  { label: '🚜 Equipment', action: () => onNavigate('equipment') },
                  { label: '📅 Schedule', action: () => onTriggerAction('open_construction_tab') }
                ].map((btn, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      btn.action();
                      setIsOpen(false);
                    }}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E1E7DF',
                      color: '#26332A',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#EAF0E8';
                      e.currentTarget.style.borderColor = '#718B73';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#E1E7DF';
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Messages Stream */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: '#FFFFFF'
              }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%'
                  }}
                >
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      background: m.sender === 'user' ? '#718B73' : '#FAFAF7',
                      color: m.sender === 'user' ? '#FFFFFF' : '#26332A',
                      border: m.sender === 'user' ? 'none' : '1px solid #E1E7DF',
                      fontSize: '0.825rem',
                      lineHeight: 1.45,
                      fontWeight: m.sender === 'user' ? 600 : 400,
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {m.text}
                  </div>

                  {/* Actions attached to message */}
                  {m.actions && m.actions.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {m.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            act.handler();
                            setIsOpen(false);
                          }}
                          style={{
                            background: '#EAF0E8',
                            border: '1px solid #718B73',
                            color: '#718B73',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textAlign: 'left',
                            cursor: 'pointer'
                          }}
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div style={{ alignSelf: 'flex-start', padding: '8px 12px', background: '#FAFAF7', border: '1px solid #E1E7DF', borderRadius: '12px', color: '#68736A', fontSize: '0.75rem' }}>
                  ✨ Calculating structural geometry & quantities...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Context Prompt Suggestions */}
            <div
              style={{
                padding: '8px 14px',
                borderTop: '1px solid #E1E7DF',
                background: '#FAFAF7',
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                whiteSpace: 'nowrap'
              }}
            >
              {getContextSuggestions().map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug.prompt)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E1E7DF',
                    color: '#68736A',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#718B73';
                    e.currentTarget.style.borderColor = '#718B73';
                    e.currentTarget.style.background = '#EAF0E8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#68736A';
                    e.currentTarget.style.borderColor = '#E1E7DF';
                    e.currentTarget.style.background = '#FFFFFF';
                  }}
                >
                  {sug.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div
              style={{
                padding: '12px 14px',
                background: '#FAFAF7',
                borderTop: '1px solid #E1E7DF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <input
                type="text"
                placeholder="Ask AI Assistant..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  border: '1px solid #E1E7DF',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: '#26332A',
                  fontSize: '0.84rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => handleSend()}
                style={{
                  background: '#718B73',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
