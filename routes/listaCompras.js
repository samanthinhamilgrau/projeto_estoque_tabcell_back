const express = require('express');
const router = express.Router();
const db = require('../services/firebase');

function collectionName(req, base) {
  const loja = req.headers['x-loja'] === '2' ? '2' : '1';
  return loja === '2' ? `${base}2` : base;
}


// Listar (ordenado por criadoEm desc)
router.get('/', async (req, res) => {
  try {
    const col = collectionName(req, 'lista_compras');
    const snapshot = await db.ref(col).orderByChild('criadoEm').once('value');
    const data = snapshot.val() || {};

    const items = Object.entries(data)
      .map(([id, item]) => ({ id, ...item }))
      .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

    res.status(200).json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar lista de compras' });
  }
});

// Adicionar item
router.post('/', async (req, res) => {
  try {
    const col = collectionName(req, 'lista_compras');
    const { nome, descricao, criadoEm } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });

    const ref = db.ref(col);
    const newItemRef = ref.push();

    await newItemRef.set({
      nome,
      descricao: descricao || null,
      criadoEm: criadoEm || new Date().toISOString()
    });

    res.status(201).json({ id: newItemRef.key, message: 'Adicionado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar' });
  }
});

// Deletar item
router.delete('/:id', async (req, res) => {
  try {
    const col = collectionName(req, 'lista_compras');
    const { id } = req.params;
    await db.ref(`${col}/${id}`).remove();
    res.status(200).json({ message: 'Removido' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover' });
  }
});

module.exports = router;
