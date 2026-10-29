import React, { useState } from 'react';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  CheckCircle2, 
  Search, 
  X 
} from 'lucide-react';
import { MATERIAL_PRICING } from '../../data/mockData';
import confetti from 'canvas-confetti';

export default function MaterialMarketplace() {
  const [materials, setMaterials] = useState(MATERIAL_PRICING);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderItem, setOrderItem] = useState(null);
  const [orderQty, setOrderQty] = useState(100);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const categories = [
    { id: 'all', label: 'All Materials' },
    { id: 'cement', label: 'Cement' },
    { id: 'steel', label: 'TMT Steel' },
    { id: 'sand', label: 'Sand' },
    { id: 'bricks', label: 'Bricks & Blocks' },
    { id: 'aggregate', label: 'Aggregates' }
  ];

  const filteredMaterials = materials.filter(m => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleConfirmOrder = (e) => {
    e.preventDefault();
    setOrderSuccess(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    setTimeout(() => {
      setOrderSuccess(false);
      setOrderItem(null);
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="lc-card lc-card-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(244, 63, 94, 0.2)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fb7185'
          }}>
            <Package style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              Direct Building Material Mandi & Spot Rates
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Procure UltraTech cement, Tata Tiscon steel, double-washed M-Sand, and red clay bricks directly from verified quarries and distributors.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="lc-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', maxWidth: '100%' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`lc-btn lc-btn-sm ${selectedCategory === cat.id ? 'lc-btn-primary' : 'lc-btn-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '240px' }}>
          <Search style={{ width: '15px', height: '15px', color: '#64748b', position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="lc-input"
            style={{ paddingLeft: '36px', fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* Materials Table */}
      <div className="lc-card">
        <div className="lc-table-wrap">
          <table className="lc-table">
            <thead>
              <tr>
                <th>Commodity</th>
                <th>Brand</th>
                <th>Supplier & Location</th>
                <th>Spot Price</th>
                <th>Trend</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map(mat => (
                <tr key={mat.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#ffffff' }}>{mat.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Min Order: {mat.minOrder} {mat.unit.split(' ')[0]}s</div>
                  </td>
                  <td style={{ color: '#cbd5e1', fontWeight: 700 }}>{mat.brand}</td>
                  <td>
                    <div style={{ color: '#94a3b8' }}>{mat.supplier}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{mat.city}</div>
                  </td>
                  <td>
                    <div className="text-mono font-bold" style={{ color: '#fbbf24', fontSize: '1rem' }}>
                      ₹{mat.price.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>/{mat.unit}</div>
                  </td>
                  <td>
                    {mat.trend === 'up' ? (
                      <span className="lc-badge lc-badge-rose">{mat.change}</span>
                    ) : mat.trend === 'down' ? (
                      <span className="lc-badge lc-badge-emerald">{mat.change}</span>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>— Stable</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => { setOrderItem(mat); setOrderQty(mat.minOrder); }}
                      className="lc-btn lc-btn-primary lc-btn-sm"
                    >
                      <ShoppingCart style={{ width: '14px', height: '14px' }} /> Buy Direct
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Modal */}
      {orderItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="lc-card" style={{ maxWidth: '440px', width: '100%', position: 'relative' }}>
            <button 
              onClick={() => setOrderItem(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
              Direct Material Procurement
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#fb7185', fontWeight: 600, marginBottom: '16px' }}>
              {orderItem.name}
            </p>

            <form onSubmit={handleConfirmOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="lc-form-group" style={{ marginBottom: 0 }}>
                <label className="lc-label">Quantity ({orderItem.unit})</label>
                <input 
                  type="number"
                  min={orderItem.minOrder}
                  step={orderItem.category === 'steel' ? '0.5' : '10'}
                  value={orderQty}
                  onChange={(e) => setOrderQty(Number(e.target.value))}
                  className="lc-input text-mono"
                  required
                />
              </div>

              <div style={{ background: '#0a0e1a', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Purchase Value:</span>
                <strong className="text-mono" style={{ fontSize: '1.1rem', color: '#34d399' }}>
                  ₹{Math.round(orderItem.price * orderQty).toLocaleString()}
                </strong>
              </div>

              {orderSuccess ? (
                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: '#34d399', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                  <span>Purchase order dispatched to supplier!</span>
                </div>
              ) : (
                <button type="submit" className="lc-btn lc-btn-primary" style={{ width: '100%', marginTop: '6px' }}>
                  <ShoppingCart style={{ width: '16px', height: '16px' }} /> Confirm Purchase Order
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
