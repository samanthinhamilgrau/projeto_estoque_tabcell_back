const express = require('express');
const router = express.Router();
const Celular = require('../models/Celular');
const Garantia = require('../models/Garantia');
const LucroServico = require('../models/LucroServico');

// Definir coleção com base na loja
function collectionName(req, base) {
  const loja = req.headers['x-loja'] === '2' ? '2' : '1';
  return loja === '2' ? `${base}2` : base;
}

// Criar novo registro de celular
router.post('/', async (req, res) => {
  try {
    const { nome, contato, modelo, defeito, valor } = req.body;
    if (!nome || !contato || !modelo || !defeito || valor == null) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const novoCelular = new Celular({
      nome,
      contato,
      modelo,
      defeito,
      valor,
      dataChegada: new Date(),
      loja: collectionName(req, 'celulares') // opcional, para diferenciar lojas
    });

    await novoCelular.save();
    res.status(201).json(novoCelular);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar celular.' });
  }
});

// Listar celulares
router.get('/', async (req, res) => {
  try {
    const col = collectionName(req, 'celulares');
    const celulares = await Celular.find({ loja: col });
    res.json(celulares);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar celulares.' });
  }
});

// Finalizar celular e mover para garantia
router.post('/finalizar-garantia/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const celular = await Celular.findById(id);
    if (!celular) return res.status(404).json({ error: 'Celular não encontrado.' });

    const dataEntrega = new Date();

    // Salvar na garantia
   const garantia = new Garantia({
      ...celular.toObject(),
      loja: celular.loja,   // 🔹 garante que mantém a loja certa
      dataEntrega
    });
    await garantia.save();

    // Registrar lucro
    const lucro = new LucroServico({
      descricao: `${celular.modelo} (${celular.defeito})`,
      valor: Number(celular.valor),
      data: dataEntrega
    });
    await lucro.save();

    // Remover da lista de conserto
    await Celular.findByIdAndDelete(id);

    res.json({ message: 'Celular finalizado, lucro registrado e movido para garantia.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao finalizar celular.' });
  }
});

// Excluir celular da garantia (definitivo)
router.delete('/garantia/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Garantia.findByIdAndDelete(id);
    res.json({ message: 'Celular removido da garantia.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir da garantia.' });
  }
});

// Listar garantia
router.get('/garantia', async (req, res) => {
  try {
    const col = collectionName(req, 'celulares'); // mesmo base para identificar a loja
    const garantia = await Garantia.find({ loja: col });
    res.json(garantia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar garantia.' });
  }
});

module.exports = router;
