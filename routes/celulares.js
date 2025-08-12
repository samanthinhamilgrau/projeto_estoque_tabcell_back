const express = require('express');
const router = express.Router();
const db = require('../services/firebase');

function collectionName(req, base) {
  const loja = req.headers['x-loja'] === '2' ? '2' : '1';
  return loja === '2' ? `${base}2` : base;
}

// Referência dinâmica
// Criar novo registro de celular
router.post('/', async (req, res) => {
  try {
    const col = collectionName(req, 'celulares');
    const { nome, contato, modelo, defeito, valor } = req.body;

    if (!nome || !contato || !modelo || !defeito || valor == null) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const novoCelular = {
      nome,
      contato,
      modelo,
      defeito,
      valor,
      dataChegada: new Date().toISOString(),
    };

    const newRef = db.ref(col).push();
    await newRef.set(novoCelular);

    res.status(201).json({ id: newRef.key, ...novoCelular });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar celular.' });
  }
});

// Listar celulares
router.get('/', async (req, res) => {
  try {
    const col = collectionName(req, 'celulares');
    const snapshot = await db.ref(col).once('value');
    const data = snapshot.val();
    if (!data) return res.json([]);
    const lista = Object.entries(data).map(([id, c]) => ({ id, ...c }));
    res.json(lista);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar celulares.' });
  }
});

// Finalizar (apagar) celular
// Finalizar (apagar) celular e registrar lucro
router.delete('/:id', async (req, res) => {
  try {
    const col = collectionName(req, 'celulares');
    const { id } = req.params;

    const celularSnap = await db.ref(`${col}/${id}`).once('value');
    const celular = celularSnap.val();
    if (!celular) {
      return res.status(404).json({ error: 'Celular não encontrado.' });
    }

    // Registrar no lucro de serviços
    const colServ = collectionName(req, 'lucroServicos');
    const servicoRef = db.ref(colServ).push();
    await servicoRef.set({
      descricao: `${celular.modelo} (${celular.defeito})`,
      valor: Number(celular.valor),
      data: new Date().toISOString()
    });

    // Remover o celular da lista de consertos
    await db.ref(`${col}/${id}`).remove();

    res.json({ message: 'Celular finalizado e lucro registrado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao finalizar celular.' });
  }
});


module.exports = router;
