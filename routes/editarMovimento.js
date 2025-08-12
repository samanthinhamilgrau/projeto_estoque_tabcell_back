const express = require('express');
const router = express.Router();
const db = require('../services/firebase');

function collectionName(req, base) {
  const loja = req.headers['x-loja'] === '2' ? '2' : '1';
  return loja === '2' ? `${base}2` : base;
}

// Registrar movimento (entrada/saida)
router.post('/', async (req, res) => {
  try {
    const colProdutos = collectionName(req, 'produtos');
    const colMovimentos = collectionName(req, 'movimentos');

    const { produtoId, quantidade, tipo, usuarioEmail } = req.body;

    if (!produtoId || quantidade == null || !tipo || !usuarioEmail) {
      return res.status(400).json({ error: 'Preencha todos os campos' });
    }

    const produtoRef = db.ref(`${colProdutos}/${produtoId}`);
    const produtoSnap = await produtoRef.once('value');

    if (!produtoSnap.exists()) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const produtoData = produtoSnap.val();
    let novaQuantidade = produtoData.quantidadeEntrada || 0;

    if (tipo === 'entrada') {
      novaQuantidade += quantidade;
    } else if (tipo === 'saida') {
      novaQuantidade -= quantidade;
      if (novaQuantidade < 0) novaQuantidade = 0;
    } else {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    await produtoRef.update({ quantidadeEntrada: novaQuantidade });

    const movimentosRef = db.ref(colMovimentos);
    const newMovimentoRef = movimentosRef.push();

    await newMovimentoRef.set({
      produtoId,
      quantidade,
      tipo,
      data: new Date().toISOString(),
      usuario: usuarioEmail,
    });

    res.json({ message: 'Movimento registrado com sucesso', novaQuantidade });
  } catch (error) {
    console.error("Erro ao registrar movimento:", error);
    res.status(500).json({ error: 'Erro ao registrar movimento' });
  }
});

module.exports = router;
