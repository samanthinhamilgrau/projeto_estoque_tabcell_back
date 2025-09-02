const express = require("express");
const router = express.Router();
const Produto = require("../models/Produto");
const Movimento = require("../models/Movimento");

// Função para identificar loja pelo header
function getLoja(req) {
  return req.headers["x-loja"] === "2" ? "2" : "1";
}

// Registrar movimento (entrada/saida)
router.post("/", async (req, res) => {
  try {
    const loja = getLoja(req);
    const { produtoId, quantidade, tipo, usuarioEmail, data } = req.body;

    if (!produtoId || quantidade == null || !tipo || !usuarioEmail) {
      return res.status(400).json({ error: "Preencha todos os campos" });
    }

    // Buscar produto
    const produto = await Produto.findOne({ _id: produtoId, loja });
    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    // Atualizar quantidade
    let novaQuantidade = produto.quantidadeEntrada || 0;

    if (tipo === "entrada") {
      novaQuantidade += quantidade;
    } else if (tipo === "saida") {
      novaQuantidade -= quantidade;
      if (novaQuantidade < 0) novaQuantidade = 0;
    } else {
      return res.status(400).json({ error: "Tipo inválido" });
    }

    produto.quantidadeEntrada = novaQuantidade;
    produto.atualizadoEm = new Date();
    await produto.save();

    // Registrar movimento
    const movimento = new Movimento({
      produtoNome: produto.nome,
      produtoId: produto._id,
      quantidade,
      tipo,
      data: data ? new Date(data) : new Date(),
      usuario: usuarioEmail,
      loja,
    });

    await movimento.save();

    res.json({ message: "Movimento registrado com sucesso", novaQuantidade });
  } catch (error) {
    console.error("Erro ao registrar movimento:", error);
    res.status(500).json({ error: "Erro ao registrar movimento" });
  }
});

module.exports = router;