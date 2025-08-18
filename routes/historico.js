const express = require('express');
const router = express.Router();
const db = require('../services/firebase');

function collectionName(req, base) {
  const loja = req.headers['x-loja'] === '2' ? '2' : '1';
  return loja === '2' ? `${base}2` : base;
}


// GET /historico?ano=2025&mes=8
router.get('/', async (req, res) => {
  try {
    const { ano, mes } = req.query;

    const colMov = collectionName(req, 'movimentos');
    const colProd = collectionName(req, 'produtos');
    const colUsers = 'usuarios'; // FIXADO para buscar sempre na mesma coleção


    const snapshot = await db.ref(colMov).orderByChild('data').once('value');
    const movimentosData = snapshot.val() || {};

    let movimentosArray = Object.entries(movimentosData).map(([id, data]) => ({
      id,
      ...data
    }));

    if (ano && mes) {
      const inicio = new Date(ano, mes - 1, 1);
      const fim = new Date(ano, mes, 0, 23, 59, 59);
      movimentosArray = movimentosArray.filter(mov => {
        const dataMov = new Date(mov.data);
        return dataMov >= inicio && dataMov <= fim;
      });
    }

    movimentosArray.sort((a, b) => new Date(b.data) - new Date(a.data));

   const movimentosComDetalhes = await Promise.all(
  movimentosArray.map(async (mov) => {
    let nomeProduto = 'Produto não encontrado';

    if (mov.produtoNome) {
      // caso exclusão → nome salvo direto
      nomeProduto = mov.produtoNome;
    } else if (mov.produtoId) {
      // caso entrada/saída → busca pelo id
      const prodSnap = await db.ref(`${colProd}/${mov.produtoId}`).once('value');
      if (prodSnap.exists()) nomeProduto = prodSnap.val().nome;
    }

    let nomeUsuario = 'Desconhecido';
    if (mov.usuario && typeof mov.usuario === 'string') {
      const emailKey = mov.usuario.replace(/\./g, ',');
      const userSnap = await db.ref(`${colUsers}/${emailKey}`).once('value');
      if (userSnap.exists()) nomeUsuario = userSnap.val().nome;
    }

    return {
      id: mov.id,
      produto: nomeProduto,
      quantidade: mov.quantidade || 0,
      tipo: mov.tipo || '',
      data: mov.data ? new Date(mov.data).toISOString().split('T')[0] : '',
      usuario: nomeUsuario
    };
  })
);


    res.json(movimentosComDetalhes);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

module.exports = router;
