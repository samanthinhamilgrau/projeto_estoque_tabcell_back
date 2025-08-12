const express = require('express');
const router = express.Router();
const db = require('../services/firebase');

// util
function collectionName(req, base) {
  const loja = req.headers['x-loja'] === '2' ? '2' : '1';
  return loja === '2' ? `${base}2` : base;
}

function getStartAndEndOfDay(date) {
  const start = new Date(date);
  start.setHours(0,0,0,0);
  const end = new Date(date);
  end.setHours(23,59,59,999);
  return { start, end };
}

function formatDateBR(date) {
  return date.toLocaleDateString('pt-BR');
}

function parseDate(value) {
  if (!value) return null;
  if (typeof value === 'string') return new Date(value);
  if (value.seconds) return new Date(value.seconds * 1000);
  return new Date(value);
}

// Estatísticas diárias
router.get('/diario', async (req, res) => {
  try {
    const { start, end } = getStartAndEndOfDay(new Date());
    const colMov = collectionName(req, 'movimentos');
    const colProd = collectionName(req, 'produtos');

    const snapshot = await db.ref(colMov).orderByChild('tipo').equalTo('saida').once('value');
    const movimentosData = snapshot.val() || {};

    let totalVendidos = 0;
    let valorVendaTotal = 0;
    let valorLucroTotal = 0;
    const vendasPorProduto = {};

    const movimentosArray = Object.values(movimentosData).filter(mov => {
      const dataMov = parseDate(mov.data);
      return dataMov >= start && dataMov <= end;
    });

    for (const mov of movimentosArray) {
      const produtoSnap = await db.ref(`${colProd}/${mov.produtoId}`).once('value');
      const prod = produtoSnap.val();
      if (!prod) continue;

      totalVendidos += mov.quantidade;
      valorVendaTotal += prod.valorVenda * mov.quantidade;
      valorLucroTotal += (prod.valorVenda - prod.valorCompra) * mov.quantidade;

      if (!vendasPorProduto[mov.produtoId]) {
        vendasPorProduto[mov.produtoId] = { nome: prod.nome, quantidade: 0, valorVendaTotal: 0 };
      }
      vendasPorProduto[mov.produtoId].quantidade += mov.quantidade;
      vendasPorProduto[mov.produtoId].valorVendaTotal += prod.valorVenda * mov.quantidade;
    }

    // === LUCRO DOS SERVIÇOS (celulares finalizados) ===
    const colServ = collectionName(req, 'lucroServicos');
    const servicosSnap = await db.ref(colServ).once('value');
    const servicosData = servicosSnap.val() || {};

    let lucroServicos = 0;
    for (const serv of Object.values(servicosData)) {
      const dataServ = parseDate(serv.data);
      if (dataServ >= start && dataServ <= end) {
        lucroServicos += Number(serv.valor) || 0;
      }
    }

    valorLucroTotal += lucroServicos;

    res.json({
      data: formatDateBR(start),
      totalVendidos,
      valorVendaTotal,
      valorLucroTotal,
      listaProdutos: Object.values(vendasPorProduto),
      lucroServicos // opcional, caso queira mostrar separado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar estatísticas diárias' });
  }
});

// Estatísticas mensais
router.get('/mensal', async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const colMov = collectionName(req, 'movimentos');
    const colProd = collectionName(req, 'produtos');

    const snapshot = await db.ref(colMov).orderByChild('tipo').equalTo('saida').once('value');
    const movimentosData = snapshot.val() || {};

    let totalVendidos = 0;
    let valorVendaTotal = 0;
    let valorLucroTotal = 0;
    const vendasPorProduto = {};

    const movimentosArray = Object.values(movimentosData).filter(mov => {
      const dataMov = parseDate(mov.data);
      return dataMov >= start && dataMov <= end;
    });

    for (const mov of movimentosArray) {
      const produtoSnap = await db.ref(`${colProd}/${mov.produtoId}`).once('value');
      const prod = produtoSnap.val();
      if (!prod) continue;

      totalVendidos += mov.quantidade;
      valorVendaTotal += prod.valorVenda * mov.quantidade;
      valorLucroTotal += (prod.valorVenda - prod.valorCompra) * mov.quantidade;

      if (!vendasPorProduto[mov.produtoId]) {
        vendasPorProduto[mov.produtoId] = { nome: prod.nome, quantidade: 0, valorVendaTotal: 0 };
      }
      vendasPorProduto[mov.produtoId].quantidade += mov.quantidade;
      vendasPorProduto[mov.produtoId].valorVendaTotal += prod.valorVenda * mov.quantidade;
    }

    // === LUCRO DOS SERVIÇOS (celulares finalizados) ===
    const colServ = collectionName(req, 'lucroServicos');
    const servicosSnap = await db.ref(colServ).once('value');
    const servicosData = servicosSnap.val() || {};

    let lucroServicos = 0;
    for (const serv of Object.values(servicosData)) {
      const dataServ = parseDate(serv.data);
      if (dataServ >= start && dataServ <= end) {
        lucroServicos += Number(serv.valor) || 0;
      }
    }

    valorLucroTotal += lucroServicos;

    const nomeMes = start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    res.json({
      mes: nomeMes,
      totalVendidos,
      valorVendaTotal,
      valorLucroTotal,
      listaProdutos: Object.values(vendasPorProduto),
      lucroServicos // opcional
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar estatísticas mensais' });
  }
});

module.exports = router;
