import React, { useState } from 'react';
import Header from './components/common/Header';
import FloatingAiAssistant from './components/ai/FloatingAiAssistant';
import HomeScreen from './components/home/HomeScreen';
import ProjectsScreen from './components/projects/ProjectsScreen';
import ProjectWorkspace from './components/projects/ProjectWorkspace';
import CreateProjectModal from './components/projects/CreateProjectModal';
import MarketplaceScreen from './components/marketplace/MarketplaceScreen';
import ProjectChatScreen from './components/more/ProjectChatScreen';
import MoreScreen from './components/more/MoreScreen';
import AuthModal from './components/auth/AuthModal';
import NotificationsModal from './components/more/NotificationsModal';

// Dedicated Role Workspaces
import EngineerPortal from './components/portals/EngineerPortal';
import ContractorPortal from './components/portals/ContractorPortal';
import EquipmentPortal from './components/portals/EquipmentPortal';
import SupplierPortal from './components/portals/SupplierPortal';
import BankLoanPortal from './components/portals/BankLoanPortal';
import AdminDashboardScreen from './components/admin/AdminDashboardScreen';

// AI Architecture Studio & Generative Tools
import LandToArchitectureStudio from './components/ai-studio/LandToArchitectureStudio';
import AiDesignScreen from './components/ai-studio/AiDesignScreen';
import AiHouseDesignScreen from './components/ai-studio/AiHouseDesignScreen';
import AndroidPwaInstallBanner from './components/common/AndroidPwaInstallBanner';

import {
  MASTER_PROJECTS,
  SKILLED_WORKERS,
  CONSULTING_ENGINEERS,
  EQUIPMENT_RENTALS,
  MATERIAL_PROVIDERS,
  LOAN_PROVIDERS,
  SAMPLE_CHAT_MESSAGES
} from './data/mockData';

import { PLATFORM_ROLES, getRoleProfile } from './utils/rbac';

