import React, { useState } from 'react';
import { 
  Package, 
  TrendingUp, 
  Edit3, 
  Check, 
  Truck, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Filter, 
  Search,
  Building,
  Plus,
  FileText,
  Layers,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DAILY_MATERIAL_PRICES } from '../../data/mockData';

export default function SupplierPortal({ projects = [], onUpdateInventory, onConfirmOrder }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'rates', 'challans', 'certs'
  const [materialPrices, setMaterialPrices] = useState(DAILY_MATERIAL_PRICES);
  const [editingId, setEditingId] = useState(null);
  const [tempPrice, setTempPrice] = useState('');

  // Active Wholesale Supply Orders
  const [orders, setOrders] = useState([
    {
      id: 'ORD-8821',
      customer: 'Prasanth Kumar (Modern 3BHK Villa)',
      project: 'proj-1',
      items: 'UltraTech 53G Cement (150 Bags) + Tata Tiscon 550D TMT (2.5 Tonnes)',
      total: 215000,
      status: 'Dispatched',
      truckNo: 'TN-09-CB-4412',
      driver: 'Kannan (+91 98402 11009)',
      deliveryAddress: 'Plot #14, 2nd Main Road, Velachery, Chennai',
      date: 'Today, 09:30 AM'
    },
    {
      id: 'ORD-8822',
      customer: 'Dr. Vivek Menon (Glass Duplex)',
      project: 'proj-2',
      items: 'Tata Tiscon 550D TMT Steel (6.0 Tonnes) + Red Bricks (5,000 Pcs)',
      total: 445250,
      status: 'Processing at Yard',
      truckNo: 'TN-09-EQ-9011',
      driver: 'Pending Assignment',
      deliveryAddress: 'Site 18, Sholinganallur, Chennai',
      date: 'Today, 11:45 AM'
    }
  ]);

  // Delivery Challan Form State
  const [challanTruck, setChallanTruck] = useState('TN-09-CB-4412');
  const [challanWeightSlip, setChallanWeightSlip] = useState('WB-8819 (Gross: 24.5 MT, Tare: 8.2 MT, Net: 16.3 MT)');
  const [challanSuccess, setChallanSuccess] = useState(false);

  const handleEdit = (mat) => {
    setEditingId(mat.id);
    setTempPrice(mat.price.toString());
  };

  const handleSavePrice = (id) => {
    setMaterialPrices(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          price: parseFloat(tempPrice),
          change: 'Updated live just now'
        };
      }
      return m;
    }));
    setEditingId(null);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
  };

  const handleCreateChallan = (e) => {
    e.preventDefault();
    setChallanSuccess(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setChallanSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1320px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #160d2b 0%, #22143d 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          padding: '28px 32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(168, 85, 247, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.4rem' }}>🧱</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Authorized Wholesale Building Materials & Truck Dispatch Workspace
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Sri Balaji Wholesale Building Materials (Distributor Desk)
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '6px 0 0' }}>
            UltraTech Cement 53G, Tata Tiscon 550D TMT, Red Bricks & M-Sand daily wholesale pricing, truck dispatches & delivery challans.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '14px', padding: '12px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: 700 }}>Today's Dispatches</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', fontFamily: 'monospace' }}>4 Trucks (58 MT)</div>
          </div>
          <div style={{ background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '14px', padding: '12px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>Dispatched Value</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34d399', fontFamily: 'monospace' }}>₹6,60,250</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div 
        style={{
          display: 'flex',
          gap: '8px',
          background: '#0c101b',
          padding: '6px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflowX: 'auto'
        }}
      >
        {[
          { id: 'orders', label: 'Active Dispatches & Orders', icon: '🚚', count: `${orders.length} Active` },
          { id: 'rates', label: 'Live Wholesale Rate Board', icon: '📊', count: 'Direct BOQ' },
          { id: 'challans', label: 'Generate Delivery Challan & e-Way Bill', icon: '📄', count: 'Weighbridge' },
          { id: 'certs', label: 'Mill Test Certs (MTC)', icon: '🛡️', count: 'Tata Tiscon' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                minWidth: '220px',
                padding: '12px 18px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? '#a855f7' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span 
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#ffffff' : '#64748b'
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ACTIVE DISPATCHES & ORDERS */}
      {activeTab === 'orders' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: '#101522',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ color: '#c084fc', fontSize: '0.78rem', fontWeight: 800, fontFamily: 'monospace' }}>PO #{order.id}</span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '2px 0 0' }}>{order.customer}</h3>
                  </div>
                  <span style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                    ● {order.status}
                  </span>
                </div>

                <div style={{ background: '#0b0f19', borderRadius: '12px', padding: '14px', marginBottom: '14px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  <div><strong>Materials:</strong> {order.items}</div>
                  <div><strong>Delivery Destination:</strong> {order.deliveryAddress}</div>
                  <div><strong>Truck & Driver:</strong> {order.truckNo} • {order.driver}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Order Value (Escrow Secured)</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#34d399', fontFamily: 'monospace' }}>
                    ₹{order.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    alert(`Delivery Challan generated for ${order.id}!`);
                    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                  }}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Print Delivery Challan 📄
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: LIVE WHOLESALE RATE BOARD */}
      {activeTab === 'rates' && (
        <div style={{ background: '#101522', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '28px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Live Construction Material Pricing Matrix
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0' }}>
              Publish daily wholesale rates. In-app AI architectural BOQ engines automatically incorporate these rates into ready-to-build villa cost estimates.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {materialPrices.map((mat) => (
              <div 
                key={mat.id}
                style={{
                  background: '#0b0f19',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>{mat.name}</h4>
                    <span style={{ fontSize: '0.72rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      {mat.change}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '14px' }}>Unit: {mat.unit}</div>

                  {editingId === mat.id ? (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <input
                        type="text"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                        style={{
                          flex: 1,
                          background: '#101522',
                          border: '1px solid #c084fc',
                          padding: '6px 10px',
                          color: '#ffffff',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          fontFamily: 'monospace'
                        }}
                      />
                      <button
                        onClick={() => handleSavePrice(mat.id)}
                        style={{ background: '#a855f7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', fontFamily: 'monospace' }}>
                        ₹{mat.price.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => handleEdit(mat)}
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#c084fc', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Edit Rate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CHALLANS */}
      {activeTab === 'challans' && (
        <div style={{ background: '#101522', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
            Generate Delivery Challan & Digital E-Way Bill
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '24px' }}>
            Attach digital weighbridge slips and assign GPS truck vehicle numbers.
          </p>

          <form onSubmit={handleCreateChallan} style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Truck Registration Number</label>
              <input type="text" value={challanTruck} onChange={(e) => setChallanTruck(e.target.value)} style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.12)', padding: '10px 14px', color: '#ffffff', borderRadius: '8px' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Weighbridge Slip Summary</label>
              <input type="text" value={challanWeightSlip} onChange={(e) => setChallanWeightSlip(e.target.value)} style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.12)', padding: '10px 14px', color: '#ffffff', borderRadius: '8px' }} />
            </div>

            {challanSuccess && (
              <div style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', borderRadius: '10px', padding: '12px', color: '#34d399', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px' }} />
                <span>Challan issued and QR code dispatched to driver app & site engineer!</span>
              </div>
            )}

            <button type="submit" style={{ background: 'linear-gradient(135deg, #a855f7, #9333ea)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
              Issue Official Delivery Challan 🚚
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: CERTS */}
      {activeTab === 'certs' && (
        <div style={{ background: '#101522', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
            Mill Test Certificates (MTC) Repository
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '24px' }}>
            Official steel and cement lab test certificates synced to client municipal permit folders.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { title: 'Tata Tiscon 550D TMT Rebar (Heat #89412) - Yield Stress 565 MPa', type: 'PDF • 1.8 MB', date: '28 Sep 2026', status: 'BIS Certified (IS 1786)' },
              { title: 'UltraTech 53 Grade OPC Cement (Batch #UT-9901) - 28-Day Strength 58.5 MPa', type: 'PDF • 1.2 MB', date: '01 Oct 2026', status: 'IS 269 Compliant' }
            ].map((c, i) => (
              <div key={i} style={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>{c.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.date} • {c.type}</div>
                </div>
                <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(52, 211, 153, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                  ✓ {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
