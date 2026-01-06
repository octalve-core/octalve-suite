// Utility helpers that Base44 provided in the hosted environment.
// In this local scaffold we map "Page names" to React Router paths.

export function createPageUrl(pageName) {
  // Keep it simple: each Page component is mounted at /<PageName>
  // Examples: /ClientDashboard, /ProjectDetail, /PhaseDetail
  return `/${pageName}`;
}
