/**
 * Canonical Room Name Simplifier
 * Converts dense technical strings to clean natural architectural names:
 * e.g. "Grand Entrance Foyer & Verandah" -> "Entrance"
 * e.g. "Formal Living Lounge" -> "Living Room"
 * e.g. "Modular Gourmet Kitchen" -> "Kitchen"
 * e.g. "Sanitary Bath & Toilet" -> "Bathroom"
 */
export function simplifyRoomName(name = '', type = '') {
  const s = `${name} ${type}`.toLowerCase();
  if (s.includes('verandah') || s.includes('foyer') || s.includes('entrance') || s.includes('entry') || s.includes('porch')) {
    if (s.includes('car') || s.includes('portico') || s.includes('parking')) return 'Portico';
    return 'Entrance';
  }
  if (s.includes('living') || s.includes('lounge') || s.includes('drawing')) return 'Living Room';
  if (s.includes('dining')) return 'Dining Area';
  if (s.includes('kitchen') || s.includes('pantry')) return 'Kitchen';
  if (s.includes('bath') || s.includes('toilet') || s.includes('sanitary') || s.includes('powder') || s.includes('wc')) return 'Bathroom';
  if (s.includes('master')) return 'Master Bedroom';
  if (s.includes('bed')) return 'Bedroom';
  if (s.includes('pooja') || s.includes('puja') || s.includes('mandir') || s.includes('prayer')) return 'Pooja Room';
  if (s.includes('stair') || s.includes('stairwell') || s.includes('rcc')) return 'Staircase';
  if (s.includes('balcony') || s.includes('terrace_deck')) return 'Balcony';
  if (s.includes('utility') || s.includes('wash')) return 'Utility';
  return name || type || 'Room';
}
