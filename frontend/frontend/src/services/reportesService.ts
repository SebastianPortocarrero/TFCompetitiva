const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface Reporte {
  id: string;
  busquedaId: string;
  rutaArchivo: string;
  hashSha256Pdf: string;
  tamanoBytes: number;
  fechaGeneracion: string;
  numeroDescargas: number;
  generadoPor?: {
    nombre: string;
    email: string;
    rol: string;
  };
  busqueda?: {
    casoNumero: string;
    patrones: string[];
    totalCoincidencias: number;
    algoritmoUsado: string;
  };
}

export interface GenerarReporteResponse {
  success: boolean;
  data: {
    idReporte: string;
    busquedaId: string;
    rutaDescarga: string;
    hashSha256: string;
    tamanoBytes: number;
    fechaGeneracion: string;
  };
}

/**
 * Genera un reporte PDF para una búsqueda específica
 */
export const generarReporte = async (busquedaId: string): Promise<GenerarReporteResponse> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/api/reportes/generar/${busquedaId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw new Error('Sesión expirada');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al generar reporte');
  }

  return await response.json();
};

/**
 * Lista todos los reportes generados
 */
export const listarReportes = async (): Promise<Reporte[]> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/api/reportes`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw new Error('Sesión expirada');
  }

  if (!response.ok) {
    throw new Error('Error al cargar reportes');
  }

  const data = await response.json();
  return data.data?.reportes || [];
};

/**
 * Descarga un reporte PDF
 */
export const descargarReporte = async (reporteId: string): Promise<void> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/api/reportes/descargar/${reporteId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw new Error('Sesión expirada');
  }

  if (!response.ok) {
    throw new Error('Error al descargar reporte');
  }

  // Obtener el blob del PDF
  const blob = await response.blob();

  // Extraer nombre del archivo de los headers
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = `reporte_${reporteId}.pdf`;

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
    if (filenameMatch) {
      filename = filenameMatch[1];
    }
  }

  // Crear URL temporal y descargar
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
