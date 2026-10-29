import React, { useState } from 'react';
import { getRoleProfile, checkPermission, PLATFORM_ROLES } from '../../utils/rbac';
import ProjectDesignTab from './ProjectDesignTab';

export default function ProjectWorkspace({
  project,
  onBack,
  activeTab = 'overview',
  setActiveTab,
  onOpenBookingModal,
  onOrderMaterials,
  currentUserRole = 'Customer',
  onOpenAuthModal
}) {
  const [designMode, setDesignMode] = useState('3d'); // '2d', '3d', 'measurements'
  const [activeFloor, setActiveFloor] = useState(1);
  const [viewType, setViewType] = useState('exterior'); // 'exterior', 'interior'
  const [selectedRoom, setSelectedRoom] = useState({ name: 'Master Bedroom', size: '14 × 12 ft', area: '168 sq.ft', flooring: 'Kajaria Vitrified GVT' });
  const [siteUpdateModal, setSiteUpdateModal] = useState(false);
  const [newUpdateText, setNewUpdateText] = useState('');

  const profile = getRoleProfile(currentUserRole);
  const canProCAD = checkPermission(currentUserRole, 'canProCAD');
  const canViewFinancials = checkPermission(currentUserRole, 'canViewFinancials');
  const canLogExecution = checkPermission(currentUserRole, 'canLogSiteExecution');

  if (!project) return null;


  return (
    <div className="project-workspace" style={{ maxWidth: '1280px', margin: '0 auto', padding: '10px 0 60px' }}>
      {/* Top Header & Breadcrumb */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBack}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E1E7DF',
              color: '#68736A',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <span>←</span>
            <span>Projects</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#26332A', letterSpacing: '-0.02em' }}>
                {project.title}
              </h1>
              <span 
                style={{
                  background: '#EAF0E8',
                  border: '1px solid #E1E7DF',
                  color: '#718B73',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}
              >
                Design {project.designVersion}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#68736A' }}>
              {project.floors} Floors • {project.bedrooms}BHK • {project.plotDimensions} Plot ({project.plotAreaSqft} sq.ft) • <strong style={{ color: '#3D8056' }}>{project.progressPercent}% Complete</strong>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: '#68736A', display: 'block' }}>BUDGET ESTIMATE</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#718B73' }}>{project.estimatedCost}</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Navigation Tabs (Overview | Design | Cost | Construction | Team | Documents) */}
      <div 
        style={{
          display: 'flex',
          gap: '4px',
          background: '#EAF0E8',
          padding: '6px',
          borderRadius: '12px',
          border: '1px solid #E1E7DF',
          marginBottom: '28px',
          overflowX: 'auto'
        }}
      >
        {[
          { id: 'overview', label: 'Overview', icon: '🏠' },
          { id: 'design', label: 'Design', icon: '📐' },
          { id: 'cost', label: 'Cost & Materials', icon: '💰' },
          { id: 'construction', label: 'Construction', icon: '🏗️' },
          { id: 'team', label: 'Team', icon: '👥' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? '#718B73' : 'transparent',
                color: isActive ? '#FFFFFF' : '#68736A',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isActive ? '0 1px 3px rgba(38, 51, 42, 0.1)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================
          TAB 1: OVERVIEW
      ========================================================= */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
          {/* Left Column: House Preview Render & Metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Visual House Preview Card */}
            <div 
              style={{ 
                background: '#FFFFFF', 
                borderRadius: '16px', 
                border: '1px solid #E1E7DF', 
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(38, 51, 42, 0.04)'
              }}
            >
              <div style={{ height: '340px', width: '100%', position: 'relative' }}>
                <img
                  src={project.image}
                  alt={project.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    right: '16px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: '1px solid #E1E7DF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#68736A' }}>CURRENT ACTIVE PHASE</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#3D8056' }}>{project.currentPhase}</div>
                  </div>
                  <button
                    onClick={() => setActiveTab('design')}
                    style={{
                      background: '#718B73',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      boxShadow: '0 2px 6px rgba(113, 139, 115, 0.25)'
                    }}
                  >
                    Open 3D House →
                  </button>
                </div>
              </div>
            </div>

            {/* Stage Progress Bar & Highlights */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E1E7DF', boxShadow: '0 1px 3px rgba(38, 51, 42, 0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#26332A' }}>Overall Construction Milestone</h3>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#718B73' }}>{project.progressPercent}% Completed</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#F1F4EF', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ width: `${project.progressPercent}%`, height: '100%', background: '#718B73', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div style={{ background: '#FAFAF7', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #E1E7DF' }}>
                  <span style={{ fontSize: '0.7rem', color: '#68736A', display: 'block' }}>PLOT</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#26332A' }}>{project.plotDimensions}</span>
                </div>
                <div style={{ background: '#FAFAF7', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #E1E7DF' }}>
                  <span style={{ fontSize: '0.7rem', color: '#68736A', display: 'block' }}>BUILT-UP</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#26332A' }}>{project.builtUpAreaSqft} sq.ft</span>
                </div>
                <div style={{ background: '#FAFAF7', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #E1E7DF' }}>
                  <span style={{ fontSize: '0.7rem', color: '#68736A', display: 'block' }}>FLOORS</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#26332A' }}>{project.floors} Floors (G+1)</span>
                </div>
                <div style={{ background: '#FAFAF7', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #E1E7DF' }}>
                  <span style={{ fontSize: '0.7rem', color: '#68736A', display: 'block' }}>SPENT</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3D8056' }}>{project.spentCost}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Site Updates & Quick Team */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Site Updates Feed */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E1E7DF', boxShadow: '0 1px 3px rgba(38, 51, 42, 0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#26332A' }}>Live Site Progress</h3>
                <button
                  onClick={() => setSiteUpdateModal(true)}
                  style={{
                    background: '#EAF0E8',
                    border: '1px solid #E1E7DF',
                    color: '#718B73',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  + Upload Update
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {project.siteUpdates.map((up) => (
                  <div key={up.id} style={{ background: '#FAFAF7', padding: '14px', borderRadius: '12px', border: '1px solid #E1E7DF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#26332A' }}>{up.title}</span>
                      <span style={{ fontSize: '0.7rem', color: '#68736A' }}>{up.date}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#68736A', marginBottom: '10px' }}>{up.notes}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {up.photos.map((ph, idx) => (
                        <img key={idx} src={ph} alt="site update" style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover' }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Team on Site */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E1E7DF', boxShadow: '0 1px 3px rgba(38, 51, 42, 0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#26332A' }}>Assigned Project Team</h3>
                <button onClick={() => setActiveTab('team')} style={{ background: 'transparent', border: 'none', color: '#718B73', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>View All →</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {project.team.slice(0, 3).map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#FAFAF7', borderRadius: '8px', border: '1px solid #E1E7DF' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#26332A' }}>{t.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#68736A' }}>{t.role}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#3D8056', fontWeight: 600 }}>{t.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: COMPREHENSIVE DESIGN & 3D ARCHITECTURAL STUDIO
      ========================================================= */}
      {activeTab === 'design' && (
        <ProjectDesignTab
          project={project}
          currentUserRole={currentUserRole}
        />
      )}

      {/* =========================================================
          TAB 3: COST ESTIMATE & MATERIALS
      ========================================================= */}
      {activeTab === 'cost' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '24px' }}>
          {/* Left: Cost Breakdown */}
          <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E1E7DF', boxShadow: '0 1px 3px rgba(38, 51, 42, 0.04)' }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: '#68736A', textTransform: 'uppercase' }}>TOTAL ESTIMATE</span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#718B73' }}>
                ₹32,40,000
              </div>
              <p style={{ fontSize: '0.85rem', color: '#68736A' }}>
                Stage-wise calculated for 2,150 sq.ft RCC framed duplex
              </p>
            </div>

            {/* Breakdown lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Structure & RCC Frame', cost: '₹14.20 Lakh', percent: 44, color: '#718B73' },
                { label: 'Raw Materials (Cement, Steel, Bricks)', cost: '₹9.60 Lakh', percent: 30, color: '#3D8056' },
                { label: 'Labour & Masonry Gangs', cost: '₹5.80 Lakh', percent: 18, color: '#B7791F' },
                { label: 'Concealed Electrical (MEP)', cost: '₹1.10 Lakh', percent: 3.4, color: '#5d755f' },
                { label: 'Plumbing & Drainage Lines', cost: '₹0.90 Lakh', percent: 2.8, color: '#8a968c' },
                { label: 'Finishing & Painting', cost: '₹0.80 Lakh', percent: 2.5, color: '#68736A' }
              ].map((item, idx) => (
                <div key={idx} style={{ background: '#FAFAF7', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E1E7DF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#26332A' }}>{item.label}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: item.color }}>{item.cost}</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: '#E1E7DF', borderRadius: '2px' }}>
                    <div style={{ width: `${item.percent}%`, height: '100%', background: item.color, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Bill of Materials & Direct Order */}
          <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E1E7DF', boxShadow: '0 1px 3px rgba(38, 51, 42, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#26332A' }}>Materials Required & Supply Status</h3>
              <button
                onClick={onOrderMaterials}
                style={{
                  background: '#718B73',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(113, 139, 115, 0.25)'
                }}
              >
                + Order from Suppliers
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {project.materialsRequired.map((mat, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#FAFAF7', borderRadius: '10px', border: '1px solid #E1E7DF' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#26332A' }}>{mat.item}</div>
                    <div style={{ fontSize: '0.75rem', color: '#68736A' }}>Quantity: <strong style={{ color: '#718B73' }}>{mat.quantity}</strong></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3D8056' }}>{mat.cost}</div>
                    <span style={{ fontSize: '0.7rem', color: '#68736A' }}>{mat.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: CONSTRUCTION PROGRESS & TIMELINE
      ========================================================= */}
      {activeTab === 'construction' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr', gap: '24px' }}>
          {/* Timeline Sequence */}
          <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E1E7DF', boxShadow: '0 1px 3px rgba(38, 51, 42, 0.04)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#26332A', marginBottom: '18px' }}>
              Stage-wise Construction Timeline
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {project.phases.map((ph, idx) => (
                <div 
                  key={idx} 
                  style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '12px 16px', 
                    background: ph.status === 'in_progress' ? '#EAF0E8' : '#FAFAF7', 
                    borderRadius: '10px',
                    border: ph.status === 'in_progress' ? '1px solid #718B73' : '1px solid #E1E7DF'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: ph.status === 'done' ? '#3D8056' : ph.status === 'in_progress' ? '#718B73' : '#E1E7DF',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.8rem'
                      }}
                    >
                      {ph.status === 'done' ? '✓' : ph.status === 'in_progress' ? '●' : '○'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#26332A' }}>{ph.name}</div>
                      <div style={{ fontSize: '0.725rem', color: '#68736A' }}>{ph.date} • Inspector: {ph.inspector}</div>
                    </div>
                  </div>

                  <span 
                    style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      color: ph.status === 'done' ? '#3D8056' : ph.status === 'in_progress' ? '#718B73' : '#68736A' 
                    }}
                  >
                    {ph.status === 'done' ? 'Completed' : ph.status === 'in_progress' ? '65% Active' : 'Scheduled'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Site Updates & Photos */}
          <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E1E7DF', boxShadow: '0 1px 3px rgba(38, 51, 42, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#26332A' }}>Site Photos & Inspection Logs</h3>
              <button
                onClick={() => setSiteUpdateModal(true)}
                style={{
                  background: '#718B73',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(113, 139, 115, 0.25)'
                }}
              >
                + Post Site Photo
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {project.siteUpdates.map((up) => (
                <div key={up.id} style={{ background: '#FAFAF7', padding: '16px', borderRadius: '12px', border: '1px solid #E1E7DF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#26332A' }}>{up.title}</span>
                    <span style={{ fontSize: '0.75rem', color: '#68736A' }}>{up.date}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#718B73', marginBottom: '8px' }}>Logged by: {up.author}</div>
                  <p style={{ fontSize: '0.8rem', color: '#68736A', marginBottom: '12px' }}>{up.notes}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {up.photos.map((img, i) => (
                      <img key={i} src={img} alt="site update" style={{ width: '120px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E1E7DF' }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 5: PROJECT TEAM
      ========================================================= */}
      {activeTab === 'team' && (
        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E1E7DF', boxShadow: '0 1px 3px rgba(38, 51, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#26332A' }}>Project Stakeholders & Workers</h3>
              <p style={{ fontSize: '0.85rem', color: '#68736A' }}>Directly connected professionals on this construction site</p>
            </div>
            <button
              onClick={onOpenBookingModal}
              style={{
                background: '#718B73',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(113, 139, 115, 0.25)'
              }}
            >
              + Hire / Assign More Workers
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {project.team.map((m, idx) => (
              <div key={idx} style={{ background: '#FAFAF7', padding: '18px', borderRadius: '12px', border: '1px solid #E1E7DF' }}>
                <div style={{ fontSize: '0.75rem', color: '#718B73', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  {m.role}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#26332A', marginBottom: '4px' }}>
                  {m.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#68736A', marginBottom: '14px' }}>
                  {m.phone || m.company}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E1E7DF', paddingTop: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#3D8056', fontWeight: 600 }}>● {m.status}</span>
                  <button style={{ background: '#EAF0E8', border: '1px solid #E1E7DF', color: '#718B73', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                    Call / Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 6: DOCUMENTS
      ========================================================= */}
      {activeTab === 'documents' && (
        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E1E7DF', boxShadow: '0 1px 3px rgba(38, 51, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#26332A' }}>Project Blueprints & Legal Documents</h3>
            <button style={{ background: '#718B73', color: '#FFFFFF', fontWeight: 700, padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 6px rgba(113, 139, 115, 0.25)' }}>
              + Upload Document
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { name: '2D Architectural Floor Plan V3 (CAD / PDF)', size: '4.2 MB', date: '02 Oct 2026', type: 'Blueprint' },
              { name: 'Structural Rebar Detailing & Column Schedule', size: '6.8 MB', date: '28 Sep 2026', type: 'Engineering' },
              { name: 'CMDA Municipal Sanction Order & Approved Plan', size: '1.9 MB', date: '15 Sep 2026', type: 'Permit' },
              { name: 'Stage 3 Escrow Inspection Release Certificate', size: '820 KB', date: '01 Oct 2026', type: 'Financial' },
              { name: 'UltraTech Cement 53-Grade Test Certificate', size: '450 KB', date: '24 Sep 2026', type: 'Quality Report' }
            ].map((doc, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#FAFAF7', borderRadius: '10px', border: '1px solid #E1E7DF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.25rem' }}>📄</span>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#26332A' }}>{doc.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#68736A' }}>{doc.type} • {doc.size} • Uploaded {doc.date}</div>
                  </div>
                </div>
                <button style={{ background: '#FFFFFF', border: '1px solid #E1E7DF', color: '#26332A', padding: '6px 14px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                  Download PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Site Update Modal */}
      {siteUpdateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(38, 51, 42, 0.4)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div style={{ background: '#FFFFFF', width: '450px', padding: '24px', borderRadius: '16px', border: '1px solid #E1E7DF', boxShadow: '0 20px 40px rgba(38, 51, 42, 0.1)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#26332A', marginBottom: '14px' }}>Upload Site Progress</h3>
            <textarea
              rows={3}
              placeholder="Describe work completed today (e.g. Column concrete pour completed, cube samples tested)..."
              value={newUpdateText}
              onChange={(e) => setNewUpdateText(e.target.value)}
              style={{ width: '100%', background: '#FAFAF7', border: '1px solid #E1E7DF', borderRadius: '8px', padding: '10px', color: '#26332A', outline: 'none', marginBottom: '14px' }}
            />
            <div style={{ border: '2px dashed #E1E7DF', borderRadius: '8px', padding: '16px', textAlign: 'center', color: '#68736A', fontSize: '0.8rem', marginBottom: '16px', background: '#FAFAF7' }}>
              📷 Click or Drag to attach site photos / videos
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setSiteUpdateModal(false)} style={{ background: 'transparent', border: 'none', color: '#68736A', padding: '8px 14px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button
                onClick={() => {
                  alert('Site progress update logged successfully!');
                  setSiteUpdateModal(false);
                }}
                style={{ background: '#718B73', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(113, 139, 115, 0.25)' }}
              >
                Publish Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
