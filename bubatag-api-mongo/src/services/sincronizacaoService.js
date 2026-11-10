const OperacaoSincronizacao = require('../models/OperacaoSincronizacao');

class OperacaoSincronizacaoService {
  // Consulta se uma operação já foi processada.
  async buscar(usuarioId, operationId, session = null) {
    let consulta = OperacaoSincronizacao.findOne({
      usuarioId,
      operationId
    });

    if (session) {
      consulta = consulta.session(session);
    }

    return consulta;
  }

  // Registra uma operação como processando.
  async registrar(
    { usuarioId, operationId, entidade, acao },
    session
  ) {
    const [operacao] = await OperacaoSincronizacao.create(
      [
        {
          usuarioId,
          operationId,
          entidade,
          acao,
          status: 'processando'
        }
      ],
      { session }
    );

    return operacao;
  }

  // Armazena o resultado para permitir reenvios seguros.
  async concluir(operacao, resultado, session) {
    operacao.status = 'concluida';
    operacao.resultado = resultado;

    await operacao.save({ session });

    return operacao;
  }
}

module.exports = new OperacaoSincronizacaoService();