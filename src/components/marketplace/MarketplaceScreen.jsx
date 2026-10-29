import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Star,
  ShieldCheck,
  MapPin,
  Check,
  Phone,
  Calendar,
  X,
  Building,
  Truck,
  Briefcase,
  Layers,
  Wrench,
  DollarSign,
  Landmark
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getRoleProfile, PLATFORM_ROLES } from '../../utils/rbac';
import {
  CONSULTING_ENGINEERS,
  SKILLED_WORKERS,
  EQUIPMENT_RENTALS,
  MATERIAL_PROVIDERS,
  BANK_LOANS
} from '../../data/mockData';
import MaterialProvidersScreen from './MaterialProvidersScreen';

export default function MarketplaceScreen({ 
  onBookItem, 
  onNavigate,
  currentUserRole = 'Customer',
  onOpenAuthModal
}) {
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'engineers', 'workers', 'equipment', 'materials', 'loans'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [providerActiveToggle, setProviderActiveToggle] = useState(true);

  const profile = getRoleProfile(currentUserRole);
  const isProvider = currentUserRole !== PLATFORM_ROLES.CUSTOMER;


  // Normalise marketplace items
  const engineerItems = CONSULTING_ENGINEERS.map(eng => ({
    id: eng.id,
    type: 'engineers',
    categoryLabel: 'Consulting Engineer',
    name: eng.name,
    subtitle: eng.company,
    role: eng.specialization || 'Civil & Structural Consultant',
    rating: eng.rating || 4.9,
    reviewsCount: eng.reviewsCount || 34,
    completedJobs: eng.projectsCount || 28,
    rate: `₹${eng.consultationFee?.toLocaleString('en-IN') || '5,000'}`,
    rateUnit: 'per site visit',
    city: eng.city || 'Chennai',
    verified: true,
    avatar: eng.avatar,
    phone: eng.phone || '+91 98401 99882',
    about: eng.bio || 'Licensed chartered structural engineer specializing in multi-storey residential villas and IS 456 compliance.',
    services: [
      'RCC Foundation & Slab Inspection',
      'Structural Stability Certification (10 Years)',
      'Digital Geo-Tagged Site Inspection Log'
    ]
  }));

  const workerItems = SKILLED_WORKERS.map(wrk => ({
    id: wrk.id,
    type: 'workers',
    categoryLabel: 'Skilled Labour',
    name: wrk.name,
    subtitle: wrk.trade,
    role: wrk.trade,
    rating: wrk.rating || 4.8,
    reviewsCount: wrk.reviewsCount || 42,
    completedJobs: wrk.completedJobs || 24,
    rate: `₹${wrk.dailyRate?.toLocaleString('en-IN') || '1,100'}`,
    rateUnit: wrk.unit || 'per day (8 hrs)',
    city: wrk.city || 'Chennai',
    verified: wrk.verified !== false,
    avatar: wrk.avatar,
    phone: wrk.phone || '+91 98401 23456',
    about: wrk.bio || 'Master craftsman with extensive experience in precision masonry, formwork, and electrical wiring.',
    services: wrk.skills || ['Brickwork & Plastering', 'RCC Foundation', 'Formwork & Shuttering']
  }));

  const equipmentItems = EQUIPMENT_RENTALS.map(eq => ({
    id: eq.id,
    type: 'equipment',
    categoryLabel: 'Machinery Rental',
    name: eq.name,
    subtitle: eq.category,
    role: 'Heavy Construction Machinery',
    rating: eq.rating || 4.85,
    reviewsCount: eq.reviewsCount || 29,
    completedJobs: eq.completedJobs || 45,
    rate: `₹${eq.dailyRate?.toLocaleString('en-IN') || '8,500'}`,
    rateUnit: 'per day (incl. operator)',
    city: eq.city || 'Chennai',
    verified: true,
    avatar: eq.image,
    phone: '+91 98402 33445',
    about: eq.specifications || 'Heavy-duty certified equipment with skilled operator and diesel fuel included.',
    services: [
      'Site Excavation & Trenching',
      'RCC Concrete Batching & Needle Vibration',
      'Scaffolding & Props Staging'
    ]
  }));

  const materialItems = MATERIAL_PROVIDERS.map(mat => ({
    id: mat.id,
    type: 'materials',
    categoryLabel: 'Wholesale Supplier',
    name: mat.companyName,
    subtitle: mat.delivery,
    role: 'Cement, Steel & Bricks Wholesale',
    rating: mat.rating || 4.8,
    reviewsCount: 56,
    completedJobs: 180,
    rate: 'Live Wholesale Rates',
    rateUnit: 'direct yard dispatch',
    city: mat.city || 'Chennai',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=400&q=80',
    phone: mat.contact || '+91 98401 55678',
    about: 'Authorized primary distributor for UltraTech, Tata Tiscon, and Wire-cut red brick kilns with same-day truck delivery.',
    services: mat.products?.map(p => `${p.name} — ${p.price}`) || ['UltraTech 53 Grade Cement', 'Tata Tiscon 550D TMT', 'M-Sand & 20mm Blue Metal']
  }));

  const loanItems = BANK_LOANS.map(ln => ({
    id: ln.id,
    type: 'loans',
    categoryLabel: 'Financing & Loans',
    name: ln.bankName,
    subtitle: ln.loanType,
    role: 'Construction Loan Scheme',
    rating: 4.9,
    reviewsCount: 65,
    completedJobs: 320,
    rate: ln.interestRate,
    rateUnit: 'annual interest',
    city: 'All Cities',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=400&q=80',
    phone: '1800 22 2244',
    about: ln.disbursementMode || 'Direct stage escrow tranche disbursements linked directly to certified site inspections.',
    services: ln.features || ['Zero Prepayment Penalty', 'Fast 48h Digital Sanction', 'Stage-wise Escrow Release']
  }));

  const allItems = [
    ...engineerItems,
    ...workerItems,
    ...equipmentItems,
    ...materialItems,
    ...loanItems
  ];

  // Filter items
  const filteredItems = allItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.type === activeCategory;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'all' || item.city.toLowerCase().includes(selectedCity.toLowerCase()) || item.city === 'All Cities';
    return matchesCategory && matchesSearch && matchesCity;
  });

  const categories = [
    { id: 'all', label: 'All Resources', icon: '✦', count: allItems.length },
    { id: 'engineers', label: 'Engineers', icon: '👷', count: engineerItems.length },
    { id: 'workers', label: 'Workers', icon: '🔨', count: workerItems.length },
    { id: 'equipment', label: 'Equipment', icon: '🚜', count: equipmentItems.length },
    { id: 'materials', label: 'Materials', icon: '🧱', count: materialItems.length },
    { id: 'loans', label: 'Loans', icon: '🏦', count: loanItems.length }
  ];

  const handleRequestService = (provider) => {
    setBookingSuccess(true);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    if (onBookItem) {
      onBookItem(provider);
    }
  };

  return (
    <div className="marketplace-screen-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '10px 0 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#26332A', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Construction Marketplace
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#68736A', margin: 0 }}>
              {isProvider 
                ? `Provider Portal for ${profile.name} (${profile.badge}) • Manage listings & incoming client requests` 
                : 'Hire verified civil engineers, skilled worker gangs, heavy machinery, wholesale materials, and construction financing'}
            </p>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E1E7DF',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              color: '#718B73',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(38, 51, 42, 0.04)'
            }}
          >
            <span>{profile.icon}</span>
            <span>Mode: <strong>{isProvider ? 'Service Provider' : 'Buyer / Hirer'}</strong></span>
          </div>
        </div>
      </div>

      {/* Provider Desk & Active Listing Card (Only for Provider Roles) */}
      {isProvider && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E1E7DF',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(38, 51, 42, 0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img
                src={profile.avatar}
                alt={profile.name}
                style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #718B73' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#26332A', margin: 0 }}>
                    {profile.name}
                  </h3>
                  <span style={{ color: '#3D8056', fontSize: '0.85rem' }}>✓ Verified Partner</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#68736A' }}>
                  {profile.title} • 📍 Chennai Region
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: '#68736A', display: 'block' }}>INCOMING INQUIRIES</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#3D8056' }}>3 Active RFPs</span>
              </div>

              <button
                onClick={() => setProviderActiveToggle(!providerActiveToggle)}
                style={{
                  background: providerActiveToggle ? '#EAF0E8' : '#FDF2F2',
                  border: providerActiveToggle ? '1px solid #718B73' : '1px solid #C34D4D',
                  color: providerActiveToggle ? '#3D8056' : '#C34D4D',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {providerActiveToggle ? '● Listing Live' : '○ Accepting Paused'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div 
        style={{
          background: '#FFFFFF',
          border: '1px solid #E1E7DF',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 1px 3px rgba(38, 51, 42, 0.04)'
        }}
      >
        {/* Search Input & City Dropdown */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div 
            style={{
              flex: 1,
              minWidth: '260px',
              background: '#FFFFFF',
              border: '1px solid #E1E7DF',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Search style={{ width: '18px', height: '18px', color: '#68736A' }} />
            <input
              type="text"
              placeholder="Search engineers, masons, electricians, cement, JCB, loans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#26332A',
                fontSize: '0.9rem'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', color: '#68736A', cursor: 'pointer' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Location Selector */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E1E7DF',
              borderRadius: '10px',
              padding: '10px 16px',
              color: '#26332A',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="all">📍 All Locations</option>
            <option value="chennai">Chennai</option>
            <option value="bengaluru">Bengaluru</option>
            <option value="hyderabad">Hyderabad</option>
          </select>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  background: isActive ? '#718B73' : '#EAF0E8',
                  color: isActive ? '#FFFFFF' : '#26332A',
                  border: isActive ? '1px solid #718B73' : '1px solid #E1E7DF',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s'
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span 
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#68736A',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    border: isActive ? 'none' : '1px solid #E1E7DF'
                  }}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Direct Material Wholesale Mandi View */}
      {activeCategory === 'materials' ? (
        <MaterialProvidersScreen
          providers={MATERIAL_PROVIDERS}
          onOrderSuccess={(order) => {
            onBookItem({
              name: order.supplier,
              categoryLabel: 'Wholesale Material Supply',
              role: order.item,
              rate: `${order.quantity} (${order.item})`
            });
          }}
        />
      ) : (
        <>
          {/* Results Count & Grid */}
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#68736A' }}>
              Showing <strong style={{ color: '#26332A' }}>{filteredItems.length}</strong> verified construction resources
            </span>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '20px'
            }}
          >
            {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setSelectedProvider(item);
              setBookingSuccess(false);
            }}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E1E7DF',
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px',
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
            {/* Top Info */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <img
                src={item.avatar}
                alt={item.name}
                style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #E1E7DF' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#26332A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </span>
                  {item.verified && (
                    <span style={{ color: '#3D8056', fontSize: '0.85rem' }} title="Verified by LabourConnect">✓</span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#718B73', fontWeight: 600, marginBottom: '4px' }}>
                  {item.categoryLabel} • {item.subtitle}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#68736A' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#B7791F', fontWeight: 700 }}>
                    ★ {item.rating}
                  </span>
                  <span>{item.completedJobs} builds completed</span>
                  <span>📍 {item.city}</span>
                </div>
              </div>
            </div>

            {/* Services preview tags */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {item.services?.slice(0, 2).map((srv, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#F1F4EF',
                    color: '#68736A',
                    fontSize: '0.72rem',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid #E1E7DF'
                  }}
                >
                  {srv.length > 32 ? srv.substring(0, 32) + '...' : srv}
                </span>
              ))}
            </div>

            {/* Bottom Rate & CTA */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid #E1E7DF'
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: '#68736A', display: 'block' }}>PRICING / RATE</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#26332A' }}>
                  {item.rate} <span style={{ fontSize: '0.7rem', color: '#68736A', fontWeight: 400 }}>{item.rateUnit}</span>
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProvider(item);
                  setBookingSuccess(false);
                }}
                style={{
                  background: '#EAF0E8',
                  border: '1px solid #E1E7DF',
                  color: '#718B73',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                View Profile →
              </button>
            </div>
          </div>
        ))}
      </div>
      </>
      )}

      {/* =========================================================
          REUSABLE PROVIDER PROFILE MODAL / DRAWER
      ========================================================= */}
      {selectedProvider && (
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
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E1E7DF',
              borderRadius: '20px',
              width: '580px',
              maxWidth: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(38, 51, 42, 0.1)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img
                  src={selectedProvider.avatar}
                  alt={selectedProvider.name}
                  style={{ width: '64px', height: '64px', borderRadius: '14px', objectFit: 'cover', border: '2px solid #718B73' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#26332A', margin: 0 }}>
                      {selectedProvider.name}
                    </h2>
                    {selectedProvider.verified && <span style={{ color: '#3D8056' }}>✓</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#718B73', fontWeight: 600 }}>
                    {selectedProvider.categoryLabel} • {selectedProvider.role}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#68736A', marginTop: '2px' }}>
                    ★ {selectedProvider.rating} ({selectedProvider.reviewsCount} reviews) • {selectedProvider.completedJobs} projects • 📍 {selectedProvider.city}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedProvider(null)}
                style={{
                  background: '#F1F4EF',
                  border: 'none',
                  color: '#68736A',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* About Section */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#26332A', textTransform: 'uppercase', marginBottom: '6px' }}>
                About & Experience
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#68736A', lineHeight: 1.5 }}>
                {selectedProvider.about}
              </p>
            </div>

            {/* Services & Capabilities */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#26332A', textTransform: 'uppercase', marginBottom: '8px' }}>
                Services & Deliverables
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedProvider.services?.map((srv, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#26332A' }}>
                    <span style={{ color: '#3D8056' }}>✓</span>
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Card & Booking Action */}
            <div 
              style={{
                background: '#FAFAF7',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #E1E7DF',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: '#68736A', display: 'block' }}>STANDARD RATE / FEE</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#718B73' }}>
                  {selectedProvider.rate}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#68736A', marginLeft: '4px' }}>{selectedProvider.rateUnit}</span>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#3D8056', textAlign: 'right' }}>
                <div>Escrow Protected Payout</div>
                <div style={{ color: '#68736A' }}>Release only upon sign-off</div>
              </div>
            </div>

            {bookingSuccess ? (
              <div 
                style={{
                  background: '#EAF0E8',
                  border: '1px solid #718B73',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'center',
                  color: '#3D8056',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                ✓ Service request sent! {selectedProvider.name} will contact you shortly.
              </div>
            ) : (
              <button
                onClick={() => handleRequestService(selectedProvider)}
                style={{
                  width: '100%',
                  background: '#718B73',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(113, 139, 115, 0.25)'
                }}
              >
                Request Service & Book →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
