import React, { useState } from 'react';

export default function MaterialProvidersScreen({ providers, onOrderSuccess }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quoteModal, setQuoteModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [orderItem, setOrderItem] = useState('');
  const [quantity, setQuantity] = useState('100 bags');

  const categories = [
    { id: 'all', label: 'All Materials' },
    { id: 'cement', label: 'Cement & Sand' },
    { id: 'steel', label: 'Steel & TMT Rebar' },
    { id: 'bricks', label: 'Bricks & AAC Blocks' },
    { id: 'tiles', label: 'Tiles & Sanitary' }
  ];

  const filteredProviders = (providers || []).filter((prov) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'cement') return prov.category?.toLowerCase().includes('cement');
    if (selectedCategory === 'steel') return prov.category?.toLowerCase().includes('steel');
    if (selectedCategory === 'bricks') return prov.category?.toLowerCase().includes('brick');
    if (selectedCategory === 'tiles') return prov.category?.toLowerCase().includes('tile');
    return true;
  });

  return (
    <div className="material-providers-screen" style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Direct Material Providers & Wholesale Mandi
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            Procure IS-compliant cement, primary Tata/JSW steel, wire-cut bricks & river sand at live wholesale rates
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              background: selectedCategory === cat.id ? '#f59e0b' : 'rgba(255, 255, 255, 0.04)',
              color: selectedCategory === cat.id ? '#080b11' : '#94a3b8',
              border: selectedCategory === cat.id ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Providers Grid (Screen 23 & 24) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
        {filteredProviders.map((prov) => (
          <div
            key={prov.id}
            style={{
              background: '#101522',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, border-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '0.725rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>
                  {prov.category}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                  {prov.company}
                </h3>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24' }}>
                ★ {prov.rating}
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, marginBottom: '6px' }}>
              ✓ {prov.verification}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>
              📍 {prov.serviceArea} • {prov.delivery}
            </div>

            {/* Products Table */}
            <div style={{ background: '#0b0f19', borderRadius: '10px', padding: '12px', marginBottom: '18px', flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginBottom: '8px' }}>
                AVAILABLE INVENTORY & LIVE RATES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {prov.products.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderBottom: idx !== prov.products.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', paddingBottom: '6px' }}>
                    <div>
                      <div style={{ color: '#e2e8f0', fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Min: {p.min}</div>
                    </div>
                    <span style={{ fontWeight: 700, color: '#34d399' }}>{p.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedProvider(prov);
                setOrderItem(prov.products[0].name);
                setQuoteModal(true);
              }}
              style={{
                width: '100%',
                background: '#f59e0b',
                color: '#080b11',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Request Bulk Quote / Order
            </button>
          </div>
        ))}
      </div>

      {/* Quote Modal */}
      {quoteModal && selectedProvider && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div style={{ background: '#101522', width: '480px', borderRadius: '18px', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              Request Material Supply
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>
              Supplier: <strong style={{ color: '#fff' }}>{selectedProvider.company}</strong>
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Select Material</label>
              <select
                value={orderItem}
                onChange={(e) => setOrderItem(e.target.value)}
                style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }}
              >
                {selectedProvider.products.map((p, i) => (
                  <option key={i} value={p.name}>{p.name} - {p.price}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Required Quantity</label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setQuoteModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: '8px 14px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => {
                  onOrderSuccess({
                    supplier: selectedProvider.company,
                    item: orderItem,
                    quantity
                  });
                  setQuoteModal(false);
                  alert(`Quote request of ${quantity} ${orderItem} dispatched to ${selectedProvider.company}! Supplier dispatch team will contact you.`);
                }}
                style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                Send Procurement Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
