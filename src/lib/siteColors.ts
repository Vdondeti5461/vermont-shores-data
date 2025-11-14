// Standardized color palette for network sites - 18 distinct, highly visible colors
export const locationColors = [
  '#e11d48', // Rose - ID 1
  '#dc2626', // Red - ID 2
  '#ea580c', // Orange-red - ID 3
  '#d97706', // Amber - ID 4
  '#ca8a04', // Yellow - ID 5
  '#65a30d', // Lime - ID 6
  '#16a34a', // Green - ID 7
  '#059669', // Emerald - ID 8
  '#0d9488', // Teal - ID 9
  '#0891b2', // Cyan - ID 10
  '#0284c7', // Sky - ID 11
  '#2563eb', // Blue - ID 12
  '#4f46e5', // Indigo - ID 13
  '#7c3aed', // Violet - ID 14
  '#9333ea', // Purple - ID 15
  '#c026d3', // Fuchsia - ID 16
  '#db2777', // Pink - ID 17
  '#f43f5e', // Rose-red - ID 18
];

// Get color for a site ID
export const getSiteColor = (siteId: number): string => {
  const colorIndex = (siteId - 1) % locationColors.length;
  return locationColors[colorIndex];
};

// Get color by short code (for legacy compatibility)
export const getSiteColorByCode = (code: string): string => {
  // Map common codes to IDs
  const codeToId: Record<string, number> = {
    'SUMMIT': 1,
    'RB-01': 2, 'RB01': 2,
    'RB-02': 3, 'RB02': 3,
    'FEMC': 4,
    'RB-09': 5, 'RB09': 5,
    'RB-03': 6, 'RB03': 6,
    'RB-14': 7, 'RB14': 7,
    'RB-04': 8, 'RB04': 8,
    'RB-07': 9, 'RB07': 9,
    'SLP-R3': 10, 'SLPR3': 10,
    'RB-05': 11, 'RB05': 11,
    'RB-08': 12, 'RB08': 12,
    'PROC': 13,
    'RB-06': 14, 'RB06': 14,
    'RB-11': 15, 'RB11': 15,
    'SLP-R25': 16, 'SLPR25': 16,
    'RB-10': 17, 'RB10': 17,
    'SLP-W1': 18, 'SLPW1': 18,
    'JER-C': 19, 'JERC': 19,
    'JER-F': 20, 'JERF': 20,
    'SPEAR': 21,
    'CHAM': 22,
  };
  
  const id = codeToId[code] || 1;
  return getSiteColor(id);
};
