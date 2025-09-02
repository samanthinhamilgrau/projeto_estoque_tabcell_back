const express = require("express");
const router = express.Router();
const Movimento = require("../models/Movimento");
const Produto = require("../models/Produto");
const Servico = require("../models/Servico"); // equivalente a lucroServicos

// util
function getStartAndEndOfDay(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// Função já usada no movimentos.js
function getLoja(req) {
  return req.headers["x-loja"] === "2" ? "2" : "1";
}

function formatDateBR(date) {
  return date.toLocaleDateString("pt-BR");
}

// Estatísticas diárias
router.get("/diario", async (req, res) => {
  try {
    const loja = getLoja(req);
    const { start, end } = getStartAndEndOfDay(new Date());

    const movimentos = await Movimento.find({
      tipo: "saida",
      data: { $gte: start, $lte: end },
      loja, // 👈 agora filtra pela loja
    });

    let totalVendidos = 0;
    let valorVendaTotal = 0;
    let valorLucroTotal = 0;
    const vendasPorProduto = {};

    for (const mov of movimentos) {
      const prod = await Produto.findById(mov.produtoId);
      if (!prod) continue;

      totalVendidos += mov.quantidade;
      valorVendaTotal += prod.valorVenda * mov.quantidade;
      valorLucroTotal += (prod.valorVenda - prod.valorCompra) * mov.quantidade;

      if (!vendasPorProduto[mov.produtoId]) {
        vendasPorProduto[mov.produtoId] = {
          nome: prod.nome,
          quantidade: 0,
          valorVendaTotal: 0,
        };
      }
      vendasPorProduto[mov.produtoId].quantidade += mov.quantidade;
      vendasPorProduto[mov.produtoId].valorVendaTotal +=
        prod.valorVenda * mov.quantidade;
    }

    // === LUCRO DOS SERVIÇOS (celulares finalizados) ===
    const servicos = await Servico.find({
      data: { $gte: start, $lte: end },
      loja, // 👈 também filtra serviços por loja
    });

    let lucroServicos = servicos.reduce(
      (acc, serv) => acc + (Number(serv.valor) || 0),
      0
    );

    valorLucroTotal += lucroServicos;

    res.json({
      data: formatDateBR(start),
      totalVendidos,
      valorVendaTotal,
      valorLucroTotal,
      listaProdutos: Object.values(vendasPorProduto),
      lucroServicos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao gerar estatísticas diárias" });
  }
});

// Estatísticas mensais
router.get("/mensal", async (req, res) => {
  try {
    const loja = getLoja(req);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const movimentos = await Movimento.find({
      tipo: "saida",
      data: { $gte: start, $lte: end },
      loja, // 👈 agora filtra pela loja
    });

    let totalVendidos = 0;
    let valorVendaTotal = 0;
    let valorLucroTotal = 0;
    const vendasPorProduto = {};

    for (const mov of movimentos) {
      const prod = await Produto.findById(mov.produtoId);
      if (!prod) continue;

      totalVendidos += mov.quantidade;
      valorVendaTotal += prod.valorVenda * mov.quantidade;
      valorLucroTotal += (prod.valorVenda - prod.valorCompra) * mov.quantidade;

      if (!vendasPorProduto[mov.produtoId]) {
        vendasPorProduto[mov.produtoId] = {
          nome: prod.nome,
          quantidade: 0,
          valorVendaTotal: 0,
        };
      }
      vendasPorProduto[mov.produtoId].quantidade += mov.quantidade;
      vendasPorProduto[mov.produtoId].valorVendaTotal +=
        prod.valorVenda * mov.quantidade;
    }

    // === LUCRO DOS SERVIÇOS (celulares finalizados) ===
    const servicos = await Servico.find({
      data: { $gte: start, $lte: end },
      loja, // 👈 também filtra serviços por loja
    });

    let lucroServicos = servicos.reduce(
      (acc, serv) => acc + (Number(serv.valor) || 0),
      0
    );

    valorLucroTotal += lucroServicos;

    const nomeMes = start.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });

    res.json({
      mes: nomeMes,
      totalVendidos,
      valorVendaTotal,
      valorLucroTotal,
      listaProdutos: Object.values(vendasPorProduto),
      lucroServicos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao gerar estatísticas mensais" });
  }
});

module.exports = router;
