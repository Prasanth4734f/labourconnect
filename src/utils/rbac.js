/**
 * LabourConnect 2.0 - Role-Based Access Control (RBAC) & Screen Architecture Matrix
 * 
 * Defines the 7 discrete platform authorization roles, their personas,
 * access rights, workspace tabs, tailored dashboards, and navigation structures.
 */

export const PLATFORM_ROLES = {
  CUSTOMER: 'Customer',
  ENGINEER: 'Engineer / Architect',
  LABOUR: 'Labour / Worker',
  EQUIPMENT: 'Equipment Provider',
  MATERIAL: 'Material Provider',
  LOAN: 'Loan Provider',
  ADMIN: 'Admin'
};

export const ROLE_PROFILES = {
  [PLATFORM_ROLES.CUSTOMER]: {
    id: PLATFORM_ROLES.CUSTOMER,
    name: 'Prasanth Kumar',
    title: 'Property Owner & Builder',
    badge: 'Owner / Client',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    initial: 'P',
    color: '#f59e0b',
    icon: '🏡',
    description: 'Planning & financing a modern 3BHK residential villa in Chennai.',
    navItems: [
      { id: 'home', label: 'Home', icon: '🏠' },
      { id: 'design', label: 'AI Design Studio', icon: '✨' },
      { id: 'projects', label: 'Projects', icon: '🏗️' },
      { id: 'marketplace', label: 'Marketplace', icon: '🔎' },
      { id: 'messages', label: 'Messages', icon: '💬' },
      { id: 'more', label: 'More', icon: '☰' }
    ],
    authorizedTabs: ['overview', 'design', 'cost', 'construction', 'team'],
    canCreateProject: true,
    canEditDesign: true,
    canProCAD: false,
    canViewFinancials: true,
    canLogSiteExecution: false,
    canDisburseEscrow: true,
    canApplyLoan: true,
    isMarketplaceBuyer: true,
    isMarketplaceProvider: false,
    aiCapabilities: [
      'Design my house',
      'Modify my design',
      'Calculate cost',
      'Calculate materials',
      'Find engineers',
      'Find workers',
      'Find equipment',
      'Find materials',
      'Explain my project'
    ]
  },
  [PLATFORM_ROLES.ENGINEER]: {
    id: PLATFORM_ROLES.ENGINEER,
    name: 'Er. Rajesh Varma, M.E. (Struct)',
    title: 'Chartered Structural Engineer & Architect',
    badge: 'Licensed Consulting Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    initial: 'R',
    color: '#38bdf8',
    icon: '👷',
    description: 'Lead Structural Consultant managing CAD designs, IS 456 / NBC compliance, and site inspection sign-offs.',
    navItems: [
      { id: 'home', label: 'Dashboard', icon: '📊' },
      { id: 'projects', label: 'Projects', icon: '🏗️' },
      { id: 'marketplace', label: 'Marketplace', icon: '🔎' },
      { id: 'messages', label: 'Messages', icon: '💬' },
      { id: 'more', label: 'More', icon: '☰' }
    ],
    authorizedTabs: ['overview', 'design', 'cost', 'construction', 'team'],
    canCreateProject: true,
    canEditDesign: true,
    canProCAD: true,
    canViewFinancials: true,
    canLogSiteExecution: true,
    canDisburseEscrow: false,
    canApplyLoan: false,
    isMarketplaceBuyer: false,
    isMarketplaceProvider: true,
    aiCapabilities: [
      'Analyze floor plan & by-laws',
      'Check structural dimensions',
      'Compare design versions',
      'Generate detailed BOQ',
      'Explain cost variations',
      'Create construction schedule',
      'Draft digital site inspection report'
    ]
  },
  [PLATFORM_ROLES.LABOUR]: {
    id: PLATFORM_ROLES.LABOUR,
    name: 'Ravi Kumar & Gang (10 Masons)',
    title: 'Master Mason & General Contractor',
    badge: 'Mason Gang Leader',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    initial: 'M',
    color: '#10b981',
    icon: '🔨',
    description: 'On-site execution contractor handling formwork, shuttering, brickwork, and daily wage muster roll.',
    navItems: [
      { id: 'home', label: 'Home', icon: '🏠' },
      { id: 'marketplace', label: 'Jobs', icon: '💼' },
      { id: 'projects', label: 'My Work', icon: '🔨' },
      { id: 'messages', label: 'Messages', icon: '💬' },
      { id: 'more', label: 'Earnings & More', icon: '💰' }
    ],
    authorizedTabs: ['overview', 'design', 'cost', 'construction', 'team'],
    canCreateProject: false,
    canEditDesign: false,
    canProCAD: false,
    canViewFinancials: false, // Restricted from sensitive loan/owner margins; sees daily material indent
    canLogSiteExecution: true, // Primary task logger & photo uploader
    canDisburseEscrow: false,
    canApplyLoan: false,
    isMarketplaceBuyer: false,
    isMarketplaceProvider: true,
    aiCapabilities: [
      'Explain task blueprint dimensions',
      'Daily material bag calculator',
      'Site attendance muster assistant'
    ]
  },
  [PLATFORM_ROLES.EQUIPMENT]: {
    id: PLATFORM_ROLES.EQUIPMENT,
    name: 'Balaji Earthmovers & Heavy Machinery',
    title: 'Fleet Operator & Machinery Vendor',
    badge: 'Equipment Fleet Operator',
    avatar: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=400&q=80',
    initial: 'E',
    color: '#f97316',
    icon: '🚜',
    description: 'Supplies certified JCB excavators, mobile concrete mixers, and steel scaffolding props.',
    navItems: [
      { id: 'home', label: 'Dashboard', icon: '📊' },
      { id: 'marketplace', label: 'Equipment Fleet', icon: '🚜' },
      { id: 'projects', label: 'Bookings & Sites', icon: '📅' },
      { id: 'messages', label: 'Messages', icon: '💬' },
      { id: 'more', label: 'Earnings & More', icon: '💰' }
    ],
    authorizedTabs: ['overview', 'design', 'cost', 'construction', 'team'],
    canCreateProject: false,
    canEditDesign: false,
    canProCAD: false,
    canViewFinancials: false,
    canLogSiteExecution: true, // Machine run hours & diesel logs
    canDisburseEscrow: false,
    canApplyLoan: false,
    isMarketplaceBuyer: false,
    isMarketplaceProvider: true,
    aiCapabilities: [
      'Excavation volume & machine hours estimator',
      'Fleet maintenance schedule logger'
    ]
  },
  [PLATFORM_ROLES.MATERIAL]: {
    id: PLATFORM_ROLES.MATERIAL,
    name: 'Sri Balaji Wholesale Building Materials',
    title: 'Cement, Steel & Brick Distributor',
    badge: 'Authorized Material Distributor',
    avatar: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=400&q=80',
    initial: 'S',
    color: '#a855f7',
    icon: '🧱',
    description: 'Primary wholesale distributor for UltraTech 53 Grade Cement, Tata Tiscon 550D TMT Rebar, and Red Bricks.',
    navItems: [
      { id: 'home', label: 'Dashboard', icon: '📊' },
      { id: 'marketplace', label: 'Products & Rates', icon: '🧱' },
      { id: 'projects', label: 'Orders & Dispatches', icon: '🚚' },
      { id: 'messages', label: 'Messages', icon: '💬' },
      { id: 'more', label: 'Invoices & More', icon: '📄' }
    ],
    authorizedTabs: ['overview', 'design', 'cost', 'construction', 'team'],
    canCreateProject: false,
    canEditDesign: false,
    canProCAD: false,
    canViewFinancials: false,
    canLogSiteExecution: false,
    canDisburseEscrow: false,
    canApplyLoan: false,
    isMarketplaceBuyer: false,
    isMarketplaceProvider: true,
    aiCapabilities: [
      'Truck load batching & delivery scheduler',
      'Live wholesale rate indexer'
    ]
  },
  [PLATFORM_ROLES.LOAN]: {
    id: PLATFORM_ROLES.LOAN,
    name: 'State Bank Construction Finance Desk',
    title: 'Chief Home Loan Underwriter & Valuer',
    badge: 'Bank Loan Underwriter',
    avatar: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=400&q=80',
    initial: 'B',
    color: '#06b6d4',
    icon: '🏦',
    description: 'Oversees stage-wise construction loan tranche approvals linked to engineer site verification certificates.',
    navItems: [
      { id: 'home', label: 'Dashboard', icon: '📊' },
      { id: 'marketplace', label: 'Loan Schemes', icon: '🏦' },
      { id: 'projects', label: 'Tranche Approvals', icon: '💳' },
      { id: 'messages', label: 'Messages', icon: '💬' },
      { id: 'more', label: 'Documents & More', icon: '📄' }
    ],
    authorizedTabs: ['overview', 'design', 'cost', 'construction', 'team'],
    canCreateProject: false,
    canEditDesign: false,
    canProCAD: false,
    canViewFinancials: true, // Full valuation & tranche schedule
    canLogSiteExecution: false,
    canDisburseEscrow: true, // Approves loan tranches
    canApplyLoan: false,
    isMarketplaceBuyer: false,
    isMarketplaceProvider: true,
    aiCapabilities: [
      'Stage valuation & LTV risk analysis',
      'Construction escrow tranche validator'
    ]
  },
  [PLATFORM_ROLES.ADMIN]: {
    id: PLATFORM_ROLES.ADMIN,
    name: 'Platform Compliance & Super Admin',
    title: 'Chief Ecosystem Auditor',
    badge: 'System Super Admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    initial: 'A',
    color: '#ef4444',
    icon: '🛡️',
    description: 'Ecosystem governance: provider verification approvals, escrow payouts, and system telemetry.',
    navItems: [
      { id: 'home', label: 'Admin Desk', icon: '🛡️' },
      { id: 'projects', label: 'All Projects', icon: '🏗️' },
      { id: 'marketplace', label: 'Verification Queue', icon: '✓' },
      { id: 'messages', label: 'Audit Logs', icon: '📑' },
      { id: 'more', label: 'Ecosystem Settings', icon: '⚙️' }
    ],
    authorizedTabs: ['overview', 'design', 'cost', 'construction', 'team'],
    canCreateProject: true,
    canEditDesign: true,
    canProCAD: true,
    canViewFinancials: true,
    canLogSiteExecution: true,
    canDisburseEscrow: true,
    canApplyLoan: false,
    isMarketplaceBuyer: true,
    isMarketplaceProvider: true,
    aiCapabilities: [
      'Ecosystem risk & fraud audit',
      'Provider credential automated verification',
      'Platform analytics summarizer'
    ]
  }
};

/**
 * Get profile config for a given role (with fallback for legacy 'Labour' -> 'Labour / Worker')
 */
export function getRoleProfile(role = PLATFORM_ROLES.CUSTOMER) {
  if (role === 'Labour' || role === 'Contractor') {
    return ROLE_PROFILES[PLATFORM_ROLES.LABOUR];
  }
  return ROLE_PROFILES[role] || ROLE_PROFILES[PLATFORM_ROLES.CUSTOMER];
}

/**
 * Check if a specific feature or tab is authorized for the given role
 */
export function checkPermission(role, action) {
  const profile = getRoleProfile(role);
  return !!profile[action];
}
