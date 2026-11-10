const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const sincronizacaoController = require('../controllers/sincronizacaoController');

router.post('/', authMiddleware, sincronizacaoController.sincronizar);

module.exports = router;