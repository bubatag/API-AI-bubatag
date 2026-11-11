const Usuario = require('../models/Usuario');

class ReportService {
  async gerarRelatorioPorColeira(n_coleira) {
    const numeroColeira = String(n_coleira || '').trim();

    if (!numeroColeira) {
      const erro = new Error('Número da coleira não informado.');
      erro.status = 400;
      throw erro;
    }

    const usuario = await Usuario.findOne({
      'coleiras.n_coleira': numeroColeira,
    });

    if (!usuario) {
      const erro = new Error(`Coleira ${numeroColeira} não encontrada.`);
      erro.status = 404;
      throw erro;
    }

    const coleira = usuario.coleiras.find(
      (item) =>
        String(item.n_coleira || '').trim() === numeroColeira &&
        !item.excluido_em
    );

    if (!coleira) {
      const erro = new Error(
        `Coleira ${numeroColeira} não encontrada ou excluída.`
      );
      erro.status = 404;
      throw erro;
    }

    if (!coleira.bubalino_id) {
      const erro = new Error(
        `Nenhum bubalino associado à coleira ${numeroColeira}.`
      );
      erro.status = 400;
      throw erro;
    }

    // O bubalino é um subdocumento separado em usuario.bubalinos.
    // A coleira guarda apenas a referência ObjectId em bubalino_id.
    const bubalino = usuario.bubalinos.id(coleira.bubalino_id);

    if (!bubalino || bubalino.excluido_em) {
      const erro = new Error(
        `O bubalino associado à coleira ${numeroColeira} não foi encontrado.`
      );
      erro.status = 404;
      throw erro;
    }

    const dadosAtivos = (bubalino.dados || []).filter(
      (item) => item.ativo !== false
    );

    const estressesAtivos = (bubalino.historico_estresse || []).filter(
      (item) => item.ativo !== false
    );

    // Formato compatível com o normalizador do Historico.jsx.
    const registros = dadosAtivos.map((item) => ({
      _id: item._id,
      data: item.data,
      temperatura: item.temperatura,
      batimento_cardiaco: item.batimento_cardiaco,
    }));

    const ultimosDados = dadosAtivos.slice(-20);
    const ultimosEstresses = estressesAtivos.slice(-20);

    const animal = {
      nome: bubalino.nome || 'Não informado',
      etiqueta: bubalino.n_etiqueta,
      raca: bubalino.raca,
      localizacao: coleira.coleira_localizacao,
    };

    if (ultimosDados.length === 0) {
      return {
        sucesso: true,
        animal,
        registros,
        dados: registros,
        historico: registros,
        metricas: {
          amostras_avaliadas: 0,
          bpm_medio: null,
          temperatura_media: null,
          distribuicao_estados: {},
        },
        relatorio_clinico: null,
        metodo_geracao: 'regras locais experimentais',
      };
    }

    const totalRegistros = ultimosDados.length;

    const contagemStatus = ultimosEstresses.reduce((acc, item) => {
      const estado = item.estado_estresse || 'Não informado';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    const leiturasComBpm = ultimosDados.filter(
      (item) => Number.isFinite(Number(item.batimento_cardiaco))
    );

    const leiturasComTemperatura = ultimosDados.filter(
      (item) => Number.isFinite(Number(item.temperatura))
    );

    const mediaBpm = leiturasComBpm.length
      ? Number(
          (
            leiturasComBpm.reduce(
              (acc, item) => acc + Number(item.batimento_cardiaco),
              0
            ) / leiturasComBpm.length
          ).toFixed(1)
        )
      : null;

    const mediaTemp = leiturasComTemperatura.length
      ? Number(
          (
            leiturasComTemperatura.reduce(
              (acc, item) => acc + Number(item.temperatura),
              0
            ) / leiturasComTemperatura.length
          ).toFixed(1)
        )
      : null;

    const estadosDeEstresse = [
      'Estressado',
      'Estresse Térmico',
      'Estresse Crítico',
    ];

    const quantidadeEstresse = Object.entries(contagemStatus)
      .filter(([estado]) => estadosDeEstresse.includes(estado))
      .reduce((total, [, quantidade]) => total + quantidade, 0);

    let parecer;

    if (quantidadeEstresse > 0) {
      parecer =
        'Há registros classificados como possíveis sinais de estresse. ' +
        'Recomenda-se verificar as condições ambientais e acompanhar novas leituras.';
    } else if (
      (mediaTemp !== null && mediaTemp > 39.2) ||
      (mediaBpm !== null && mediaBpm > 80)
    ) {
      parecer =
        'Uma ou mais médias estão acima das referências configuradas no sistema. ' +
        'É recomendável acompanhar novas leituras e verificar as condições do animal.';
    } else {
      parecer =
        'As médias estão dentro das referências configuradas no sistema. ' +
        'Isso, isoladamente, não confirma a ausência de estresse.';
    }

    const alertas = [];

    if (mediaTemp !== null && mediaTemp > 39.2) {
      alertas.push(
        'A temperatura média está acima da referência configurada. Verifique sombra, água disponível e possibilidade de exposição ao calor.'
      );
    }

    if (mediaBpm !== null && mediaBpm > 80) {
      alertas.push(
        'A frequência cardíaca média está acima da referência configurada. Considere fatores como atividade física, calor e manejo.'
      );
    }

    if (quantidadeEstresse > 0) {
      alertas.push(
        `Foram encontrados ${quantidadeEstresse} registros de estresse entre os estados considerados no relatório.`
      );
    }

    if (alertas.length === 0) {
      alertas.push(
        'Não foram identificados alertas pelas regras configuradas. Continue monitorando o animal e as condições ambientais.'
      );
    }

    const orientacoes = [
      'Disponibilizar água limpa e acesso à sombra.',
      'Observar o comportamento do animal e possíveis mudanças no ambiente.',
      'Se os sinais persistirem ou houver alteração importante, procurar orientação de um médico-veterinário.',
    ];

    const relatorio = [
      '# Relatório de monitoramento Bubatag',
      '',
      '## 1. Parecer geral',
      parecer,
      '',
      '## 2. Métricas consolidadas',
      `- Leituras avaliadas: ${totalRegistros}`,
      `- Frequência cardíaca média: ${mediaBpm ?? 'Sem dados'} bpm`,
      `- Temperatura média: ${mediaTemp ?? 'Sem dados'} °C`,
      `- Distribuição dos estados: ${JSON.stringify(contagemStatus)}`,
      '',
      '## 3. Alertas e possíveis fatores',
      ...alertas.map((alerta) => `- ${alerta}`),
      '',
      '## 4. Orientações de manejo',
      ...orientacoes.map((orientacao) => `- ${orientacao}`),
      '',
      '> Relatório experimental baseado nos dados registrados e nas regras configuradas. ' +
        'Não constitui diagnóstico veterinário e não substitui uma avaliação profissional.',
    ].join('\n');

    return {
      sucesso: true,
      animal,
      registros,
      dados: registros,
      historico: registros,
      metricas: {
        amostras_avaliadas: totalRegistros,
        bpm_medio: mediaBpm,
        temperatura_media: mediaTemp,
        distribuicao_estados: contagemStatus,
      },
      relatorio_clinico: relatorio,
      metodo_geracao: 'regras locais experimentais',
    };
  }
}

module.exports = new ReportService();