const express = require('express');
const router = express.Router();
const db = require('../services/firebase');

function collectionName(req, base) {
  const loja = req.headers['x-loja'] === '2' ? '2' : '1';
  return loja === '2' ? `${base}2` : base;
}


// Listar produtos
router.get('/', async (req, res) => {
  try {
    const col = collectionName(req, 'produtos');
    const snapshot = await db.ref(col).once('value');
    const data = snapshot.val() || {};
    const produtos = Object.entries(data).map(([id, p]) => ({ id, ...p }));
    res.json(produtos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Cadastrar produto
router.post('/', async (req, res) => {
  try {
    const col = collectionName(req, 'produtos');
    const { nome, quantidadeEntrada, valorCompra, valorVenda, quantidadeMinima, foto } = req.body;

    if (!nome || quantidadeEntrada == null || valorCompra == null || valorVenda == null || quantidadeMinima == null) {
      return res.status(400).json({ error: 'Preencha todos os campos' });
    }

    const produtosRef = db.ref(col);
    const novoProdutoRef = produtosRef.push();

    await novoProdutoRef.set({
      nome,
      quantidadeEntrada,
      valorCompra,
      valorVenda,
      quantidadeMinima,
      foto: foto || null,
      criadoEm: new Date().toISOString()
    });

    res.status(201).json({ id: novoProdutoRef.key, message: 'Produto cadastrado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar produto' });
  }
});

// Atualizar produto
router.put('/:id', async (req, res) => {
  try {
    const col = collectionName(req, 'produtos');
    const { id } = req.params;
    const produtoRef = db.ref(`${col}/${id}`);

    const snapshot = await produtoRef.once('value');
    if (!snapshot.exists()) return res.status(404).json({ error: 'Produto não encontrado' });

    await produtoRef.update({
      ...req.body,
      atualizadoEm: new Date().toISOString()
    });

    res.json({ message: 'Produto atualizado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

module.exports = router;
