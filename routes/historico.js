const express = require("express");
const router = express.Router();
const Movimento = require("../models/Movimento");
const Produto = require("../models/Produto");
const Usuario = require("../models/Usuario");

// Descobre loja pelo header
function getLoja(req) {
  return req.headers["x-loja"] === "2" ? "2" : "1";
}

// GET /historico?ano=2025&mes=8
router.get("/", async (req, res) => {
  try {
    const loja = getLoja(req);
    const { ano, mes } = req.query;

    // Filtro inicial só pela loja
    let filtro = { loja };

    if (ano && mes) {
      const inicio = new Date(ano, mes - 1, 1);
      const fim = new Date(ano, mes, 0, 23, 59, 59);
      filtro.data = { $gte: inicio, $lte: fim };
    }

    let movimentos = await Movimento.find(filtro).sort({ data: -1 });

    // Enriquecer com nomes de produto e usuário
    const movimentosComDetalhes = await Promise.all(
      movimentos.map(async (mov) => {
        let nomeProduto = "Produto não encontrado";

        if (mov.produtoNome) {
          // exclusão → já tem nome salvo
          nomeProduto = mov.produtoNome;
        } else if (mov.produtoId) {
          const produto = await Produto.findById(mov.produtoId);
          if (produto) nomeProduto = produto.nome;
        }

        let nomeUsuario = "Desconhecido";
        if (mov.usuario) {
          const user = await Usuario.findOne({ email: mov.usuario });
          if (user) nomeUsuario = user.nome;
        }

        return {
          id: mov._id,
          produto: nomeProduto,
          quantidade: mov.quantidade || 0,
          tipo: mov.tipo,
          data: mov.data ? mov.data.toISOString().split("T")[0] : "",
          usuario: nomeUsuario
        };
      })
    );

    res.json(movimentosComDetalhes);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
});

module.exports = router;
