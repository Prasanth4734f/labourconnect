import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  Layers, 
  Sliders, 
  Check, 
  ShoppingCart, 
  Download, 
  Wand2, 
  ArrowRightLeft,
  Info,
  DollarSign,
  Palette,
  Eye
} from 'lucide-react';
import { INTERIOR_PRESETS } from '../../data/mockData';

export default function InteriorReimaginer({ onNavigate }) {
  const [selectedPreset, setSelectedPreset] = useState(INTERIOR_PRESETS[0]);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTier, setSelectedTier] = useState('premium'); // 'economy', 'premium', 'luxury'
  const [selectedStyle, setSelectedStyle] = useState('Teakwood Heritage');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleSliderMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleTouchMove = (e) => {
    if (!e.touches[0]) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleCustomUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
      }, 1200);
    }
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    setSelectedStyle(preset.style);
    setUploadedImage(null);
  };

  const triggerReimagine = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <div className="glass-panel-glow p-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-cyan flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI ENGINE 2
              </span>
              <span className="text-xs text-slate-400 font-mono">CONTROLNET DEPTH + REAL-TIME BOQ</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              AI Image-to-Interior Re-Imaginer
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Upload an unfinished room photo or choose a space to generate photorealistic interior redesigns while calculating live itemized material and labour BOQ quotes.
            </p>
          </div>

          <label className="btn btn-cyan btn-lg shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer self-start md:self-auto">
            <Upload className="w-5 h-5" />
            <span>Upload Real Room Photo</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleCustomUpload} 
            />
          </label>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Control Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="glass-panel p-5 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" /> Interior Configuration
              </h3>
              <span className="text-xs text-slate-400 font-mono">Real Rates</span>
            </div>

            {/* Room Presets */}
            <div className="form-group">
              <label className="form-label">
                <span>Select Room Preset</span>
                <span className="text-xs text-slate-400">3 Sample Spaces</span>
              </label>
              
              <div className="flex flex-col gap-2">
                {INTERIOR_PRESETS.map(preset => {
                  const isSelected = selectedPreset.id === preset.id && !uploadedImage;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-500/10' 
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-200'}`}>
                          {preset.title}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                        <span>{preset.roomType} • {preset.sqft} sq.ft</span>
                        <span className="text-amber-400 font-mono font-semibold">₹{(preset.totalCost / 100000).toFixed(2)}L</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Style Selector */}
            <div className="form-group">
              <label className="form-label">Interior Design Theme</label>
              <select 
                value={selectedStyle} 
                onChange={(e) => {
                  setSelectedStyle(e.target.value);
                  triggerReimagine();
                }}
                className="form-select text-xs"
              >
                <option value="Teakwood Heritage">Heritage Teakwood & Brass Accents</option>
                <option value="Scandinavian Japandi">Scandinavian Japandi (Light Oak + Linen)</option>
                <option value="Modern Luxury Acrylic">Modern Minimalist High-Gloss Acrylic</option>
                <option value="Neo-Classical Travertine">Neo-Classical Marble & Fluted Panelling</option>
              </select>
            </div>

            {/* Budget Tier Selector */}
            <div className="form-group">
              <label className="form-label">Budget Tier & Material Grade</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'economy', label: 'Economy', desc: '₹3L - ₹5L' },
                  { id: 'premium', label: 'Premium', desc: '₹6L - ₹9L' },
                  { id: 'luxury', label: 'Luxury', desc: '₹12L - ₹18L' },
                ].map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => {
                      setSelectedTier(tier.id);
                      triggerReimagine();
                    }}
                    className={`btn btn-sm flex flex-col items-center py-2 ${
                      selectedTier === tier.id ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    <span className="font-bold text-xs">{tier.label}</span>
                    <span className="text-[10px] opacity-80">{tier.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={triggerReimagine}
              disabled={isProcessing}
              className="btn btn-cyan btn-lg w-full flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <Wand2 className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? 'Synthesizing Textures...' : 'Re-Generate AI Interior'}
            </button>
          </div>
        </div>

        {/* Right Interactive View: Draggable Before/After Comparison & BOQ (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Interactive Split Comparison Card */}
          <div className="glass-panel p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                <h4 className="text-base font-bold text-white">Interactive Before / After AI Split View</h4>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Drag slider left/right to compare
              </span>
            </div>

            {/* The Draggable Before/After Container */}
            <div 
              className="relative w-full h-[380px] sm:h-[440px] rounded-xl overflow-hidden cursor-ew-resize select-none border border-slate-700/80 shadow-2xl"
              onMouseMove={handleSliderMove}
              onTouchMove={handleTouchMove}
            >
              {/* After Image (Full Background) */}
              <img 
                src={selectedPreset.afterImage} 
                alt="AI Redesigned Interior" 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isProcessing ? 'filter blur-sm' : ''}`}
              />
              <div className="absolute top-4 right-4 bg-emerald-900/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1 rounded-full font-mono font-bold shadow-lg">
                ✨ AI Redesigned Interior ({selectedStyle})
              </div>

              {/* Before Image (Clipped by Slider Position) */}
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img 
                  src={uploadedImage || selectedPreset.beforeImage} 
                  alt="Original Unfinished Room" 
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: '100%', height: '100%' }}
                />
                <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md border border-slate-700 text-slate-200 text-xs px-3 py-1 rounded-full font-mono font-bold shadow-lg">
                  📷 Original Bare Room
                </div>
              </div>

              {/* Draggable Divider Line */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] z-20 pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold text-xs shadow-xl border-2 border-cyan-500">
                  <ArrowRightLeft className="w-4 h-4 text-cyan-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Interior Itemized BOQ Card */}
          <div className="glass-panel p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" /> Itemized Interior BOQ & Material Breakdown
                </h4>
                <p className="text-xs text-slate-400">
                  Live calculated prices based on room area ({selectedPreset.sqft} sq.ft) & {selectedTier} grade specs
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Total Est. Interior Cost</span>
                <div className="text-xl font-mono font-bold text-amber-400">
                  ₹{selectedPreset.totalCost.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="p-3">Work Package & Material Specs</th>
                    <th className="p-3">Quantity / Area</th>
                    <th className="p-3">Unit Rate</th>
                    <th className="p-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {selectedPreset.boq.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-medium text-slate-200">{item.item}</td>
                      <td className="p-3 font-mono text-cyan-300">{item.unit}</td>
                      <td className="p-3 font-mono text-slate-300">₹{item.rate.toLocaleString()}</td>
                      <td className="p-3 font-mono font-bold text-amber-400 text-right">
                        ₹{item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-400">
                ⚡ Ready to order carpentry, false ceiling & vitrified tiles?
              </span>
              <button 
                onClick={() => onNavigate && onNavigate('supplier')}
                className="btn btn-primary btn-sm flex items-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Order Interior Materials from Vendors
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
