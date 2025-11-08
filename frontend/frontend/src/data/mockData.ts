export interface Suspect {
  id: string;
  name: string;
  dni: string;
  dnaPattern: string;
  registeredDate: string;
}

export interface SearchResult {
  id: string;
  caseNumber: string;
  pattern: string;
  matches: number;
  date: string;
  algorithm: string;
  status: 'completed' | 'processing' | 'failed';
}

export interface Match {
  suspectId: string;
  name: string;
  dni: string;
  matchPosition: number;
  similarity: number;
}

export const mockSuspects: Suspect[] = [
  { id: '1', name: 'Pedro Ramírez', dni: '45678912', dnaPattern: 'ATCGATCGATCG', registeredDate: '2024-01-15' },
  { id: '2', name: 'Luis Vargas', dni: '78945612', dnaPattern: 'GCTAGCTAGCTA', registeredDate: '2024-02-20' },
  { id: '3', name: 'Ana Torres', dni: '12345678', dnaPattern: 'TTAGCTTAGCTT', registeredDate: '2024-03-10' },
  { id: '4', name: 'Roberto Silva', dni: '98765432', dnaPattern: 'CGCGATATCGCG', registeredDate: '2024-04-05' },
  { id: '5', name: 'Carmen Díaz', dni: '56789012', dnaPattern: 'ATATATGCGCGC', registeredDate: '2024-05-12' },
];

export const mockSearchHistory: SearchResult[] = [
  { id: '1', caseNumber: 'CASO-2024-001', pattern: 'ATCGATCG', matches: 2, date: '2024-06-15 14:30', algorithm: 'Knuth-Morris-Pratt', status: 'completed' },
  { id: '2', caseNumber: 'CASO-2024-002', pattern: 'GCTAGCTA', matches: 1, date: '2024-06-14 10:15', algorithm: 'Boyer-Moore', status: 'completed' },
  { id: '3', caseNumber: 'CASO-2024-003', pattern: 'TTAGCTTA', matches: 0, date: '2024-06-13 16:45', algorithm: 'Rabin-Karp', status: 'completed' },
  { id: '4', caseNumber: 'CASO-2024-004', pattern: 'CGCGATAT', matches: 3, date: '2024-06-12 09:20', algorithm: 'Fuerza Bruta', status: 'completed' },
  { id: '5', caseNumber: 'CASO-2024-005', pattern: 'ATATATGC', matches: 1, date: '2024-06-11 11:50', algorithm: 'Knuth-Morris-Pratt', status: 'completed' },
];

export const mockStats = {
  totalSearches: 1247,
  totalMatches: 386,
  avgProcessingTime: '2.3s',
  successRate: 89.5,
};

export const mockChartData = [
  { date: '2024-06-09', searches: 45 },
  { date: '2024-06-10', searches: 52 },
  { date: '2024-06-11', searches: 38 },
  { date: '2024-06-12', searches: 61 },
  { date: '2024-06-13', searches: 49 },
  { date: '2024-06-14', searches: 55 },
  { date: '2024-06-15', searches: 43 },
];

export const mockAlgorithmData = [
  { name: 'KMP', value: 450 },
  { name: 'Boyer-Moore', value: 320 },
  { name: 'Rabin-Karp', value: 280 },
  { name: 'Fuerza Bruta', value: 197 },
];

export const mockReports = [
  { id: '1', name: 'Reporte Mensual - Junio 2024', date: '2024-06-30', type: 'Mensual' },
  { id: '2', name: 'Análisis de Coincidencias - Mayo 2024', date: '2024-05-31', type: 'Estadístico' },
  { id: '3', name: 'Casos Resueltos - Q2 2024', date: '2024-06-28', type: 'Trimestral' },
];

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  role: 'Perito' | 'Investigador';
  status: 'active' | 'inactive';
  createdDate: string;
}

export const mockRegisteredUsers: RegisteredUser[] = [
  { id: '1', name: 'María García', email: 'perito@pnp.gob.pe', role: 'Perito', status: 'active', createdDate: '2024-01-10' },
  { id: '2', name: 'Carlos López', email: 'investigador@pnp.gob.pe', role: 'Investigador', status: 'active', createdDate: '2024-02-15' },
  { id: '3', name: 'Rosa Mendoza', email: 'perito2@pnp.gob.pe', role: 'Perito', status: 'active', createdDate: '2024-03-20' },
];
