
const mongoose = require('mongoose');

const OperacaoSincronizacaoSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      index: true
    },

    operationId: {
      type: String,
      required: true
    },

    entidade: {
      type: String,
      enum: ['coleira', 'bubalino'],
      required: true
    },

    acao: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ['processando', 'concluida', 'falhou'],
      default: 'processando'
    },

    resultado: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    erro: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Impede que o mesmo usuário registre duas vezes a mesma operação.
OperacaoSincronizacaoSchema.index(
  { usuarioId: 1, operationId: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.OperacaoSincronizacao ||
  mongoose.model(
    'OperacaoSincronizacao',
    OperacaoSincronizacaoSchema
  );
