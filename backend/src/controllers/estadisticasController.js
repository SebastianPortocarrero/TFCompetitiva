const Busqueda = require('../models/Busqueda');

const construirFiltro = (usuario, filtroUsuario) => {
  if (usuario.rol === 'admin') {
    return filtroUsuario ? { usuarioId: filtroUsuario } : {};
  }
  return { usuarioId: usuario.id };
};

exports.resumen = async (req, res, next) => {
  try {
    const filtro = construirFiltro(req.usuario, req.query.usuarioId);

    const agregados = await Busqueda.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: null,
          totalBusquedas: { $sum: 1 },
          totalCoincidencias: { $sum: { $ifNull: ['$totalCoincidencias', 0] } },
          totalProcesados: { $sum: { $ifNull: ['$totalSospechososProcesados', 0] } },
          sumaTiempo: { $sum: { $ifNull: ['$tiempoEjecucionMs', 0] } }
        }
      }
    ]);

    const resumen = agregados[0] || {
      totalBusquedas: 0,
      totalCoincidencias: 0,
      totalProcesados: 0,
      sumaTiempo: 0
    };

    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const busquedasMesActual = await Busqueda.countDocuments({
      ...filtro,
      fecha: { $gte: inicioMes }
    });

    const algoritmoMasUsado = await Busqueda.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: '$algoritmoUsado',
          total: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 1 }
    ]);

    const haceSieteDias = new Date();
    haceSieteDias.setDate(haceSieteDias.getDate() - 6);
    haceSieteDias.setHours(0, 0, 0, 0);

    const busquedasPorDia = await Busqueda.aggregate([
      {
        $match: {
          ...filtro,
          fecha: { $gte: haceSieteDias }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$fecha', timezone: 'UTC' } },
          cantidad: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const tasaExito = resumen.totalProcesados
      ? (resumen.totalCoincidencias / resumen.totalProcesados) * 100
      : 0;

    const tiempoPromedio = resumen.totalBusquedas
      ? resumen.sumaTiempo / resumen.totalBusquedas
      : 0;

    res.status(200).json({
      success: true,
      data: {
        total_busquedas: resumen.totalBusquedas,
        busquedas_mes_actual: busquedasMesActual,
        total_coincidencias: resumen.totalCoincidencias,
        tasa_exito: Number(tasaExito.toFixed(2)),
        algoritmo_mas_usado: algoritmoMasUsado[0]?._id || null,
        tiempo_promedio_ms: Number(tiempoPromedio.toFixed(2)),
        busquedas_por_dia: busquedasPorDia.map((registro) => ({
          fecha: registro._id,
          cantidad: registro.cantidad
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};