export default function App() {
  // Navigation & View States: 'home', 'projects', 'marketplace', 'messages', 'more', 'ai-studio', 'design'
  const getInitialNav = () => {
    try {
      const searchTab = new URLSearchParams(window.location.search).get('tab');
      if (searchTab) return searchTab;
      const hashTab = window.location.hash.replace('#', '').trim();
      if (hashTab) return hashTab;
    } catch {
      // ignore
    }
    return 'home';
  };
  const [activeNav, setActiveNav] = useState(getInitialNav);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('overview');

  // Master Data States
  const [projects, setProjects] = useState(MASTER_PROJECTS);
  const [workers, setWorkers] = useState(SKILLED_WORKERS);
  const [engineers, setEngineers] = useState(CONSULTING_ENGINEERS);
  const [equipment, setEquipment] = useState(EQUIPMENT_RENTALS);
  const [materialProviders, setMaterialProviders] = useState(MATERIAL_PROVIDERS);
  const [loanProviders, setLoanProviders] = useState(LOAN_PROVIDERS);
  const [chatMessages, setChatMessages] = useState(SAMPLE_CHAT_MESSAGES);
  const [bookings, setBookings] = useState([]);

  // Modals & Roles
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [createProjectInitialPrompt, setCreateProjectInitialPrompt] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUserRole, setCurrentRole] = useState(PLATFORM_ROLES.CUSTOMER);

  // Currently Active Project Object
  const currentProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const profile = getRoleProfile(currentUserRole);

  // AI Prompt from Home Screen Prompt Bar
  const handleAiPromptSubmit = (promptText) => {
    setCreateProjectInitialPrompt(promptText);
    setCreateProjectModalOpen(true);
  };

  // Open Project Workspace
  const handleOpenProject = (projectId) => {
    setActiveProjectId(projectId);
    setActiveNav('projects');
    setActiveWorkspaceTab('overview');
  };

  // Project Created
  const handleCreateProjectSuccess = (newProj) => {
    setProjects([newProj, ...projects]);
    setActiveProjectId(newProj.id);
    setActiveNav('projects');
    setActiveWorkspaceTab('overview');
  };

  // Marketplace Booking handler
  const handleBookResource = (item) => {
    const newBooking = {
      id: `bk-${Date.now()}`,
      professional: item.name,
      service: item.categoryLabel || item.role,
      project: currentProject?.title || 'Modern Villa Project',
      date: 'Scheduled for Next Week',
      duration: 'Site Assignment',
      status: 'confirmed',
      amount: item.rate
    };
    setBookings([newBooking, ...bookings]);
  };

  // Role Switch Handler with instant state reset
  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    setActiveProjectId(null); // Return to role-specific root workspace
  };

  // Trigger from Floating AI Assistant
  const handleAiTriggerAction = (actionKey) => {
    if (actionKey === 'create_ai_project' || actionKey === 'open_ai_studio') {
      setActiveNav('ai-studio');
    } else if (actionKey === 'open_cost_tab') {
      setActiveNav('projects');
      setActiveProjectId('proj-1');
      setActiveWorkspaceTab('cost');
    } else if (actionKey === 'open_design_tab' || actionKey === 'open_3d_tab') {
      setActiveNav('projects');
      setActiveProjectId('proj-1');
      setActiveWorkspaceTab('design');
    } else if (actionKey === 'find_materials' || actionKey === 'find_workers') {
      setActiveNav('marketplace');
    }
  };

  // Render role-specific workspace for 'projects' navigation
  const renderAuthorizedWorkspace = () => {
    switch (currentUserRole) {
      case PLATFORM_ROLES.ENGINEER:
        return (
          <EngineerPortal 
            projects={projects} 
            onAddBid={(bid) => alert(`Bid submitted successfully!`)}
            onLogSiteProgress={(log) => alert(`Digital site log submitted!`)}
          />
        );

      case PLATFORM_ROLES.LABOUR:
      case 'Labour':
      case 'Contractor':
        return (
          <ContractorPortal 
            projects={projects} 
            onAssignWorkers={(d) => alert(`Gang assigned!`)}
            onLogShift={(s) => alert(`Shift logged!`)}
          />
        );

      case PLATFORM_ROLES.EQUIPMENT:
        return (
          <EquipmentPortal 
            projects={projects} 
          />
        );

      case PLATFORM_ROLES.MATERIAL:
        return (
          <SupplierPortal 
            projects={projects} 
          />
        );

      case PLATFORM_ROLES.LOAN:
        return (
          <BankLoanPortal 
            initialBoq={4020000} 
            onApproveTranche={(t) => alert(`Tranche approved and released into project escrow!`)}
          />
        );

      case PLATFORM_ROLES.ADMIN:
        return (
          <AdminDashboardScreen />
        );

      case PLATFORM_ROLES.CUSTOMER:
      default:
        return activeProjectId ? (
          <ProjectWorkspace
            project={currentProject}
            onBack={() => setActiveProjectId(null)}
            activeTab={activeWorkspaceTab}
            setActiveTab={setActiveWorkspaceTab}
            onOpenBookingModal={() => setActiveNav('marketplace')}
            onOrderMaterials={() => setActiveNav('marketplace')}
            currentUserRole={currentUserRole}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        ) : (
          <ProjectsScreen
            projects={projects}
            onOpenProject={handleOpenProject}
            onCreateProject={() => {
              setCreateProjectInitialPrompt('');
              setCreateProjectModalOpen(true);
            }}
            currentUserRole={currentUserRole}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="app-wrapper">
      {/* 5-Item Horizontal Top Navigation Bar */}
      <Header
        activeNav={activeNav}
        setActiveNav={(nav) => {
          setActiveNav(nav);
        }}
        unreadNotifications={3}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenProfile={() => setActiveNav('more')}
        currentUserRole={currentUserRole}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Content Area: 1 Screen = 1 Clear Purpose */}
      <main className="main-container">
        {/* 1. HOME SCREEN: Role-personalized Home Dashboard */}
        {activeNav === 'home' && (
          <HomeScreen
            projects={projects}
            onOpenProject={handleOpenProject}
            onCreateProject={() => {
              setCreateProjectInitialPrompt('');
              setCreateProjectModalOpen(true);
            }}
            onNavigate={(tab) => {
              setActiveNav(tab);
              if (tab === 'projects') setActiveProjectId(null);
            }}
            currentUserRole={currentUserRole}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {/* 2. DEDICATED ROLE AUTHORIZED WORKSPACE */}
        {activeNav === 'projects' && (
          <div className="role-authorized-workspace-container">
            {renderAuthorizedWorkspace()}
          </div>
        )}

        {/* 3. MARKETPLACE: Unified Single Screen for Engineers, Workers, Equipment, Materials, Loans */}
        {activeNav === 'marketplace' && (
          <MarketplaceScreen
            onBookItem={handleBookResource}
            onNavigate={(tab) => setActiveNav(tab)}
            currentUserRole={currentUserRole}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {/* 4. MESSAGES: Unified Construction Messaging */}
        {activeNav === 'messages' && (
          <ProjectChatScreen messages={chatMessages} />
        )}

        {/* 5. MORE: Notifications, Documents, Payments, Bookings, Profile & Settings */}
        {activeNav === 'more' && (
          <MoreScreen
            bookings={bookings}
            currentUserRole={currentUserRole}
            onRoleChange={handleRoleChange}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {/* 6. AI ARCHITECTURE STUDIO: Dedicated Generative Architecture Workspace */}
        {(activeNav === 'ai-studio' || activeNav === 'design') && (
          <AiHouseDesignScreen
            onPostProject={handleCreateProjectSuccess}
            onNavigate={(tab) => setActiveNav(tab)}
            currentUserRole={currentUserRole}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}
      </main>

      {/* ✦ GLOBAL FLOATING AI ASSISTANT (Bottom-Right Action) */}
      <FloatingAiAssistant
        activeNav={activeNav}
        activeProject={currentProject}
        activeWorkspaceTab={activeWorkspaceTab}
        onTriggerAction={handleAiTriggerAction}
        onNavigate={(tab) => {
          setActiveNav(tab);
          if (tab === 'projects') setActiveProjectId(null);
        }}
        currentUserRole={currentUserRole}
      />

      {/* CREATE PROJECT MODAL */}
      <CreateProjectModal
        isOpen={createProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
        onCreateSuccess={handleCreateProjectSuccess}
        initialPrompt={createProjectInitialPrompt}
      />

      {/* NOTIFICATIONS MODAL */}
      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* AUTH & ROLE MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentRole={currentUserRole}
        onRoleSelect={(role) => {
          handleRoleChange(role);
        }}
      />

      {/* PWA & ANDROID INSTALL BANNER */}
      <AndroidPwaInstallBanner />
    </div>
  );
}
