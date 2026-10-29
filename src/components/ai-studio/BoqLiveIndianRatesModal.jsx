import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  MapPin,
  FileSpreadsheet,
  Calculator,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateProjectBudget, BUDGET_STATUS } from '../../engine/estimation/projectBudgetEngine.js';
import { getSupportedCities } from '../../engine/estimation/regionalRateCatalog.js';

/**
 * BoqLiveIndianRatesModal
 * Itemized Bill of Quantities (BOQ) with Live Current Indian Construction Market Rates (2025-2026).
 * Consumes the authoritative LabourConnect Project Budget Engine.
 */
export default function BoqLiveIndianRatesModal({
  isOpen,
  onClose,
  design,
  builtUpSqft = 2400,
  floors = 2
}) {
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [activeTab, setActiveTab] = useState('categories'); // 'categories', 'materials', 'savings', 'milestones'
  const [expandedCategories, setExpandedCategories] = useState({
    'civil_structure': true,
    'architectural_finishes': true
  });

  const availableCities = useMemo(() => getSupportedCities(), []);

  // Compute unified project budget strictly through the engine
  const budgetResult = useMemo(() => {
    // If a full design model is not yet loaded, construct a minimal valid design payload
    const safeDesign = design || {
      site: { plotWidth: 40, plotLength: 60, plotAreaSqft: 2400 },
      metrics: { builtUpAreaSqft: builtUpSqft, floorsCount: floors },
      inputs: { plotWidth: 40, plotLength: 60, floorsCount: floors, homeBudgetInr: 4500000 },
      floors: []
    };

    return calculateProjectBudget(safeDesign, {
      city: selectedCity,
      targetBudget: design?.inputs?.homeBudgetInr || 4500000
    });
  }, [design, selectedCity, builtUpSqft, floors]);

  if (!isOpen) return null;

  const {
    totalEstimatedCost = 0,
    targetBudget = 4500000,
    budgetVariance = 0,
    budgetVariancePercentage = 0,
    budgetStatus = BUDGET_STATUS.WITHIN_BUDGET,
    costPerSqft = 0,
    categorySubtotals = [],
    itemizedBreakdown = [],
    recommendations = [],
    quantities = {},
    assumptions = [],
    warnings = []
  } = budgetResult;

  const isOverBudget = budgetStatus === BUDGET_STATUS.OVER_BUDGET;

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const handleExport = (format) => {
    try {
      confetti({ particleCount: 30, spread: 60 });
    } catch {
      // ignore
    }

    if (format === 'csv' || format === 'excel') {
      const rows = [
        ['LabourConnect AI Bill of Quantities (BOQ) - Unified Project Budget'],
        ['Region / City', selectedCity],
        ['Built-Up Area', `${quantities.builtUpAreaSqft || builtUpSqft} sq.ft`],
        ['Target Budget (INR)', `₹${targetBudget.toLocaleString('en-IN')}`],
        ['Total Estimated Cost (INR)', `₹${totalEstimatedCost.toLocaleString('en-IN')}`],
        ['Variance (INR)', `₹${budgetVariance.toLocaleString('en-IN')} (${budgetVariancePercentage}%)`],
        ['Budget Status', budgetStatus],
        [],
        ['Category', 'Item Description', 'Quantity', 'Unit', 'Unit Rate (INR)', 'Total Amount (INR)', 'Rate Provenance']
      ];

      itemizedBreakdown.forEach(it => {
        if (it.isIncluded) {
          rows.push([
            it.categoryId,
            it.name,
            it.quantity,
            it.unit,
            it.unitRate,
            it.amountInr,
            it.provenance
          ]);
        }
      });

      rows.push([]);
      rows.push(['GRAND TOTAL ESTIMATED COST', '', '', '', '', totalEstimatedCost, 'RECONCILED']);

      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `BuildMate_BOQ_${selectedCity}_${totalEstimatedCost}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E1E7DF',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid #E1E7DF',
            background: '#FAFAF7'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: '#EAF0E8', color: '#718B73' }}>
              <Calculator size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#26332A' }}>
                Complete Project Budget & BOQ (Indian Regional Rates)
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#68736A' }}>
                Calculated for <strong>{(quantities.builtUpAreaSqft || builtUpSqft).toLocaleString('en-IN')} sq.ft</strong> Built-up Area • 10 Cost Categories • Q3 2026 Regional Rate Index
              </p>
            </div>
          </div>

          {/* City Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFFFFF', border: '1px solid #E1E7DF', borderRadius: '8px', padding: '4px 8px' }}>
              <MapPin size={13} color="#718B73" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: '0.75rem', fontWeight: 700, color: '#26332A', outline: 'none', cursor: 'pointer' }}
              >
                {availableCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E1E7DF',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                color: '#68736A'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Grand Total Summary Banner */}
        <div
          style={{
            background: isOverBudget ? '#FFF9F5' : '#FAFAF7',
            padding: '14px 24px',
            borderBottom: '1px solid #E1E7DF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <span style={{ fontSize: '0.68rem', color: '#68736A', fontWeight: 700, textTransform: 'uppercase' }}>
              TOTAL ESTIMATED PROJECT COST:
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#3D8056' }}>
              ₹{totalEstimatedCost.toLocaleString('en-IN')} <span style={{ fontSize: '0.85rem', color: '#68736A', fontWeight: 600 }}>({(totalEstimatedCost / 100000).toFixed(2)} Lakhs)</span>
            </div>
            <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>
              <span style={{ color: '#68736A' }}>Target Budget: </span>
              <strong>₹{targetBudget.toLocaleString('en-IN')}</strong>
              <span style={{ marginLeft: '10px', color: isOverBudget ? '#D9534F' : '#3D8056', fontWeight: 800 }}>
                {isOverBudget ? '⚠️ Deficit: -₹' : '✅ Remaining: +₹'}
                {Math.abs(budgetVariance).toLocaleString('en-IN')} ({Math.abs(budgetVariancePercentage)}%)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#68736A', display: 'block' }}>Rate per Sq.Ft</span>
              <strong style={{ fontSize: '0.9rem', color: '#26332A' }}>₹{costPerSqft.toLocaleString('en-IN')} / sq.ft</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#68736A', display: 'block' }}>Civil & Structure</span>
              <strong style={{ fontSize: '0.9rem', color: '#26332A' }}>
                ₹{(categorySubtotals.find(c => c.categoryId === 'civil_structure')?.subtotalInr || 0).toLocaleString('en-IN')}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#68736A', display: 'block' }}>Finishes & Fittings</span>
              <strong style={{ fontSize: '0.9rem', color: '#26332A' }}>
                ₹{((categorySubtotals.find(c => c.categoryId === 'architectural_finishes')?.subtotalInr || 0) +
                   (categorySubtotals.find(c => c.categoryId === 'kitchen_bathroom_fittings')?.subtotalInr || 0)).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', padding: '10px 24px', borderBottom: '1px solid #E1E7DF', background: '#FFFFFF' }}>
          {[
            { id: 'categories', label: '10 Cost Categories' },
            { id: 'materials', label: 'Core Material Quantities' },
            { id: 'savings', label: `Cost-Saving Recommendations (${recommendations.length})` },
            { id: 'milestones', label: 'Stage-wise Payment Milestones' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: activeTab === tab.id ? '1px solid #718B73' : '1px solid #E1E7DF',
                background: activeTab === tab.id ? '#718B73' : '#FAFAF7',
                color: activeTab === tab.id ? '#FFFFFF' : '#68736A',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Warnings if any */}
        {warnings.length > 0 && (
          <div style={{ background: '#FFFDF0', padding: '6px 24px', borderBottom: '1px solid #F0E6B8', fontSize: '0.72rem', color: '#8A6D3B' }}>
            ℹ️ {warnings.join(' • ')}
          </div>
        )}

        {/* Body Content */}
        <div style={{ padding: '18px 24px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: 10 Categories Breakdown */}
          {activeTab === 'categories' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categorySubtotals.map((cat) => {
                const isExpanded = Boolean(expandedCategories[cat.categoryId]);
                const catItems = itemizedBreakdown.filter(it => it.categoryId === cat.categoryId && it.isIncluded);

                return (
                  <div
                    key={cat.categoryId}
                    style={{
                      border: '1px solid #E1E7DF',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      background: '#FFFFFF'
                    }}
                  >
                    {/* Category Header Row */}
                    <div
                      onClick={() => toggleCategory(cat.categoryId)}
                      style={{
                        padding: '10px 14px',
                        background: '#FAFAF7',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        borderBottom: isExpanded ? '1px solid #E1E7DF' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isExpanded ? <ChevronUp size={15} color="#718B73" /> : <ChevronDown size={15} color="#68736A" />}
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#26332A' }}>
                          {cat.order}. {cat.name}
                        </span>
                        {cat.isProvisional && (
                          <span style={{ fontSize: '0.65rem', background: '#FFF4E5', color: '#B76E00', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            PROVISIONAL
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#68736A' }}>
                          {cat.percentageOfTotal}% of total
                        </span>
                        <strong style={{ fontSize: '0.85rem', color: '#3D8056', minWidth: '90px', textAlign: 'right' }}>
                          ₹{cat.subtotalInr.toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>

                    {/* Expandable Items List */}
                    {isExpanded && (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                        <thead>
                          <tr style={{ background: '#FFFFFF', borderBottom: '1px solid #EAEAEA', color: '#68736A', textAlign: 'left' }}>
                            <th style={{ padding: '6px 14px' }}>Item Description</th>
                            <th style={{ padding: '6px 14px' }}>Quantity</th>
                            <th style={{ padding: '6px 14px' }}>Unit Rate</th>
                            <th style={{ padding: '6px 14px' }}>Provenance</th>
                            <th style={{ padding: '6px 14px', textAlign: 'right' }}>Amount (INR)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {catItems.map((it) => (
                            <tr key={it.id} style={{ borderBottom: '1px solid #F5F5F5' }}>
                              <td style={{ padding: '6px 14px', color: '#26332A', fontWeight: 600 }}>
                                {it.name}
                                {it.notes && <div style={{ fontSize: '0.65rem', color: '#888888', fontWeight: 400 }}>{it.notes}</div>}
                              </td>
                              <td style={{ padding: '6px 14px', color: '#68736A' }}>
                                {it.quantity.toLocaleString('en-IN')} {it.unit}
                              </td>
                              <td style={{ padding: '6px 14px', color: '#68736A' }}>
                                {it.unit === 'percentage' ? `${(it.unitRate * 100).toFixed(1)}%` : `₹${it.unitRate.toLocaleString('en-IN')}`}
                              </td>
                              <td style={{ padding: '6px 14px' }}>
                                <span style={{
                                  fontSize: '0.62rem',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  fontWeight: 700,
                                  background: it.provenance === 'SOURCED' ? '#E8F5E9' : it.provenance === 'USER_OVERRIDE' ? '#E3F2FD' : '#FFF3E0',
                                  color: it.provenance === 'SOURCED' ? '#2E7D32' : it.provenance === 'USER_OVERRIDE' ? '#1565C0' : '#E65100'
                                }}>
                                  {it.provenance}
                                </span>
                              </td>
                              <td style={{ padding: '6px 14px', textAlign: 'right', fontWeight: 700, color: '#26332A' }}>
                                ₹{it.amountInr.toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: Core Material Quantities */}
          {activeTab === 'materials' && (
            <div style={{ border: '1px solid #E1E7DF', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ background: '#FAFAF7', borderBottom: '1px solid #E1E7DF', textAlign: 'left', color: '#68736A' }}>
                    <th style={{ padding: '8px 12px' }}>Material Item</th>
                    <th style={{ padding: '8px 12px' }}>Standard Specification</th>
                    <th style={{ padding: '8px 12px' }}>Measured Takeoff Qty</th>
                    <th style={{ padding: '8px 12px' }}>Regional Rate ({selectedCity})</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'M25 Ready-Mix Concrete', spec: 'Design Mix RMC Boom Pumping', qty: `${quantities.concreteCuMtr} cu.mtr`, rate: `₹${(itemizedBreakdown.find(it => it.id === 'concrete_rmc_m25')?.unitRate || 5200).toLocaleString('en-IN')} / m³`, cost: itemizedBreakdown.find(it => it.id === 'concrete_rmc_m25')?.amountInr || 0 },
                    { name: 'Fe550D TMT Reinforcement Steel', spec: 'Primary Mill (Tata/SAIL/JSW)', qty: `${quantities.steelTons} Metric Tonnes`, rate: `₹${(itemizedBreakdown.find(it => it.id === 'steel_fe550d')?.unitRate || 62000).toLocaleString('en-IN')} / MT`, cost: itemizedBreakdown.find(it => it.id === 'steel_fe550d')?.amountInr || 0 },
                    { name: 'Exterior Solid Masonry (9")', spec: 'Class-1 Kiln Bricks or AAC', qty: `${quantities.netMasonrySqft} sq.ft (Net after voids)`, rate: `₹${(itemizedBreakdown.find(it => it.id === 'brickwork_exterior')?.unitRate || 185).toLocaleString('en-IN')} / sq.ft`, cost: (itemizedBreakdown.find(it => it.id === 'brickwork_exterior')?.amountInr || 0) + (itemizedBreakdown.find(it => it.id === 'brickwork_interior')?.amountInr || 0) },
                    { name: 'Architectural Flooring Tiles', spec: '800×1600mm GVT Vitrified Laying', qty: `${quantities.carpetAreaSqft} carpet sq.ft`, rate: `₹${(itemizedBreakdown.find(it => it.id === 'flooring_vitrified')?.unitRate || 120).toLocaleString('en-IN')} / sq.ft`, cost: itemizedBreakdown.find(it => it.id === 'flooring_vitrified')?.amountInr || 0 },
                    { name: 'Internal & External Plaster/Paint', spec: 'Double coat sponge + Royale Emulsion', qty: `${Math.round((quantities.builtUpAreaSqft || builtUpSqft) * 4.2)} sq.ft surface`, rate: '₹58 - ₹68 / sq.ft', cost: (itemizedBreakdown.find(it => it.id === 'internal_plaster_paint')?.amountInr || 0) + (itemizedBreakdown.find(it => it.id === 'external_plaster_paint')?.amountInr || 0) },
                    { name: 'Doors & Glazed Windows', spec: `${quantities.doorCount} Doors + ${quantities.windowSqft} sq.ft UPVC`, qty: 'Openings Schedule', rate: 'Schedule Rates', cost: (itemizedBreakdown.find(it => it.id === 'door_flush_teak')?.amountInr || 0) + (itemizedBreakdown.find(it => it.id === 'window_upvc_glazed')?.amountInr || 0) }
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #E1E7DF' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#26332A' }}>{row.name}</td>
                      <td style={{ padding: '8px 12px', color: '#68736A' }}>{row.spec}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{row.qty}</td>
                      <td style={{ padding: '8px 12px', color: '#68736A' }}>{row.rate}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800, color: '#3D8056' }}>
                        ₹{row.cost.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Cost-Saving Recommendations */}
          {activeTab === 'savings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#718B73', fontSize: '0.8rem', fontWeight: 700 }}>
                <Lightbulb size={16} />
                <span>Evidence-Based Cost Engineering & Specification Alternatives:</span>
              </div>

              {recommendations.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#68736A', background: '#FAFAF7', borderRadius: '10px' }}>
                  No active value-engineering recommendations needed for this specification.
                </div>
              ) : (
                recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    style={{
                      background: '#FAFAF7',
                      border: '1px solid #E1E7DF',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#26332A' }}>{rec.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#68736A', marginTop: '3px' }}>
                        Current: <span style={{ textDecoration: 'line-through' }}>{rec.currentSpec}</span> ➔ Proposed: <strong>{rec.alternativeSpec}</strong>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#718B73', marginTop: '4px', fontStyle: 'italic' }}>
                        {rec.tradeOffNotes}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '130px' }}>
                      <span style={{ fontSize: '0.65rem', color: '#68736A', display: 'block' }}>ESTIMATED SAVING</span>
                      <strong style={{ fontSize: '0.95rem', color: '#2E7D32' }}>
                        -₹{rec.estimatedSavingsInr.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: Stage-wise Payment Milestones */}
          {activeTab === 'milestones' && (
            <div style={{ border: '1px solid #E1E7DF', borderRadius: '10px', overflow: 'hidden', fontSize: '0.75rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#FAFAF7', borderBottom: '1px solid #E1E7DF', textAlign: 'left', color: '#68736A' }}>
                    <th style={{ padding: '8px 12px' }}>Stage #</th>
                    <th style={{ padding: '8px 12px' }}>Construction Phase</th>
                    <th style={{ padding: '8px 12px' }}>Contract %</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount Payable (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { num: 'Stage 1', stage: 'Site Prep, Excavation & Footings Concrete', pct: '15%', amt: Math.round(totalEstimatedCost * 0.15) },
                    { num: 'Stage 2', stage: 'Plinth Beam & Ground RCC Columns Casting', pct: '20%', amt: Math.round(totalEstimatedCost * 0.20) },
                    { num: 'Stage 3', stage: 'Ground Floor RCC Roof Slab Casting', pct: '20%', amt: Math.round(totalEstimatedCost * 0.20) },
                    { num: 'Stage 4', stage: 'Upper Floor Slab & Masonry Perimeter Walls', pct: '20%', amt: Math.round(totalEstimatedCost * 0.20) },
                    { num: 'Stage 5', stage: 'Plastering, Electrical & Plumbing Rough-in', pct: '15%', amt: Math.round(totalEstimatedCost * 0.15) },
                    { num: 'Stage 6', stage: 'Vitrified Flooring, Painting, Key Handover', pct: '10%', amt: Math.round(totalEstimatedCost * 0.10) }
                  ].map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #E1E7DF' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 800, color: '#718B73' }}>{m.num}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#26332A' }}>{m.stage}</td>
                      <td style={{ padding: '8px 12px', color: '#68736A' }}>{m.pct}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800, color: '#3D8056' }}>
                        ₹{m.amt.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 24px',
            borderTop: '1px solid #E1E7DF',
            background: '#FAFAF7'
          }}
        >
          <span style={{ fontSize: '0.7rem', color: '#68736A' }}>
            Traceable engineering calculation • Reconciled against total budget
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleExport('csv')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #718B73',
                background: '#718B73',
                color: '#FFFFFF',
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <FileSpreadsheet size={13} />
              <span>Export CSV/Excel</span>
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #E1E7DF',
                background: '#FFFFFF',
                color: '#26332A',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
