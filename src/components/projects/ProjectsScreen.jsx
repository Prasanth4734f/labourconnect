import React, { useState } from 'react';
import { getRoleProfile, checkPermission } from '../../utils/rbac';

export default function ProjectsScreen({
  projects,
  onOpenProject,
  onCreateProject,
  currentUserRole = 'Customer',
  onOpenAuthModal
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const profile = getRoleProfile(currentUserRole);
  const canCreate = checkPermission(currentUserRole, 'canCreateProject');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchTerm.toLowerCase());
    if (typeFilter === 'all') return matchesSearch;
    if (typeFilter === 'residential') return matchesSearch && p.subtitle.toLowerCase().includes('residential');
    if (typeFilter === 'commercial') return matchesSearch && p.subtitle.toLowerCase().includes('commercial');
    return matchesSearch;
  });

  return (
    <div className="projects-screen" style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0 60px' }}>
      {/* Header Bar */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px' 
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#26332A', letterSpacing: '-0.02em', margin: 0 }}>
              Projects
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
              {profile.badge} Scope
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#68736A' }}>
            {canCreate 
              ? 'Manage active construction sites, 2D/3D models, stage milestones & budgets' 
              : `Active site assignments and execution logs for ${profile.name}`}
          </p>
        </div>

        {/* Right Actions: Search + [+ New Project] or Role Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E1E7DF',
              borderRadius: '10px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '240px'
            }}
          >
            <span style={{ color: '#68736A', fontSize: '0.9rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#26332A',
                fontSize: '0.85rem',
                width: '100%'
              }}
            />
          </div>

          {canCreate ? (
            <button
              onClick={onCreateProject}
              style={{
                background: '#718B73',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(113, 139, 115, 0.25)'
              }}
            >
              <span>+</span>
              <span>New Project</span>
            </button>
          ) : (
            <div
              style={{
                background: '#EAF0E8',
                border: '1px solid #E1E7DF',
                color: '#68736A',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Project creation is restricted to Property Owners & Licensed Architects"
            >
              <span>🔒</span>
              <span>Creation by Owner/Architect</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { id: 'all', label: 'All Projects' },
          { id: 'residential', label: 'Residential Villas' },
          { id: 'commercial', label: 'Commercial & Complexes' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTypeFilter(tab.id)}
            style={{
              background: typeFilter === tab.id ? '#718B73' : '#EAF0E8',
              border: typeFilter === tab.id ? '1px solid #718B73' : '1px solid #E1E7DF',
              color: typeFilter === tab.id ? '#FFFFFF' : '#26332A',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px'
        }}
      >
        {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            onClick={() => onOpenProject(proj.id)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E1E7DF',
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(38, 51, 42, 0.04)',
              transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#718B73';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(38, 51, 42, 0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.borderColor = '#E1E7DF';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(38, 51, 42, 0.04)';
            }}
          >
            {/* Visual Image */}
            <div style={{ height: '180px', width: '100%', position: 'relative', overflow: 'hidden' }}>
              <img
                src={proj.image}
                alt={proj.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(6px)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#26332A',
                  border: '1px solid #E1E7DF'
                }}
              >
                {proj.plotDimensions}
              </div>
              <div 
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(6px)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#3D8056',
                  border: '1px solid #E1E7DF'
                }}
              >
                {proj.currentPhase}
              </div>
            </div>

            {/* Content Details */}
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#26332A', marginBottom: '4px' }}>
                {proj.title}
              </h3>
              <div style={{ fontSize: '0.825rem', color: '#68736A', marginBottom: '16px' }}>
                {proj.subtitle} • {proj.location}
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#68736A', marginBottom: '6px' }}>
                  <span>Completion</span>
                  <span style={{ fontWeight: 700, color: '#718B73' }}>{proj.progressPercent}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#F1F4EF', borderRadius: '3px', overflow: 'hidden' }}>
                  <div 
                    style={{
                      width: `${proj.progressPercent}%`,
                      height: '100%',
                      background: '#718B73',
                      borderRadius: '3px'
                    }}
                  />
                </div>
              </div>

              {/* Cost & Open Project */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid #E1E7DF' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#68736A', display: 'block', textTransform: 'uppercase' }}>ESTIMATED COST</span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#26332A' }}>{proj.estimatedCost}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenProject(proj.id);
                  }}
                  style={{
                    background: '#EAF0E8',
                    border: '1px solid #E1E7DF',
                    color: '#718B73',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Open Project</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
