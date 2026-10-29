import React, { useState } from 'react';
import { 
  Bell, 
  FileText, 
  CreditCard, 
  Bookmark, 
  User, 
  Settings, 
  ShieldCheck, 
  Download, 
  ChevronRight,
  Clock,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { getRoleProfile, PLATFORM_ROLES } from '../../utils/rbac';
import PaymentsScreen from './PaymentsScreen';
import BookingsScreen from './BookingsScreen';
import ProfileScreen from './ProfileScreen';

export default function MoreScreen({
  bookings = [],
  currentUserRole = 'Customer',
  onRoleChange,
  onOpenAuthModal
}) {
  const [activeSubTab, setActiveSubTab] = useState('menu'); // 'menu', 'notifications', 'documents', 'payments', 'bookings', 'profile'

  const profile = getRoleProfile(currentUserRole);

  const getRoleSpecificDocs = () => {
    switch (currentUserRole) {
      case PLATFORM_ROLES.ENGINEER:
        return [
          { id: 'doc-1', title: 'Chartered Structural Stability Certificate', type: 'PDF', size: '3.1 MB', date: '02 Oct 2026', status: 'Stamped & Verified' },
          { id: 'doc-2', title: 'IS 456 RCC Column Reinforcement & Beam Schedule', type: 'CAD / DWG', size: '9.4 MB', date: '28 Sep 2026', status: 'Approved' },
          { id: 'doc-3', title: '7-Day & 28-Day Concrete Cube Compression Strength Log', type: 'PDF', size: '1.4 MB', date: '01 Oct 2026', status: 'Tested (M25 Pass)' },
          { id: 'doc-4', title: 'CMDA Building Sanction Structural Drawing Set', type: 'PDF', size: '4.8 MB', date: '15 Sep 2026', status: 'Municipal Approved' }
        ];
      case PLATFORM_ROLES.LABOUR:
        return [
          { id: 'doc-1', title: 'Daily Gang Muster Roll & Wage Sheet (10 Masons)', type: 'PDF', size: '1.1 MB', date: 'Today', status: 'Verified' },
          { id: 'doc-2', title: 'Site Formwork & Shuttering Safety Compliance Card', type: 'PDF', size: '820 KB', date: '01 Oct 2026', status: 'Active' },
          { id: 'doc-3', title: 'Mason Contractor Work Agreement & Rate Card', type: 'PDF', size: '1.5 MB', date: '15 Sep 2026', status: 'Signed' }
        ];
      case PLATFORM_ROLES.EQUIPMENT:
        return [
          { id: 'doc-1', title: 'JCB 3DX RTO Fitness & Insurance Certificate', type: 'PDF', size: '2.1 MB', date: 'Valid till 2027', status: 'Certified' },
          { id: 'doc-2', title: 'Daily Machine Run Hours & Fuel Log Slip', type: 'PDF', size: '780 KB', date: 'Today', status: 'Logged' },
          { id: 'doc-3', title: 'Machinery Rental Agreement & Operator Indemnity', type: 'PDF', size: '1.4 MB', date: '20 Sep 2026', status: 'Active' }
        ];
      case PLATFORM_ROLES.MATERIAL:
        return [
          { id: 'doc-1', title: 'Delivery Challan #DC-88412 (150 Bags UltraTech Cement)', type: 'PDF', size: '1.2 MB', date: 'Today', status: 'Delivered' },
          { id: 'doc-2', title: 'Tata Tiscon 550D Mill Test Certificate (MTC Heat #89412)', type: 'PDF', size: '1.8 MB', date: '28 Sep 2026', status: 'Verified' },
          { id: 'doc-3', title: 'GST Tax Invoice & E-Way Bill Summary', type: 'PDF', size: '1.5 MB', date: '01 Oct 2026', status: 'Cleared' }
        ];
      case PLATFORM_ROLES.LOAN:
        return [
          { id: 'doc-1', title: 'Home Construction Loan Sanction Letter (₹35,00,000)', type: 'PDF', size: '2.8 MB', date: '10 Sep 2026', status: 'Sanctioned' },
          { id: 'doc-2', title: '30-Year Encumbrance Certificate & Legal Scrutiny Report', type: 'PDF', size: '4.2 MB', date: '05 Sep 2026', status: 'Clear Title' },
          { id: 'doc-3', title: 'Bank Valuer Stage-Wise Construction Progress Assessment', type: 'PDF', size: '2.1 MB', date: '02 Oct 2026', status: 'Stage 3 Approved' }
        ];
      case PLATFORM_ROLES.CUSTOMER:
      default:
        return [
          { id: 'doc-1', title: 'Sanctioned Building Permit (BBMP / CMDA)', type: 'PDF', size: '2.4 MB', date: '12 Sep 2026', status: 'Approved' },
          { id: 'doc-2', title: 'Structural Stability & Rebar Schedule (IS 456)', type: 'CAD / DWG', size: '8.1 MB', date: '24 Sep 2026', status: 'Signed' },
          { id: 'doc-3', title: 'Tri-Party Contractor & Mason Agreement', type: 'PDF', size: '1.2 MB', date: '01 Oct 2026', status: 'Active' },
          { id: 'doc-4', title: 'Soil Test & Bearing Capacity Report (SBC)', type: 'PDF', size: '3.6 MB', date: '15 Aug 2026', status: 'Verified' }
        ];
    }
  };

  const sampleDocs = getRoleSpecificDocs();

  const sampleNotifications = [
    { id: 'notif-1', icon: '🏗️', title: 'Site Inspection Report Approved', desc: 'Er. Rajesh Varma submitted inspection report for Ground Floor Column Castings.', time: '10 mins ago', unread: true },
    { id: 'notif-2', icon: '🧱', title: 'Material Truck Dispatched', desc: '150 bags UltraTech 53 Grade Cement dispatched from Sri Balaji Materials yard.', time: '1 hour ago', unread: true },
    { id: 'notif-3', icon: '💳', title: 'Stage 2 Escrow Payout Released', desc: '₹3,50,000 released securely to Ravi Kumar (Mason Gang).', time: 'Yesterday', unread: false }
  ];

  const menuItems = [
    { id: 'notifications', title: 'Notifications & Alerts', desc: `Real-time updates tailored for ${profile.badge}`, icon: '🔔', badge: '3 New' },
    { id: 'documents', title: 'Documents & Verification Files', desc: `${sampleDocs.length} active verified files`, icon: '📄', badge: `${sampleDocs.length} Files` },
    { id: 'payments', title: currentUserRole === PLATFORM_ROLES.CUSTOMER ? 'Payments & Escrow' : 'Payouts & Escrow Releases', desc: currentUserRole === PLATFORM_ROLES.CUSTOMER ? 'Milestone balances & escrow releases' : 'Earnings, receipts & escrow disbursements', icon: '💳', badge: 'Verified' },
    { id: 'bookings', title: 'Active Assignments & Bookings', desc: `${bookings.length} current active assignments`, icon: '📅', badge: `${bookings.length} Active` },
    { id: 'profile', title: 'Platform Role & Profile', desc: `Authorized as ${profile.name} (${profile.badge})`, icon: '⚙️', badge: profile.badge }
  ];

  return (
    <div className="more-screen-container" style={{ maxWidth: '960px', margin: '0 auto', padding: '10px 0 60px' }}>
      {/* Subtab Breadcrumb / Back Navigation if not on menu */}
      {activeSubTab !== 'menu' && (
        <button
          onClick={() => setActiveSubTab('menu')}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '20px',
            fontWeight: 600
          }}
        >
          <span>←</span>
          <span>Back to More Menu</span>
        </button>
      )}

      {/* VIEW: MAIN MORE HUB MENU */}
      {activeSubTab === 'menu' && (
        <div>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Account & Settings
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              Manage notifications, documents, escrow payments, bookings, and role preferences
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                style={{
                  background: '#101522',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '1.5rem', width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {item.desc}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: '#fbbf24',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(245, 158, 11, 0.25)'
                    }}
                  >
                    {item.badge}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '1.1rem' }}>›</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: NOTIFICATIONS */}
      {activeSubTab === 'notifications' && (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
            Notifications & Site Alerts
          </h2>
          <div style={{ background: '#101522', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            {sampleNotifications.map((n, idx) => (
              <div
                key={n.id}
                style={{
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  borderBottom: idx < sampleNotifications.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  background: n.unread ? 'rgba(245, 158, 11, 0.04)' : 'transparent'
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>{n.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{n.title}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: DOCUMENTS */}
      {activeSubTab === 'documents' && (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
            Project Documents & Sanction Permits
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sampleDocs.map((doc) => (
              <div
                key={doc.id}
                style={{
                  background: '#101522',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ fontSize: '1.4rem', width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                    📄
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{doc.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{doc.type} • {doc.size} • Uploaded {doc.date}</div>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Downloading ${doc.title}...`)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download style={{ width: '14px', height: '14px' }} />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: PAYMENTS */}
      {activeSubTab === 'payments' && (
        <PaymentsScreen />
      )}

      {/* VIEW: BOOKINGS */}
      {activeSubTab === 'bookings' && (
        <BookingsScreen bookings={bookings} />
      )}

      {/* VIEW: PROFILE */}
      {activeSubTab === 'profile' && (
        <ProfileScreen
          onRoleChange={onRoleChange}
        />
      )}
    </div>
  );
}
