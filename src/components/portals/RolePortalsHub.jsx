import React, { useState, useEffect } from 'react';
import CustomerPortal from './CustomerPortal';
import EngineerPortal from './EngineerPortal';
import ContractorPortal from './ContractorPortal';
import SupplierPortal from './SupplierPortal';
import BankLoanPortal from './BankLoanPortal';

export default function RolePortalsHub({
  projects,
  onUpdateProject,
  onNavigate,
  currentUserRole,
  onRoleChange
}) {
  // Map currentUserRole string to portal tab key
  const getInitialTab = (role) => {
    switch (role) {
      case 'Engineer / Architect': return 'engineer';
      case 'Labour':
      case 'Contractor': return 'contractor';
      case 'Material Provider': return 'supplier';
      case 'Loan Provider': return 'bank';
      default: return 'customer';
    }
  };

  const [activePortal, setActivePortal] = useState(getInitialTab(currentUserRole));

  useEffect(() => {
    setActivePortal(getInitialTab(currentUserRole));
  }, [currentUserRole]);

  const portalTabs = [
    { id: 'customer', label: 'Customer / Owner', roleName: 'Customer', icon: '🏡', badge: 'Live Escrow' },
    { id: 'engineer', label: 'Consulting Engineer', roleName: 'Engineer / Architect', icon: '👷', badge: 'Digital Site Logs' },
    { id: 'contractor', label: 'Contractor & Mason', roleName: 'Labour', icon: '🔨', badge: 'Gang Attendance' },
    { id: 'supplier', label: 'Material Supplier', roleName: 'Material Provider', icon: '🧱', badge: 'Dispatches' },
    { id: 'bank', label: 'Bank & Loan Officer', roleName: 'Loan Provider', icon: '🏦', badge: 'Tranche Approvals' }
  ];

  return (
    <div className="role-portals-hub" style={{ maxWidth: '1280px', margin: '0 auto', padding: '10px 0 60px' }}>
      {/* Portals Hub Header & Role Switcher Bar */}
      <div 
        style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E1E7DF',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.25rem' }}>👔</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#718B73', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Multi-Stakeholder Portal Hub
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#26332A', letterSpacing: '-0.02em', margin: 0 }}>
            Stakeholder Workspace
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#68736A', margin: '4px 0 0' }}>
            Seamlessly switch role perspectives across Owner, Engineer, Contractor, Supplier, and Bank Loan Officer
          </p>
        </div>

        {/* Current Active Role Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: '#68736A', display: 'block', fontWeight: 600 }}>SIMULATED PLATFORM ROLE</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#3D8056' }}>
              {currentUserRole || 'Customer'}
            </span>
          </div>
        </div>
      </div>

      {/* Stakeholder Portal Selector Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          background: '#FAFAF7',
          padding: '6px',
          borderRadius: '14px',
          border: '1px solid #E1E7DF',
          marginBottom: '28px',
          overflowX: 'auto'
        }}
      >
        {portalTabs.map((tab) => {
          const isActive = activePortal === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActivePortal(tab.id);
                if (onRoleChange) {
                  onRoleChange(tab.roleName);
                }
              }}
              style={{
                flex: 1,
                minWidth: '180px',
                padding: '12px 16px',
                borderRadius: '10px',
                border: isActive ? '1px solid #718B73' : '1px solid transparent',
                background: isActive ? '#718B73' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#68736A',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s',
                boxShadow: isActive ? '0 2px 8px rgba(113, 139, 115, 0.25)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
                <span style={{ color: isActive ? '#FFFFFF' : '#26332A' }}>{tab.label}</span>
              </div>
              <span 
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(255, 255, 255, 0.2)' : '#EAF0E8',
                  color: isActive ? '#FFFFFF' : '#718B73',
                  fontWeight: 600
                }}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Render Active Portal Screen */}
      <div className="portal-content-wrapper">
        {activePortal === 'customer' && (
          <CustomerPortal
            projects={projects}
            onUpdateProject={onUpdateProject}
            onNavigate={onNavigate}
          />
        )}

        {activePortal === 'engineer' && (
          <EngineerPortal
            projects={projects}
            onAddBid={(bid) => {
              alert(`Bid of ₹${bid.amount.toLocaleString('en-IN')} submitted successfully!`);
            }}
            onLogSiteProgress={(log) => {
              alert(`Digital site log submitted successfully!`);
            }}
          />
        )}

        {activePortal === 'contractor' && (
          <ContractorPortal
            projects={projects}
            onAssignWorkers={(data) => {
              alert(`Assigned gang of ${data.workerCount} workers to ${data.projectName}!`);
            }}
            onLogShift={(shift) => {
              alert(`Shift logged: ${shift.activity} completed.`);
            }}
          />
        )}

        {activePortal === 'supplier' && (
          <SupplierPortal
            projects={projects}
            onUpdateInventory={(item, qty) => {
              alert(`Updated stock for ${item}: ${qty} units.`);
            }}
            onConfirmOrder={(order) => {
              alert(`Order confirmed: ${order.item} dispatched!`);
            }}
          />
        )}

        {activePortal === 'bank' && (
          <BankLoanPortal
            projects={projects}
            onApproveTranche={(tranche) => {
              alert(`Tranche ₹${tranche.amount.toLocaleString('en-IN')} disbursed into project escrow!`);
            }}
            onRejectTranche={(tranche) => {
              alert(`Tranche flagged for site re-inspection.`);
            }}
          />
        )}
      </div>
    </div>
  );
}
