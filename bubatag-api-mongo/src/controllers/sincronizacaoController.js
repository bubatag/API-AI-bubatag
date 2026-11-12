
const coleiraService = require('../services/coleiraService');
const bubalinoService = require('../services/bubalinoService');
const sincronizacaoService = require('../services/sincronizacaoService');

class SincronizacaoController {
  async sincronizar(req, res, next) {
    let operacao = null;

    try {
      const usuarioId = req.usuario.id || req.usuario._id;

      const { operationId, entidade, acao, dados } = req.body;

      // 1. Validar os dados recebidos.
      if (
        !operationId ||
        typeof operationId !== 'string' ||
        !operationId.trim() ||
        !entidade ||
        !acao ||
        !dados ||
        typeof dados !== 'object' ||
        Array.isArray(dados)
      ) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Dados da operação incompletos ou inválidos.'
        });
      }

      if (!['coleira', 'bubalino'].includes(entidade)) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Entidade inválida.'
        });
      }

      if (acao !== 'cadastrar') {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Ação de sincronização não suportada.'
        });
      }

      const idOperacao = operationId.trim();

      // 2. Consultar se a operação já existe.
      operacao = await sincronizacaoService.buscar(
        usuarioId,
        idOperacao
      );

      // Verifica se o identificador não está sendo reutilizado
      // para outra entidade ou ação.
      if (
        operacao &&
        (operacao.entidade !== entidade || operacao.acao !== acao)
      ) {
        return res.status(409).json({
          sucesso: false,
          mensagem: 'O identificador da operação já foi utilizado com outros dados.'
        });
      }

      // 3. Se já foi concluída, devolver o resultado armazenado.
      if (operacao?.status === 'concluida') {
        return res.status(200).json({
          sucesso: true,
          mensagem: 'Operação já sincronizada anteriormente.',
          operationId: idOperacao,
          entidade,
          acao,
          serverId: operacao.resultado?.serverId || null,
          resultado: operacao.resultado?.resultado || null
        });
      }

      // 4. Se ainda está sendo processada, não executar novamente.
      if (operacao?.status === 'processando') {
        return res.status(409).json({
          sucesso: false,
          mensagem: 'Esta operação já está sendo processada.',
          operationId: idOperacao,
          status: 'processando'
        });
      }

      // 5. Se não existe, registrar uma nova operação.
      if (!operacao) {
        try {
          operacao = await sincronizacaoService.registrar({
            usuarioId,
            operationId: idOperacao,
            entidade,
            acao
          });
        } catch (erroRegistro) {
          // Outra requisição pode ter registrado a mesma operação
          // entre a consulta e a criação.
          if (erroRegistro.code !== 11000) {
            throw erroRegistro;
          }

          operacao = await sincronizacaoService.buscar(
            usuarioId,
            idOperacao
          );

          if (!operacao) {
            throw erroRegistro;
          }

          if (
            operacao.entidade !== entidade ||
            operacao.acao !== acao
          ) {
            return res.status(409).json({
              sucesso: false,
              mensagem: 'O identificador da operação já foi utilizado com outros dados.'
            });
          }

          if (operacao.status === 'concluida') {
            return res.status(200).json({
              sucesso: true,
              mensagem: 'Operação já sincronizada anteriormente.',
              operationId: idOperacao,
              entidade,
              acao,
              serverId: operacao.resultado?.serverId || null,
              resultado: operacao.resultado?.resultado || null
            });
          }

          if (operacao.status === 'processando') {
            return res.status(409).json({
              sucesso: false,
              mensagem: 'Esta operação já está sendo processada.',
              operationId: idOperacao,
              status: 'processando'
            });
          }
        }
      }

      // 6. Se a operação falhou anteriormente, tentar retomá-la.
      if (operacao.status === 'falhou') {
        operacao = await sincronizacaoService.retomar(
          usuarioId,
          idOperacao
        );

        // Outra requisição pode ter retomado primeiro.
        if (!operacao) {
          const operacaoAtualizada = await sincronizacaoService.buscar(
            usuarioId,
            idOperacao
          );

          if (operacaoAtualizada?.status === 'concluida') {
            return res.status(200).json({
              sucesso: true,
              mensagem: 'Operação já sincronizada anteriormente.',
              operationId: idOperacao,
              entidade,
              acao,
              serverId: operacaoAtualizada.resultado?.serverId || null,
              resultado: operacaoAtualizada.resultado?.resultado || null
            });
          }

          return res.status(409).json({
            sucesso: false,
            mensagem: 'A operação já está sendo processada ou não pode ser retomada.',
            operationId: idOperacao
          });
        }
      }

      const dadosComOperationId = {
        ...dados,
        operationId: idOperacao
      };

      let registro;
      let resultado;

      // 7. Executar o cadastro usando os serviços existentes.
      if (entidade === 'coleira') {
        registro = await coleiraService.cadastrarParaUsuario(
          usuarioId,
          dadosComOperationId
        );

        resultado = registro.toObject
          ? registro.toObject()
          : registro;
      } else {
        console.log('[SYNC BUBALINO] Dados recebidos pelo controller:', {
          raca: dadosComOperationId.raca,
          n_etiqueta: dadosComOperationId.n_etiqueta,
          dt_nasc: dadosComOperationId.dt_nasc,
          sexo: dadosComOperationId.sexo,
          coleira_id: dadosComOperationId.coleira_id,
          operationId: dadosComOperationId.operationId
        });

        const cadastro = await bubalinoService.cadastrar(
          usuarioId,
          dadosComOperationId
        );

        registro = cadastro.bubalino;

        resultado = {
          bubalino: registro.toObject
            ? registro.toObject()
            : registro,

          coleira: cadastro.coleira
            ? (
                cadastro.coleira.toObject
                  ? cadastro.coleira.toObject()
                  : cadastro.coleira
              )
            : null
        };
      }

      // 8. Guardar o resultado para os próximos reenvios.
      const serverId = registro?._id
        ? String(registro._id)
        : null;

      await sincronizacaoService.concluir(operacao, {
        serverId,
        resultado
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Operação sincronizada com sucesso.',
        operationId: idOperacao,
        entidade,
        acao,
        serverId,
        resultado
      });

    } catch (erro) {
      // 9. Registrar a falha para permitir uma nova tentativa.
      if (operacao && operacao.status === 'processando') {
        try {
          await sincronizacaoService.marcarFalha(
            operacao,
            erro
          );
        } catch (erroAoRegistrarFalha) {
          console.error(
            '[SYNC] Não foi possível registrar a falha:',
            erroAoRegistrarFalha
          );
        }
      }

      next(erro);
    }
  }
}

module.exports = new SincronizacaoController();
