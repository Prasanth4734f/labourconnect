import React, { useState } from 'react';
import { 
  Truck, 
  HardHat, 
  Calendar, 
  Clock, 
  Fuel, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Plus, 
  FileText, 
  TrendingUp, 
  Wrench, 
  Activity,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HEAVY_EQUIPMENT } from '../../data/mockData';

export default function EquipmentPortal({ projects = [], onLogTelemetry, onUpdateRate }) {
  const [activeTab, setActiveTab] = useState('fleet'); // 'fleet', 'run_hours', 'fuel_log', 'bookings'
  const [selectedMachine, setSelectedMachine] = useState(HEAVY_EQUIPMENT[0] || null);
  
  // Daily Run Hours Logging State
  const [meterReading, setMeterReading] = useState('1428.5');
  const [hoursRunToday, setHoursRunToday] = useState('6.5');
  const [fuelConsumedLitres, setFuelConsumedLitres] = useState('42');
  const [siteLocation, setSiteLocation] = useState('Velachery Villa - Foundation & Trenching');
  const [operatorName, setOperatorName] = useState('Ramesh Kumar (Certified Operator)');
  const [logNotes, setLogNotes] = useState('Basement sump trenching and foundation rock breaking completed. Machine serviced.');
  const [logSuccess, setLogSuccess] = useState(false);

  // Machine Fleet State
  const [fleetList, setFleetList] = useState([
    {
      id: 'eq-101',
      name: 'JCB 3DX Super EcoXcellence Backhoe Loader',
      category: 'Earthmoving & Trenching',
      regNo: 'TN-09-CQ-8912',
      operator: 'Ramesh Kumar (Grade A)',
      status: 'On Site (Active)',
      currentSite: 'Modern 3BHK Residence, Velachery',
      dailyRate: 8500,
      hourlyRate: 1100,
      hoursRunTotal: 1428.5,
      fuelEfficiency: '6.4 L/hr',
      health: '98% Optimal',
      nextService: 'In 72 hours',
      image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'eq-102',
      name: 'Hydraulic Mobile Concrete Batching Mixer (10/7 CFT)',
      category: 'Concrete Batching',
      regNo: 'TN-09-EQ-4410',
      operator: 'Murugan (Mixer Master)',
      status: 'Reserved for Slab Pouring',
      currentSite: 'Greenfield Villa, Sholinganallur',
      dailyRate: 4500,
      hourlyRate: 650,
      hoursRunTotal: 840.0,
      fuelEfficiency: '3.2 L/hr',
      health: '100% Certified',
      nextService: 'In 120 hours',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'eq-103',
      name: 'Heavy Steel Scaffolding & Acro Props System (2,500 sq.ft set)',
      category: 'Shuttering & Staging',
      regNo: 'ST-SCF-094',
      operator: 'Site Delivery Crew',
      status: 'Dispatched to Site',
      currentSite: 'Velachery Villa Site',
      dailyRate: 3200,
      hourlyRate: 0,
      hoursRunTotal: 0,
      fuelEfficiency: 'N/A',
      health: '100% Inspected',
      nextService: 'Monthly Audit',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
    }
  ]);

  // Handle Log Submission
  const handleSubmitRunHourLog = (e) => {
    e.preventDefault();
    setLogSuccess(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => {
      setLogSuccess(false);
    }, 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1320px', margin: '0 auto' }}>
      {/* Workspace Header Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #101522 0%, #171f33 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          padding: '28px 32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(249, 115, 22, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.4rem' }}>🚜</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Authorized Machinery & Fleet Management Workspace
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Fleet Telemetry, Run Hours & Deployments
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '6px 0 0' }}>
            Real-time machine hour meters, certified operator tracking, diesel consumption logs, and site deployment billing.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(249, 115, 22, 0.12)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '14px', padding: '12px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#f97316', textTransform: 'uppercase', fontWeight: 700 }}>Active Fleet Units</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', fontFamily: 'monospace' }}>3 Deployed</div>
          </div>
          <div style={{ background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '14px', padding: '12px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>Today's Run Hours</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34d399', fontFamily: 'monospace' }}>18.5 hrs</div>
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
          { id: 'fleet', label: 'Fleet Inventory & Status', icon: '🚜', count: fleetList.length },
          { id: 'run_hours', label: 'Log Daily Run Hours & Diesel', icon: '⏱️', count: 'Live Meter' },
          { id: 'bookings', label: 'Site Deployment Schedule', icon: '📅', count: '2 Active Sites' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                minWidth: '220px',
                padding: '12px 20px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? '#f97316' : 'transparent',
                color: isActive ? '#080b11' : '#94a3b8',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
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
                  color: isActive ? '#000000' : '#64748b'
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FLEET INVENTORY & STATUS */}
      {activeTab === 'fleet' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
          {fleetList.map((machine) => (
            <div
              key={machine.id}
              style={{
                background: '#101522',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s, border-color 0.2s'
              }}
            >
              <div>
                <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                  <img 
                    src={machine.image} 
                    alt={machine.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div 
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(8, 11, 17, 0.9)',
                      border: '1px solid rgba(52, 211, 153, 0.4)',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#34d399',
                      backdropFilter: 'blur(8px)'
                    }}
                  >
                    ● {machine.status}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      background: 'rgba(249, 115, 22, 0.9)',
                      color: '#080b11',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}
                  >
                    Reg: {machine.regNo}
                  </div>
                </div>

                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
                    {machine.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#f97316', fontWeight: 600, marginBottom: '16px' }}>
                    {machine.category} • Operator: {machine.operator}
                  </div>

                  <div style={{ background: '#0b0f19', borderRadius: '12px', padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>DAILY RENTAL</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>₹{machine.dailyRate.toLocaleString('en-IN')} / day</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>HOURLY RATE</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fbbf24' }}>₹{machine.hourlyRate}/hr</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>TOTAL RUN HOURS</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>{machine.hoursRunTotal} hrs</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>FUEL CONSUMPTION</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>{machine.fuelEfficiency}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#f97316' }}>📍</span>
                    <span>Assigned Site: <strong>{machine.currentSite}</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '0 24px 24px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setSelectedMachine(machine);
                    setActiveTab('run_hours');
                  }}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    color: '#080b11',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Clock style={{ width: '16px', height: '16px' }} />
                  <span>Log Meter Reading</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: LOG DAILY RUN HOURS & DIESEL */}
      {activeTab === 'run_hours' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 460px) 1fr', gap: '28px' }}>
          {/* Form */}
          <div style={{ background: '#101522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock style={{ color: '#f97316' }} /> Submit Daily Machinery Telemetry Log
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '20px' }}>
              Submit verified hour meter timestamps and diesel fuel logs for automated client invoice generation.
            </p>

            <form onSubmit={handleSubmitRunHourLog} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Select Machinery
                </label>
                <select
                  value={selectedMachine?.id || ''}
                  onChange={(e) => setSelectedMachine(fleetList.find(m => m.id === e.target.value))}
                  style={{
                    width: '100%',
                    background: '#0b0f19',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                >
                  {fleetList.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.regNo})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                    Hour Meter Reading
                  </label>
                  <input
                    type="text"
                    value={meterReading}
                    onChange={(e) => setMeterReading(e.target.value)}
                    placeholder="e.g. 1428.5"
                    style={{
                      width: '100%',
                      background: '#0b0f19',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                    Hours Run Today
                  </label>
                  <input
                    type="text"
                    value={hoursRunToday}
                    onChange={(e) => setHoursRunToday(e.target.value)}
                    placeholder="e.g. 6.5"
                    style={{
                      width: '100%',
                      background: '#0b0f19',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      color: '#34d399',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                    Diesel Consumed (L)
                  </label>
                  <input
                    type="text"
                    value={fuelConsumedLitres}
                    onChange={(e) => setFuelConsumedLitres(e.target.value)}
                    placeholder="e.g. 42"
                    style={{
                      width: '100%',
                      background: '#0b0f19',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      color: '#fbbf24',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                    Operator In Charge
                  </label>
                  <input
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0b0f19',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Site Work Description & Operator Remarks
                </label>
                <textarea
                  rows={3}
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0b0f19',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              {logSuccess && (
                <div style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', borderRadius: '10px', padding: '12px', color: '#34d399', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 style={{ width: '18px', height: '18px' }} />
                  <span>Telemetry logged successfully! Invoice calculated for ₹{(parseFloat(hoursRunToday || 0) * 1100).toLocaleString('en-IN')}.</span>
                </div>
              )}

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #f97316, #d97706)',
                  color: '#080b11',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                Submit Machine Daily Run Log →
              </button>
            </form>
          </div>

          {/* Recent Log Records */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#101522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity style={{ color: '#34d399' }} /> Recent Verified Machine Shift Slips
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  {
                    id: 'shift-1',
                    date: 'Today, 08:00 AM - 03:30 PM',
                    machine: 'JCB 3DX (TN-09-CQ-8912)',
                    hours: '6.5 Run Hours',
                    diesel: '42 Litres',
                    task: 'Basement foundation pit excavation & rock breaking',
                    site: 'Velachery Villa Site',
                    status: 'Certified by Site Engineer'
                  },
                  {
                    id: 'shift-2',
                    date: 'Yesterday, 09:00 AM - 05:00 PM',
                    machine: 'Concrete Mixer 10/7 (TN-09-EQ-4410)',
                    hours: '7.0 Run Hours',
                    diesel: '22 Litres',
                    task: 'First floor slab concrete batching & pouring',
                    site: 'Velachery Villa Site',
                    status: 'Certified by Site Engineer'
                  }
                ].map((shift) => (
                  <div 
                    key={shift.id}
                    style={{
                      background: '#0b0f19',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '14px',
                      padding: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{shift.machine}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{shift.date} • {shift.site}</div>
                      </div>
                      <span style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                        {shift.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '10px' }}>
                      Task: {shift.task}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                      <span style={{ color: '#38bdf8' }}>⏱️ {shift.hours}</span>
                      <span style={{ color: '#fbbf24' }}>⛽ {shift.diesel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BOOKINGS & SCHEDULE */}
      {activeTab === 'bookings' && (
        <div style={{ background: '#101522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            Site Deployment Schedule & Mobilization Calendar
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '24px' }}>
            Confirmed site contracts, operator deployment schedules, and milestone escrow receipts.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#0b0f19', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#f97316', fontWeight: 800, fontSize: '0.8rem' }}>DEPLOYMENT #DEP-9912</span>
                <span style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>Active Contract</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>Modern 3BHK Villa (Velachery)</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '14px' }}>Client: Prasanth Kumar • 14 Days Site Deployment</p>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                <div>• Machine: <strong>JCB 3DX Backhoe Loader</strong></div>
                <div>• Operator: <strong>Ramesh Kumar (Certified)</strong></div>
                <div>• Total Contract Value: <strong>₹1,19,000 (Escrow Backed)</strong></div>
              </div>
            </div>

            <div style={{ background: '#0b0f19', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.8rem' }}>UPCOMING RESERVATION</span>
                <span style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>Starting Next Monday</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>Sholinganallur Duplex Residence</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '14px' }}>Client: Dr. Vivek Menon • 3 Days Slab Pouring</p>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                <div>• Machine: <strong>Hydraulic Mobile Concrete Mixer 10/7</strong></div>
                <div>• Operator: <strong>Murugan (Mixer Master)</strong></div>
                <div>• Total Contract Value: <strong>₹13,500</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
