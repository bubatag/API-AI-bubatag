
module.exports = (req, res, next) => {
  const {
    n_coleira,
    batimento_cardiaco,
    temperatura,
    latitude,
    longitude,
    estado_estresse
  } = req.body;

  if (!n_coleira) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'O campo n_coleira é obrigatório.'
    });
  }

  if (
    batimento_cardiaco !== undefined &&
    (batimento_cardiaco < 20 || batimento_cardiaco > 220)
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Batimento cardíaco fora dos limites fisiológicos aceitáveis.'
    });
  }

  if (
    temperatura !== undefined &&
    (temperatura < 34 || temperatura > 44)
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Temperatura fora dos limites aceitáveis.'
    });
  }

  // Valida latitude e longitude quando enviadas.
  const possuiLatitude = latitude !== undefined;
  const possuiLongitude = longitude !== undefined;

  if (possuiLatitude !== possuiLongitude) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Latitude e longitude devem ser enviadas juntas.'
    });
  }

  if (possuiLatitude && possuiLongitude) {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Coordenadas geográficas inválidas.'
      });
    }
  }

  const estadosValidos = [
    'Normal',
    'Ocioso',
    'Alerta',
    'Estresse Térmico',
    'Estresse Crítico',
    'Estressado'
  ];

  if (estado_estresse && !estadosValidos.includes(estado_estresse)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: `estado_estresse inválido. Valores aceitos: ${estadosValidos.join(', ')}.`
    });
  }

  next();
};
