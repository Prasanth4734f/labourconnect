import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Camera, 
  Users, 
  Check, 
  X,
  ChevronRight 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ConstructionScheduler({ projects, onUpdatePhase, onNavigate }) {
  const [selectedProject, setSelectedProject] = useState(projects[0] || null);
  const [showPhotoModal, setShowPhotoModal] = useState(null);

  const handleApproveMilestone = (phaseId) => {
    if (!selectedProject) return;

    const updatedPhases = selectedProject.phases.map(ph => {
      if (ph.id === phaseId) {
        return { ...ph, status: 'completed', progress: 100 };
      }
      return ph;
    });

    const completedAmount = updatedPhases
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const updatedProject = {
      ...selectedProject,
      phases: updatedPhases,
      escrowReleased: completedAmount,
      overallProgress: Math.min(100, Math.round((completedAmount / selectedProject.budgetInr) * 100))
    };

    setSelectedProject(updatedProject);
    if (onUpdatePhase) {
      onUpdatePhase(updatedProject);
    }

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="lc-card lc-card-banner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}>
              <Calendar style={{ width: '24px', height: '24px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                Construction Management & Milestone Scheduler
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Phase-wise execution schedule, assigned worker gangs, equipment allocation, and milestone escrow fund releases.
              </p>
            </div>
          </div>

          <div style={{ background: '#0a0e1a', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'monospace' }}>Escrow Locked</div>
            <div className="text-mono" style={{ fontSize: '1.2rem', fontWeight: 900, color: '#34d399' }}>
              ₹{(selectedProject.escrowLocked / 100000).toFixed(1)}L
            </div>
          </div>
        </div>
      </div>

      {/* Active Project Card */}
      {selectedProject && (
        <div className="lc-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
            <div>
              <span className="lc-badge lc-badge-amber" style={{ marginBottom: '6px' }}>Active Project</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>{selectedProject.title}</h3>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', gap: '12px', marginTop: '4px' }}>
                <span>Owner: <strong style={{ color: '#ffffff' }}>{selectedProject.customerName}</strong></span>
                <span>•</span>
                <span>Engineer: <strong style={{ color: '#38bdf8' }}>{selectedProject.assignedEngineer}</strong></span>
              </div>
            </div>

            <button 
              onClick={() => onNavigate && onNavigate('workspace_chat')}
              className="lc-btn lc-btn-secondary lc-btn-sm"
            >
              Open Project Chat <ChevronRight style={{ width: '14px', height: '14px' }} />
            </button>
          </div>

          {/* Progress Bar */}
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontFamily: 'monospace', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Overall Construction Progress</span>
              <span style={{ color: '#34d399', fontWeight: 800 }}>{selectedProject.overallProgress}% Complete</span>
            </div>
            <div style={{ width: '100%', background: '#0a0e1a', borderRadius: '10px', height: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: `${selectedProject.overallProgress}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #34d399)', borderRadius: '10px', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>
      )}

      {/* Phases Timeline */}
      <div className="lc-card">
        <h3 className="lc-card-title" style={{ marginBottom: '20px' }}>
          <Clock style={{ width: '18px', height: '18px', color: '#fbbf24' }} /> Construction Phases Execution Schedule
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedProject?.phases?.map((phase, idx) => (
            <div 
              key={phase.id}
              style={{
                background: phase.status === 'completed' ? 'rgba(16, 185, 129, 0.08)' : (phase.status === 'in_progress' ? 'rgba(245, 158, 11, 0.08)' : '#0a0e1a'),
                border: phase.status === 'completed' ? '1px solid rgba(16, 185, 129, 0.3)' : (phase.status === 'in_progress' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(255,255,255,0.06)'),
                borderRadius: '14px',
                padding: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '280px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  background: phase.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : (phase.status === 'in_progress' ? 'rgba(245, 158, 11, 0.2)' : '#161e33'),
                  color: phase.status === 'completed' ? '#34d399' : (phase.status === 'in_progress' ? '#fbbf24' : '#64748b'),
                  flexShrink: 0
                }}>
                  {idx + 1}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>{phase.title}</h4>
                    {phase.status === 'completed' && <span className="lc-badge lc-badge-emerald">COMPLETED</span>}
                    {phase.status === 'in_progress' && <span className="lc-badge lc-badge-amber">IN PROGRESS</span>}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4', marginBottom: '8px' }}>{phase.notes}</p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                    <span>👥 {phase.workerGang}</span>
                    <span>📅 {phase.date}</span>
                  </div>
                </div>
              </div>

              {/* Action Column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                <div className="text-mono" style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fbbf24' }}>
                  ₹{phase.amount.toLocaleString()}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {phase.photo && (
                    <button 
                      onClick={() => setShowPhotoModal(phase.photo)}
                      className="lc-btn lc-btn-secondary lc-btn-sm"
                    >
                      <Camera style={{ width: '13px', height: '13px', color: '#38bdf8' }} /> Photo
                    </button>
                  )}

                  {phase.status === 'in_progress' && (
                    <button 
                      onClick={() => handleApproveMilestone(phase.id)}
                      className="lc-btn lc-btn-primary lc-btn-sm"
                    >
                      <Check style={{ width: '14px', height: '14px' }} /> Release Funds
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo View Modal */}
      {showPhotoModal && (
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
          <div className="lc-card" style={{ maxWidth: '600px', width: '100%', position: 'relative' }}>
            <button 
              onClick={() => setShowPhotoModal(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '12px' }}>Verified Site Inspection Photo</h3>
            <img src={showPhotoModal} alt="Site Inspection" style={{ width: '100%', height: 'auto', borderRadius: '12px' }} />
          </div>
        </div>
      )}
    </div>
  );
}
