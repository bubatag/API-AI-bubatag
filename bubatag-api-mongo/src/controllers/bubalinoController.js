
const bubalinoService = require('../services/bubalinoService');
const usuarioService = require('../services/usuarioService');

// Lista os bubalinos independentemente de estarem vinculados a coleiras.
exports.listar = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id || req.usuario._id;

    const bubalinos = await usuarioService.listarBubalinos(usuarioId);

    res.status(200).json({
      sucesso: true,
      bubalinos,
    });
  } catch (error) {
    next(error);
  }
};

exports.cadastrar = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id || req.usuario._id;

    const resultado = await bubalinoService.cadastrar(
      usuarioId,
      req.body
    );

    res.status(201).json({
      sucesso: true,
      mensagem: 'Bubalino cadastrado com sucesso.',
      bubalino: resultado.bubalino,
      coleira: resultado.coleira,
    });
  } catch (error) {
    next(error);
  }
};

exports.atualizar = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id || req.usuario._id;

    const bubalino = await bubalinoService.atualizar(
      usuarioId,
      req.params.id,
      req.body
    );

    res.status(200).json({
      sucesso: true,
      mensagem: 'Bubalino atualizado com sucesso.',
      bubalino,
    });
  } catch (error) {
    next(error);
  }
};

// Desativa o bubalino, mantendo seu cadastro e histórico.
exports.excluir = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id || req.usuario._id;

    const resultado = await bubalinoService.excluir(
      usuarioId,
      req.params.id
    );

    res.status(200).json({
      sucesso: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
};

// Reativa um bubalino anteriormente desativado.
exports.reativar = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id || req.usuario._id;

    const resultado = await bubalinoService.reativar(
      usuarioId,
      req.params.id
    );

    res.status(200).json({
      sucesso: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
};

// Exclui permanentemente o bubalino,
// preservando seus dados no arquivo histórico.
exports.excluirPermanentemente = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id || req.usuario._id;

    const resultado =
      await bubalinoService.excluirPermanentemente(
        usuarioId,
        req.params.id
      );

    res.status(200).json({
      sucesso: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
};

// Desvincula o bubalino da coleira sem apagar seu cadastro.
exports.desvincular = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id || req.usuario._id;

    const resultado = await bubalinoService.desvincular(
      usuarioId,
      req.params.id
    );

    res.status(200).json({
      sucesso: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
};
