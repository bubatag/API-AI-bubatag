
const OperacaoSincronizacao = require('../models/OperacaoSincronizacao');

class OperacaoSincronizacaoService {
  // Consulta uma operação pelo usuário e identificador.
  async buscar(usuarioId, operationId) {
    return OperacaoSincronizacao.findOne({
      usuarioId,
      operationId
    });
  }

  // Registra uma nova operação.
  async registrar({ usuarioId, operationId, entidade, acao }) {
    const [operacao] = await OperacaoSincronizacao.create([
      {
        usuarioId,
        operationId,
        entidade,
        acao,
        status: 'processando'
      }
    ]);

    return operacao;
  }

  // Retoma somente operações que realmente falharam.
  // A atualização atômica impede duas retomadas simultâneas.
  async retomar(usuarioId, operationId) {
    return OperacaoSincronizacao.findOneAndUpdate(
      {
        usuarioId,
        operationId,
        status: 'falhou'
      },
      {
        $set: {
          status: 'processando',
          erro: null
        }
      },
      {
        new: true
      }
    );
  }

  // Armazena o resultado da operação concluída.
  async concluir(operacao, resultado) {
    operacao.status = 'concluida';
    operacao.resultado = resultado;
    operacao.erro = null;

    await operacao.save();

    return operacao;
  }

  // Registra a falha para permitir uma tentativa posterior.
  async marcarFalha(operacao, erro) {
    operacao.status = 'falhou';
    operacao.erro = erro?.message || 'Erro desconhecido';

    await operacao.save();

    return operacao;
  }
}

module.exports = new OperacaoSincronizacaoService();
