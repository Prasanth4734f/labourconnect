import React from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FileText, 
  TrendingUp,
  MapPin,
  ShieldCheck,
  Building,
  HardHat,
  Truck,
  Layers,
  Banknote,
  CalendarCheck,
  ClipboardList
} from 'lucide-react';
import { getRoleProfile, PLATFORM_ROLES } from '../../utils/rbac';

export default function HomeScreen({
  projects,
  onOpenProject,
  onCreateProject,
  onNavigate,
  currentUserRole = 'Customer',
  onOpenAuthModal
}) {
  const profile = getRoleProfile(currentUserRole);
  const currentProject = projects[0] || {
    id: 'proj-1',
    title: 'Modern 3BHK Residence',
    location: 'Velachery, Chennai',
    plotDimensions: '40 × 60 ft',
    floors: 2,
    bedrooms: 3,
    progressPercent: 68,
    currentPhase: 'First Floor RCC Slab & Shuttering',
    estimatedCost: '₹40.2 Lakhs',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
  };

  // Role-specific home dashboard configs
  const getRoleDashboard = () => {
    switch (currentUserRole) {
      case PLATFORM_ROLES.ENGINEER:
        return {
          subtitle: 'Licensed Consulting Structural Engineer • Site Log Portal',
          greeting: `Welcome, ${profile.name}`,
          question: 'What inspections or CAD reviews are on your agenda today?',
          cardTitle: 'Active Structural Site Supervision',
          cardMeta: 'Site: Velachery 3BHK • Client: Prasanth Kumar',
          cardPhase: 'RCC Slab Reinforcement Inspection',
          cardMetricLabel: 'NBC COMPLIANCE',
          cardMetricValue: 'IS 456 Verified',
          cardProgressLabel: 'Structural Phase Completion',
          cardProgress: 75,
          cardBtnText: 'Open Engineering CAD & Site Log',
          quickActions: [
            {
              icon: '📐',
              title: 'Review Site CAD',
              desc: 'Inspect beam-column structural drawings & 2D layout.',
              color: '#38bdf8',
              action: () => onNavigate('design')
            },
            {
              icon: '📋',
              title: 'Issue Digital Site Log',
              desc: 'Record geo-tagged site visit remarks and safety checklist.',
              color: '#34d399',
              action: () => {
                onOpenProject(currentProject.id);
              }
            },
            {
              icon: '💬',
              title: 'Client Inquiries',
              desc: 'Respond to architectural consultation and structural RFPs.',
              color: '#fbbf24',
              action: () => onNavigate('messages')
            }
          ],
          activities: [
            {
              id: 'eng-1',
              icon: '📐',
              title: 'Reinforcement bar spacing verified',
              desc: 'Column C1-C8 stirrups spacing of 150mm c/c approved as per IS 456:2000.',
              time: 'Today, 10:15 AM'
            },
            {
              id: 'eng-2',
              icon: '📑',
              title: 'Cube test 7-day compressive strength uploaded',
              desc: 'M25 concrete mix test specimen achieved 18.2 N/mm² (passed threshold).',
              time: 'Today, 08:45 AM'
            },
            {
              id: 'eng-3',
              icon: '🏛️',
              title: 'CMDA Municipal Drawing set exported',
              desc: 'Sanction drawings stamped and released to client repository.',
              time: 'Yesterday'
            }
          ]
        };

      case PLATFORM_ROLES.LABOUR:
        return {
          subtitle: 'Master Mason & Contractor Gang • Site Execution Hub',
          greeting: `Namaste, ${profile.name}`,
          question: 'Here is your daily gang muster roll and site progress today:',
          cardTitle: 'Current Site Execution Assignment',
          cardMeta: 'Site: Modern 3BHK Residence • 10-Man Crew On Site',
          cardPhase: 'Slab Shuttering & Steel Bar Bending',
          cardMetricLabel: 'DAILY WAGE POOL',
          cardMetricValue: '₹14,500 / day',
          cardProgressLabel: 'Slab Shuttering Stage',
          cardProgress: 80,
          cardBtnText: 'Open Site Work Manager',
          quickActions: [
            {
              icon: '👷',
              title: 'Mark Gang Attendance',
              desc: 'Log daily check-in for 10 masons, 4 helpers & 2 bar benders.',
              color: '#10b981',
              action: () => onNavigate('projects')
            },
            {
              icon: '📸',
              title: 'Submit Daily Site Log',
              desc: 'Upload geo-tagged shuttering photos for engineer sign-off.',
              color: '#38bdf8',
              action: () => onOpenProject(currentProject.id)
            },
            {
              icon: '🧱',
              title: 'Indent Material Bags',
              desc: 'Request 100 bags 53G cement & 2 tons steel for tomorrow.',
              color: '#fbbf24',
              action: () => onNavigate('marketplace')
            }
          ],
          activities: [
            {
              id: 'lab-1',
              icon: '👷',
              title: '10 Masons checked in on site',
              desc: 'Morning shift commenced at 08:30 AM for first-floor slab scaffolding.',
              time: 'Today, 08:30 AM'
            },
            {
              id: 'lab-2',
              icon: '🧱',
              title: '150 Cement Bags offloaded',
              desc: 'UltraTech 53 Grade bags stacked safely under tarpaulin storage.',
              time: 'Today, 10:00 AM'
            },
            {
              id: 'lab-3',
              icon: '💳',
              title: 'Weekly wage escrow tranche credited',
              desc: '₹58,000 released directly to gang contractor account upon engineer sign-off.',
              time: 'Yesterday'
            }
          ]
        };

      case PLATFORM_ROLES.EQUIPMENT:
        return {
          subtitle: 'Heavy Machinery & Earthmoving Fleet Dispatch',
          greeting: `Welcome, ${profile.name}`,
          question: 'Track your machinery fleet deployments, telemetry & run hours:',
          cardTitle: 'Active Machinery Deployment',
          cardMeta: 'Equipment: JCB 3DX Backhoe Loader • Site: Velachery Villa',
          cardPhase: 'Foundation Earth Trenching & Site Levelling',
          cardMetricLabel: 'RUN HOURS TODAY',
          cardMetricValue: '6.5 hrs (Diesel logged)',
          cardProgressLabel: 'Rental Contract Completion',
          cardProgress: 70,
          cardBtnText: 'Open Fleet Telemetry & Billing',
          quickActions: [
            {
              icon: '🚜',
              title: 'Deploy Machinery',
              desc: 'Assign concrete mixers, JCBs or scaffolding props to sites.',
              color: '#f97316',
              action: () => onNavigate('projects')
            },
            {
              icon: '⏱️',
              title: 'Log Machine Run Hours',
              desc: 'Submit daily hour meter readings and operator sign-offs.',
              color: '#34d399',
              action: () => onOpenProject(currentProject.id)
            },
            {
              icon: '📋',
              title: 'Machinery Catalog',
              desc: 'Update hourly/daily rental rates and operator availability.',
              color: '#fbbf24',
              action: () => onNavigate('marketplace')
            }
          ],
          activities: [
            {
              id: 'eq-1',
              icon: '🚜',
              title: 'JCB 3DX completed 6.5 run hours',
              desc: 'Basement sump excavation completed with operator Ramesh.',
              time: 'Today, 11:00 AM'
            },
            {
              id: 'eq-2',
              icon: '🏗️',
              title: 'Concrete Mixer 10/7 dispatched',
              desc: 'Mixer delivered to Site B for scheduled first floor slab pouring.',
              time: 'Today, 09:15 AM'
            },
            {
              id: 'eq-3',
              icon: '💳',
              title: 'Equipment rental payout received',
              desc: '₹42,500 rental milestone released from project escrow.',
              time: 'Yesterday'
            }
          ]
        };

      case PLATFORM_ROLES.MATERIAL:
        return {
          subtitle: 'Wholesale Building Materials & Truck Dispatch Hub',
          greeting: `Welcome, ${profile.name}`,
          question: 'Manage active wholesale dispatches, cement challans & steel orders:',
          cardTitle: 'Active Wholesale Supply Order',
          cardMeta: 'Site: Velachery Modern Villa • PO #MB-8821',
          cardPhase: 'UltraTech Cement & Tata Tiscon 550D TMT',
          cardMetricLabel: 'ORDER VALUE',
          cardMetricValue: '₹3,45,000',
          cardProgressLabel: 'Delivery Fulfillment',
          cardProgress: 85,
          cardBtnText: 'Open Dispatch Orders & Challans',
          quickActions: [
            {
              icon: '🚚',
              title: 'Generate Delivery Challan',
              desc: 'Dispatch truck load with digital e-way bill & weighbridge slip.',
              color: '#a855f7',
              action: () => onNavigate('projects')
            },
            {
              icon: '📊',
              title: 'Update Wholesale Rates',
              desc: 'Publish daily prices for cement bags, steel rebar & red bricks.',
              color: '#fbbf24',
              action: () => onNavigate('marketplace')
            },
            {
              icon: '📑',
              title: 'Upload Test Certificate',
              desc: 'Attach mill test certs (MTC) for structural steel consignments.',
              color: '#34d399',
              action: () => onNavigate('more')
            }
          ],
          activities: [
            {
              id: 'mat-1',
              icon: '🚚',
              title: 'Truck TN-09-CB-4412 dispatched',
              desc: '150 Bags UltraTech 53G cement delivered and acknowledged by site engineer.',
              time: 'Today, 10:30 AM'
            },
            {
              id: 'mat-2',
              icon: '📑',
              title: 'Steel MTC Certificate generated',
              desc: 'Tata Tiscon 550D heat number 89412 certificate synced with project files.',
              time: 'Today, 09:00 AM'
            },
            {
              id: 'mat-3',
              icon: '💳',
              title: 'Material escrow release cleared',
              desc: '₹1,24,000 credited upon site storekeeper delivery sign-off.',
              time: 'Yesterday'
            }
          ]
        };

      case PLATFORM_ROLES.LOAN:
        return {
          subtitle: 'Bank Construction Loan & Stage-Wise Escrow Desk',
          greeting: `Welcome, ${profile.name}`,
          question: 'Review stage-wise construction inspection certificates for loan disbursement:',
          cardTitle: 'Underwriting & Tranche Disbursement Desk',
          cardMeta: 'Borrower: Prasanth Kumar • Sanction: ₹35,00,000',
          cardPhase: 'Tranche 3: First Floor Slab Completion (₹7,00,000)',
          cardMetricLabel: 'LTV / VALUATION',
          cardMetricValue: '68% Loan to Value',
          cardProgressLabel: 'Total Loan Disbursed',
          cardProgress: 55,
          cardBtnText: 'Review Valuation & Release Tranche',
          quickActions: [
            {
              icon: '🏦',
              title: 'Approve Stage Tranche',
              desc: 'Release ₹7.0L slab milestone based on certified site logs.',
              color: '#06b6d4',
              action: () => onOpenProject(currentProject.id)
            },
            {
              icon: '📑',
              title: 'Review Valuation Report',
              desc: 'Inspect chartered engineer structural stability assessment.',
              color: '#34d399',
              action: () => onNavigate('projects')
            },
            {
              icon: '📈',
              title: 'Loan Scheme Lead Manager',
              desc: 'Review pre-approved home loan applications from prospective builders.',
              color: '#fbbf24',
              action: () => onNavigate('marketplace')
            }
          ],
          activities: [
            {
              id: 'ln-1',
              icon: '🏦',
              title: 'Stage 2 Plinth inspection approved',
              desc: 'Bank valuer signed off plinth beam completion for ₹5.5L disbursement.',
              time: 'Today, 09:30 AM'
            },
            {
              id: 'ln-2',
              icon: '📑',
              title: 'Title Deed legal scrutiny verified',
              desc: 'Clear 30-year encumbrance certificate (EC) approved for property plot.',
              time: 'Yesterday'
            },
            {
              id: 'ln-3',
              icon: '💳',
              title: 'Escrow tranche release completed',
              desc: '₹5,50,000 disbursed directly into dedicated contractor escrow account.',
              time: '2 days ago'
            }
          ]
        };

      case PLATFORM_ROLES.CUSTOMER:
      default:
        return {
          subtitle: 'LabourConnect 2.0 • Property Owner Dashboard',
          greeting: `Good morning, ${profile.name}`,
          question: 'What are you working on today?',
          cardTitle: 'My Current Project',
          cardMeta: `${currentProject.plotDimensions} · ${currentProject.floors} Floors · ${currentProject.location}`,
          cardPhase: currentProject.currentPhase,
          cardMetricLabel: 'BUDGET',
          cardMetricValue: currentProject.estimatedCost,
          cardProgressLabel: 'Overall Build Progress',
          cardProgress: currentProject.progressPercent,
          cardBtnText: 'Open Project Workspace',
          quickActions: [
            {
              icon: '🏗️',
              title: '+ New Project',
              desc: 'Set up plot dimensions, budget, and project milestones.',
              color: '#ffffff',
              action: onCreateProject
            },
            {
              icon: '✨',
              title: '✦ AI Design Studio',
              desc: 'Generate 2D floor plans, 3D elevations, video walkthroughs, and interior designs.',
              color: '#fbbf24',
              action: () => onNavigate('design')
            },
            {
              icon: '🔎',
              title: 'Find Professionals',
              desc: 'Hire verified engineers, worker gangs, materials, and loans.',
              color: '#38bdf8',
              action: () => onNavigate('marketplace')
            }
          ],
          activities: [
            {
              id: 'act-1',
              icon: '🏗️',
              title: 'Project milestone updated',
              desc: 'First floor slab reinforcement inspection passed by Er. Rajesh Varma (Consulting Engineer).',
              time: 'Today, 10:30 AM'
            },
            {
              id: 'act-2',
              icon: '🧱',
              title: 'Material dispatch confirmed',
              desc: 'Sri Balaji Building Materials delivered 150 bags UltraTech 53 Grade Cement to site.',
              time: 'Today, 10:15 AM'
            },
            {
              id: 'act-3',
              icon: '👷',
              title: 'Mason crew checked in',
              desc: 'Ravi Kumar (Master Mason) and 10-man gang on site for concrete pouring batching.',
              time: 'Today, 08:30 AM'
            },
            {
              id: 'act-4',
              icon: '💳',
              title: 'Milestone escrow payout verified',
              desc: 'Phase 3 Ground Floor Structural tranche released securely to contractor.',
              time: 'Yesterday'
            }
          ]
        };
    }
  };

  const dashboard = getRoleDashboard();

  return (
    <div className="home-screen-container" style={{ maxWidth: '960px', margin: '0 auto', padding: '10px 0 60px' }}>
      {/* Authorization Scope Banner */}
      <div 
        style={{ 
          background: '#EAF0E8',
          border: '1px solid #E1E7DF',
          borderRadius: '12px',
          padding: '10px 16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.84rem',
          color: '#26332A'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{profile.icon}</span>
          <span>Logged in as <strong>{profile.name}</strong> ({profile.badge})</span>
        </div>
        <button
          onClick={onOpenAuthModal}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E1E7DF',
            color: '#718B73',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Switch Role Perspective ⇄
        </button>
      </div>

      {/* Greeting */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#718B73', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
          {dashboard.subtitle}
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#26332A', letterSpacing: '-0.03em', lineHeight: 1.2, margin: 0 }}>
          {dashboard.greeting}
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#68736A', marginTop: '4px' }}>
          {dashboard.question}
        </p>
      </div>

      {/* =========================================================
          1. PRIMARY ACTIVE FOCUS CARD
      ========================================================= */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#26332A', margin: 0 }}>
            {dashboard.cardTitle}
          </h2>
          <button
            onClick={() => onNavigate('projects')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#718B73',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>View all assignments</span>
            <span>→</span>
          </button>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E1E7DF',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(38, 51, 42, 0.04)',
            display: 'grid',
            gridTemplateColumns: '320px 1fr'
          }}
        >
          {/* Project Image */}
          <div style={{ height: '100%', minHeight: '220px', position: 'relative' }}>
            <img
              src={currentProject.image}
              alt={currentProject.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#3D8056',
                border: '1px solid #E1E7DF'
              }}
            >
              Active Scope
            </div>
          </div>

          {/* Project Info */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#26332A', marginBottom: '4px' }}>
                    {currentProject.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#68736A' }}>
                    {dashboard.cardMeta}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: '#68736A', display: 'block' }}>{dashboard.cardMetricLabel}</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#718B73' }}>
                    {dashboard.cardMetricValue}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginTop: '20px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ color: '#68736A' }}>
                    Current Phase: <strong style={{ color: '#26332A' }}>{dashboard.cardPhase}</strong>
                  </span>
                  <span style={{ fontWeight: 800, color: '#718B73' }}>
                    {dashboard.cardProgress}% Done
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#F1F4EF', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${dashboard.cardProgress}%`,
                      height: '100%',
                      background: '#718B73',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #E1E7DF' }}>
              <button
                onClick={() => onOpenProject(currentProject.id)}
                style={{
                  background: '#718B73',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(113, 139, 115, 0.25)'
                }}
              >
                <span>{dashboard.cardBtnText}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
