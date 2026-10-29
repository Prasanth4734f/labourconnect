import React, { useState } from 'react';
import { 
  Building, 
  ShieldCheck, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  DollarSign, 
  FileText, 
  ChevronRight, 
  Camera, 
  Check, 
  Lock, 
  Unlock,
  Award,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CustomerPortal({ projects, onUpdateProject, onNavigate }) {
  const [selectedProject, setSelectedProject] = useState(projects[0] || null);
  const [activeTab, setActiveTab] = useState('escrow'); // 'escrow', 'bids', 'specs'

  const handleApproveMilestone = (stageId) => {
    if (!selectedProject) return;

    const updatedStages = selectedProject.stages.map(st => {
      if (st.id === stageId) {
        return { ...st, status: 'completed', completionDate: new Date().toISOString().split('T')[0] };
      }
      return st;
    });

    const approvedStage = selectedProject.stages.find(s => s.id === stageId);
    const amountReleased = approvedStage ? approvedStage.amount : 0;

    const updatedProject = {
      ...selectedProject,
      stages: updatedStages,
      currentStage: Math.min(selectedProject.totalStages, selectedProject.currentStage + 1),
      escrowReleased: selectedProject.escrowReleased + amountReleased
    };

    setSelectedProject(updatedProject);
    if (onUpdateProject) {
      onUpdateProject(updatedProject);
    }

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleAcceptBid = (bidId) => {
    if (!selectedProject) return;

    const acceptedBid = selectedProject.bids.find(b => b.id === bidId);
    const updatedBids = selectedProject.bids.map(b => ({
      ...b,
      status: b.id === bidId ? 'accepted' : 'rejected'
    }));

    const defaultStages = [
      {
        id: 1,
        title: 'Stage 1: Soil Testing, Site Excavation & Isolated Footings',
        percentage: 15,
        amount: Math.round(selectedProject.budgetInr * 0.15),
        status: 'in_review',
        completionDate: 'Estimated in 2 weeks',
        proofPhoto: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80',
        inspectedBy: `${acceptedBid?.engineerName || 'Licensed Engineer'}`,
        notes: 'Excavation to hard rock strata. Column base casting with Tata Tiscon rebar.',
      },
      {
        id: 2,
        title: 'Stage 2: Plinth Beam, Anti-Termite & Foundation Backfilling',
        percentage: 15,
        amount: Math.round(selectedProject.budgetInr * 0.15),
        status: 'pending',
        completionDate: 'Estimated in 4 weeks',
        proofPhoto: null,
        inspectedBy: 'Pending',
        notes: 'PCC and plinth beam tie level with water-proofing.',
      },
      {
        id: 3,
        title: 'Stage 3: Ground Floor Columns & First Floor RCC Slab Pour',
        percentage: 25,
        amount: Math.round(selectedProject.budgetInr * 0.25),
        status: 'pending',
        completionDate: 'Estimated in 7 weeks',
        proofPhoto: null,
        inspectedBy: 'Pending',
        notes: 'M25 ready-mix concrete casting with concealed electrical piping.',
      },
      {
        id: 4,
        title: 'Stage 4: Red Brick Masonry & Internal/External Plastering',
        percentage: 20,
        amount: Math.round(selectedProject.budgetInr * 0.20),
        status: 'pending',
        completionDate: 'Estimated in 11 weeks',
        proofPhoto: null,
        inspectedBy: 'Pending',
        notes: 'Class 1 red clay bricks with 1:4 cement sand mortar.',
      },
      {
        id: 5,
        title: 'Stage 5: Concealed Plumbing, Electrical Wiring & Vitrified Flooring',
        percentage: 15,
        amount: Math.round(selectedProject.budgetInr * 0.15),
        status: 'pending',
        completionDate: 'Estimated in 14 weeks',
        proofPhoto: null,
        inspectedBy: 'Pending',
        notes: 'Finolex FR wires, CPVC pipes & Kajaria 4x2 vitrified tiles.',
      },
      {
        id: 6,
        title: 'Stage 6: Exterior Teakwood Portico, Painting & Final Handover',
        percentage: 10,
        amount: Math.round(selectedProject.budgetInr * 0.10),
        status: 'pending',
        completionDate: 'Estimated in 17 weeks',
        proofPhoto: null,
        inspectedBy: 'Pending',
        notes: 'Asian Paints Apex Ultima + Occupancy Certificate handover.',
      }
    ];

    const updatedProj = {
      ...selectedProject,
      status: 'in_progress',
      assignedEngineer: `${acceptedBid?.engineerName} (${acceptedBid?.company})`,
      bids: updatedBids,
      stages: defaultStages,
      currentStage: 1,
      escrowLocked: selectedProject.budgetInr,
      escrowReleased: 0
    };

    setSelectedProject(updatedProj);
    if (onUpdateProject) onUpdateProject(updatedProj);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-amber">Home Owner / Customer Portal</span>
            <span className="text-xs text-slate-400 font-mono">BuildMate Escrow Guarantee</span>
          </div>
          <h2 className="text-2xl font-bold text-white">My Construction Projects & Escrow</h2>
          <p className="text-xs text-slate-300 mt-1">
            Monitor real-time site milestones, review government-licensed engineer bids, and release escrow funds upon verified photo inspections.
          </p>
        </div>

        <button 
          onClick={() => onNavigate && onNavigate('studio')}
          className="btn btn-primary flex items-center gap-2 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" /> Start New AI Architecture Plan
        </button>
      </div>

      {/* Project Selector Bar */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {projects.map(proj => (
          <button
            key={proj.id}
            onClick={() => setSelectedProject(proj)}
            className={`p-4 rounded-xl text-left border flex-shrink-0 min-w-[280px] transition-all ${
              selectedProject?.id === proj.id
                ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 font-bold">{proj.id}</span>
              <span className={`badge text-[10px] ${
                proj.status === 'in_progress' ? 'badge-emerald' : 'badge-amber'
              }`}>
                {proj.status === 'in_progress' ? '🔨 Construction Active' : '📋 Bidding Open'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">{proj.title}</h4>
            <div className="text-xs text-slate-400 mt-1 flex justify-between">
              <span>{proj.plotSize}</span>
              <span className="text-amber-400 font-mono font-bold">₹{(proj.budgetInr / 100000).toFixed(1)}L</span>
            </div>
          </button>
        ))}
      </div>

      {/* Active Project Dashboard */}
      {selectedProject && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Escrow & Project Details (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Escrow Financial Tracker */}
            <div className="glass-panel p-6 flex flex-col gap-5 border-l-4 border-l-emerald-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white">Milestone-Linked Escrow Vault</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Funds are safely held in Bank Escrow and released only when you approve milestone photo proofs.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Total Budget Locked</span>
                    <span className="font-mono text-base font-bold text-white">₹{(selectedProject.escrowLocked / 100000).toFixed(2)}L</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Released to Engineer</span>
                    <span className="font-mono text-base font-bold text-emerald-400">₹{(selectedProject.escrowReleased / 100000).toFixed(2)}L</span>
                  </div>
                </div>
              </div>

              {/* Escrow Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-mono mb-1.5">
                  <span>Construction Stage Progress: {selectedProject.currentStage} of 6 Completed</span>
                  <span>{Math.round((selectedProject.escrowReleased / selectedProject.escrowLocked) * 100 || 0)}% Escrow Disbursed</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${Math.round((selectedProject.escrowReleased / selectedProject.escrowLocked) * 100 || 0)}%` }}
                  />
                </div>
              </div>

              {/* Sub-tabs: Milestones vs Engineer Bids */}
              <div className="tabs-container">
                <button
                  onClick={() => setActiveTab('escrow')}
                  className={`tab-btn ${activeTab === 'escrow' ? 'active' : ''}`}
                >
                  <Building className="w-4 h-4" /> 6-Stage Construction Milestones
                </button>
                <button
                  onClick={() => setActiveTab('bids')}
                  className={`tab-btn ${activeTab === 'bids' ? 'active' : ''}`}
                >
                  <UserCheck className="w-4 h-4" /> Licensed Engineer Bids ({selectedProject.bids?.length || 0})
                </button>
              </div>

              {/* Tab 1: 6-Stage Escrow Timeline */}
              {activeTab === 'escrow' && (
                <div className="flex flex-col gap-4">
                  {selectedProject.stages && selectedProject.stages.length > 0 ? (
                    selectedProject.stages.map(stage => {
                      const isCompleted = stage.status === 'completed';
                      const isInReview = stage.status === 'in_review';
                      return (
                        <div 
                          key={stage.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isCompleted 
                              ? 'bg-emerald-950/20 border-emerald-500/40' 
                              : isInReview 
                              ? 'bg-amber-950/25 border-amber-500 shadow-md shadow-amber-500/10' 
                              : 'bg-slate-900/40 border-slate-800 opacity-70'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-start gap-3">
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                              ) : isInReview ? (
                                <Clock className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0 animate-pulse" />
                              ) : (
                                <Lock className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                              )}
                              <div>
                                <h4 className="text-sm font-bold text-white">{stage.title}</h4>
                                <p className="text-xs text-slate-400 mt-0.5">{stage.notes}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 sm:self-center">
                              <div className="text-right">
                                <span className="text-xs font-mono font-bold text-amber-400">
                                  ₹{(stage.amount / 100000).toFixed(2)}L
                                </span>
                                <span className="block text-[10px] text-slate-400">({stage.percentage}%)</span>
                              </div>

                              {isInReview && (
                                <button
                                  onClick={() => handleApproveMilestone(stage.id)}
                                  className="btn btn-primary btn-sm flex items-center gap-1 shadow-lg shadow-amber-500/25"
                                >
                                  <Unlock className="w-3 h-3" /> Approve & Release
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Site Inspection Photo Proof & Inspector Notes */}
                          {stage.proofPhoto && (
                            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row gap-3 items-start">
                              <img 
                                src={stage.proofPhoto} 
                                alt={stage.title}
                                className="w-24 h-16 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                              />
                              <div className="text-xs text-slate-300">
                                <div className="text-emerald-400 font-semibold flex items-center gap-1">
                                  <Camera className="w-3 h-3" /> Photo Proof Verified by {stage.inspectedBy}
                                </div>
                                <div className="text-slate-400 text-[11px] mt-0.5">
                                  Stamped Date: {stage.completionDate}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800">
                      <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                      <h4 className="text-base font-bold text-white">Tender Bidding in Progress</h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                        Licensed Civil Engineers are currently reviewing your AI Blueprint packet. Switch to the <strong>"Licensed Engineer Bids"</strong> tab to accept a proposal.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Engineer Bids Review */}
              {activeTab === 'bids' && (
                <div className="flex flex-col gap-4">
                  {selectedProject.bids?.map(bid => {
                    const isAccepted = bid.status === 'accepted';
                    return (
                      <div 
                        key={bid.id}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isAccepted 
                            ? 'bg-emerald-950/30 border-emerald-500' 
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{bid.engineerName}</h4>
                            <span className="badge badge-cyan text-[10px]">Verified License: {bid.licenseNo}</span>
                            <span className="text-amber-400 text-xs font-bold">★ {bid.rating}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 font-semibold">{bid.company}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{bid.note}</p>
                          <div className="text-xs text-cyan-400 mt-1 font-mono">
                            Timeline: {bid.days} Calendar Days Turnkey
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                          <div className="text-right">
                            <span className="text-xs text-slate-400 block">Tender Bid Amount</span>
                            <span className="text-base font-mono font-bold text-amber-400">
                              ₹{(bid.amount / 100000).toFixed(2)} Lakhs
                            </span>
                          </div>

                          {!isAccepted && selectedProject.status === 'bidding_open' && (
                            <button
                              onClick={() => handleAcceptBid(bid.id)}
                              className="btn btn-primary btn-sm flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" /> Accept Bid & Start
                            </button>
                          )}

                          {isAccepted && (
                            <span className="badge badge-emerald flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Contract Awarded
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Project Summary & Assigned Engineer Card (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            
            {/* Assigned Engineer Card */}
            <div className="glass-panel p-5 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Assigned Structural Engineer
              </h4>
              
              {selectedProject.assignedEngineer ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center font-bold text-amber-400">
                      EV
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">{selectedProject.assignedEngineer}</h5>
                      <span className="badge badge-emerald text-[10px]">Govt License Active</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 mt-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div><strong>Direct Hotline:</strong> +91 98450 67120</div>
                    <div><strong>Site Inspection Log:</strong> Daily at 10:30 AM</div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                  No engineer assigned yet. Review the tender bids in the left panel to award the project.
                </div>
              )}
            </div>

            {/* Quick Specs */}
            <div className="glass-panel p-5 flex flex-col gap-3 text-xs">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Architectural Specifications
              </h4>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Plot Dimension:</span>
                  <span className="font-mono font-bold text-white">{selectedProject.plotSize}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Built-Up Area:</span>
                  <span className="font-mono font-bold text-cyan-400">{selectedProject.builtUpArea}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Vaastu Facing:</span>
                  <span className="text-emerald-400 font-semibold">{selectedProject.facing}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Typology:</span>
                  <span className="text-white">{selectedProject.bhk}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
