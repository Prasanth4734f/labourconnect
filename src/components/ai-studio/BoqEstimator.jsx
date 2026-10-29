import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  FileSpreadsheet,
  MapPin,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { calculateProjectBudget, BUDGET_STATUS } from '../../engine/estimation/projectBudgetEngine.js';
import { getSupportedCities } from '../../engine/estimation/regionalRateCatalog.js';

export default function BoqEstimator({ 
  plotWidth = 40, 
  plotLength = 60, 
  bhk = 3, 
  style = 'modern',
  budgetInr = 4500000,
  design = null,
  onPublishToMarketplace,
  onOrderMaterials,
  onApplyLoan
}) {
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [activeTab, setActiveTab] = useState('categories'); // 'categories', 'materials', 'stages'
  const [expandedCategories, setExpandedCategories] = useState({
    'civil_structure': true,
    'architectural_finishes': true
  });

  const availableCities = useMemo(() => getSupportedCities(), []);

  // Compute budget through the single authoritative project budget engine
  const budgetResult = useMemo(() => {
    const safeDesign = design || {
      site: { plotWidth, plotLength, plotAreaSqft: plotWidth * plotLength },
      metrics: {
        builtUpAreaSqft: Math.round(plotWidth * plotLength * 1.35),
        floorsCount: 2,
        carpetAreaSqft: Math.round(plotWidth * plotLength * 1.05)
      },
      inputs: {
        plotWidth,
        plotLength,
        bhkCount: bhk,
        archStyle: style,
        homeBudgetInr: budgetInr
      },
      floors: []
    };

    return calculateProjectBudget(safeDesign, {
      city: selectedCity,
      targetBudget: budgetInr
    });
  }, [design, plotWidth, plotLength, bhk, style, budgetInr, selectedCity]);

  const {
    totalEstimatedCost = 0,
    targetBudget = budgetInr,
    budgetVariance = 0,
    budgetVariancePercentage = 0,
    budgetStatus = BUDGET_STATUS.WITHIN_BUDGET,
    costPerSqft = 0,
    categorySubtotals = [],
    itemizedBreakdown = [],
    quantities = {},
    assumptions = []
  } = budgetResult;

  const isOverBudget = budgetStatus === BUDGET_STATUS.OVER_BUDGET;

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const exportBoqCSV = () => {
    const rows = [
      ['BuildMate AI Bill of Quantities (BOQ) - Unified Project Budget'],
      ['Plot Size', `${plotWidth}x${plotLength} ft (${plotWidth * plotLength} sq.ft)`],
      ['Built-up Area', `${quantities.builtUpAreaSqft} sq.ft`],
      ['Target Budget', `₹${targetBudget.toLocaleString('en-IN')}`],
      ['Total Estimated Cost', `₹${totalEstimatedCost.toLocaleString('en-IN')}`],
      ['Budget Variance', `₹${budgetVariance.toLocaleString('en-IN')} (${budgetVariancePercentage}%)`],
      ['Status', budgetStatus],
      [],
      ['Category', 'Item Description', 'Quantity', 'Unit', 'Regional Rate (₹)', 'Total Amount (₹)', 'Provenance']
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
    rows.push(['Grand Total Estimated Cost', '', '', '', '', totalEstimatedCost, 'RECONCILED']);

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BuildMate_AI_BOQ_${plotWidth}x${plotLength}_${quantities.builtUpAreaSqft}sqft.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel p-6 flex flex-col gap-6" style={{ background: '#FFFFFF', border: '1px solid #E1E7DF', borderRadius: '16px' }}>
      {/* BOQ Header Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5" style={{ borderBottom: '1px solid #E1E7DF' }}>
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-500" />
            <h3 className="text-xl font-bold text-slate-900" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
              Live Dynamic Bill of Quantities (BOQ)
            </h3>
            <span style={{ fontSize: '0.7rem', background: '#EAF0E8', color: '#718B73', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
              10 Cost Categories • Authoritative Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1" style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#68736A' }}>
            Calculated for Built-up Area: <strong style={{ color: '#26332A' }}>{quantities.builtUpAreaSqft?.toLocaleString('en-IN')} Sq.Ft</strong> • Regional Rates ({selectedCity})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FAFAF7', border: '1px solid #E1E7DF', borderRadius: '8px', padding: '4px 8px' }}>
            <MapPin size={13} color="#718B73" />
            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '0.75rem', fontWeight: 700, color: '#26332A', outline: 'none', cursor: 'pointer' }}
            >
              {availableCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={exportBoqCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: '#718B73',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel/CSV
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#FAFAF7', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E1E7DF' }}>
          <span style={{ fontSize: '0.7rem', color: '#68736A', fontWeight: 600, display: 'block' }}>Total Built-Up Area</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#26332A' }}>
            {quantities.builtUpAreaSqft?.toLocaleString('en-IN')} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#68736A' }}>sq.ft</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#68736A' }}>Carpet Area: {quantities.carpetAreaSqft?.toLocaleString('en-IN')} sq.ft</span>
        </div>

        <div style={{ background: '#FAFAF7', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E1E7DF' }}>
          <span style={{ fontSize: '0.7rem', color: '#68736A', fontWeight: 600, display: 'block' }}>Total Estimated Cost</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3D8056' }}>
            ₹{(totalEstimatedCost / 100000).toFixed(2)} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#68736A' }}>Lakhs</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#68736A' }}>₹{costPerSqft?.toLocaleString('en-IN')} / Sq.Ft</span>
        </div>

        <div style={{ background: '#FAFAF7', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E1E7DF' }}>
          <span style={{ fontSize: '0.7rem', color: '#68736A', fontWeight: 600, display: 'block' }}>Target Budget</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#26332A' }}>
            ₹{(targetBudget / 100000).toFixed(2)} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#68736A' }}>Lakhs</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: isOverBudget ? '#D9534F' : '#3D8056', fontWeight: 700 }}>
            {isOverBudget ? `⚠️ Over by ₹${Math.abs(budgetVariance).toLocaleString('en-IN')}` : `✅ Under by ₹${Math.abs(budgetVariance).toLocaleString('en-IN')}`}
          </span>
        </div>

        <div style={{ background: '#FAFAF7', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E1E7DF' }}>
          <span style={{ fontSize: '0.7rem', color: '#68736A', fontWeight: 600, display: 'block' }}>Concrete & Steel Takeoff</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#26332A' }}>
            {quantities.concreteCuMtr} m³ / {quantities.steelTons} T
          </div>
          <span style={{ fontSize: '0.7rem', color: '#68736A' }}>Structural Fe550D + M25 RMC</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E1E7DF', paddingBottom: '8px' }}>
        {[
          { id: 'categories', label: '10 Cost Categories' },
          { id: 'materials', label: 'Itemized Materials Schedule' },
          { id: 'stages', label: 'Stage-wise Payment Schedule' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: activeTab === tab.id ? '1px solid #718B73' : '1px solid #E1E7DF',
              background: activeTab === tab.id ? '#718B73' : '#FAFAF7',
              color: activeTab === tab.id ? '#FFFFFF' : '#68736A',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Categories Breakdown */}
      {activeTab === 'categories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categorySubtotals.map((cat) => {
            const isExpanded = Boolean(expandedCategories[cat.categoryId]);
            const catItems = itemizedBreakdown.filter(it => it.categoryId === cat.categoryId && it.isIncluded);

            return (
              <div key={cat.categoryId} style={{ border: '1px solid #E1E7DF', borderRadius: '10px', overflow: 'hidden' }}>
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
                    <span style={{ fontSize: '0.72rem', color: '#68736A' }}>{cat.percentageOfTotal}%</span>
                    <strong style={{ fontSize: '0.85rem', color: '#3D8056' }}>₹{cat.subtotalInr.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

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
                          <td style={{ padding: '6px 14px', color: '#26332A', fontWeight: 600 }}>{it.name}</td>
                          <td style={{ padding: '6px 14px', color: '#68736A' }}>{it.quantity.toLocaleString('en-IN')} {it.unit}</td>
                          <td style={{ padding: '6px 14px', color: '#68736A' }}>{it.unit === 'percentage' ? `${(it.unitRate * 100).toFixed(1)}%` : `₹${it.unitRate.toLocaleString('en-IN')}`}</td>
                          <td style={{ padding: '6px 14px' }}>
                            <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '3px', fontWeight: 700, background: '#E8F5E9', color: '#2E7D32' }}>
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

      {/* Tab 2: Materials Schedule */}
      {activeTab === 'materials' && (
        <div style={{ border: '1px solid #E1E7DF', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ background: '#FAFAF7', borderBottom: '1px solid #E1E7DF', textAlign: 'left', color: '#68736A' }}>
                <th style={{ padding: '8px 12px' }}>Material Item</th>
                <th style={{ padding: '8px 12px' }}>Measured Qty</th>
                <th style={{ padding: '8px 12px' }}>Regional Unit Rate</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total (INR)</th>
              </tr>
            </thead>
            <tbody>
              {itemizedBreakdown.filter(it => it.isIncluded && it.unit !== 'percentage').map((it, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F5F5F5' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#26332A' }}>{it.name}</td>
                  <td style={{ padding: '8px 12px', color: '#68736A' }}>{it.quantity.toLocaleString('en-IN')} {it.unit}</td>
                  <td style={{ padding: '8px 12px', color: '#68736A' }}>₹{it.unitRate.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800, color: '#3D8056' }}>
                    ₹{it.amountInr.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Stages Payment Schedule */}
      {activeTab === 'stages' && (
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
                { num: 'Stage 1', stage: 'Site Clearing, Foundation & Isolated Footings Concrete', pct: '15%', amt: Math.round(totalEstimatedCost * 0.15) },
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
  );
}
