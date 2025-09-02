const express = require("express");
const router = express.Router();
const Produto = require("../models/Produto");
const Movimento = require("../models/Movimento");

// Função para identificar loja pelo header
function getLoja(req) {
  return req.headers["x-loja"] === "2" ? "2" : "1";
}

// Listar produtos
router.get("/", async (req, res) => {
  try {
    const loja = getLoja(req);
    const produtos = await Produto.find({ loja });
    res.json(produtos);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

// Cadastrar produto
router.post("/", async (req, res) => {
  try {
    const loja = getLoja(req);
    const { nome, quantidadeEntrada, valorCompra, valorVenda, quantidadeMinima, foto, categoria } = req.body;

    if (!nome || quantidadeEntrada == null || valorCompra == null || valorVenda == null || quantidadeMinima == null || !categoria) {
      return res.status(400).json({ error: "Preencha todos os campos" });
    }

    const novoProduto = new Produto({
      nome,
      quantidadeEntrada,
      valorCompra,
      valorVenda,
      quantidadeMinima,
      foto: foto || null,
      categoria, // 🔹 salva categoria
      loja,
    });
    await novoProduto.save();

    res.status(201).json({ message: "Produto cadastrado com sucesso", produto: novoProduto });
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error);
    res.status(500).json({ error: "Erro ao cadastrar produto" });
  }
});

// Atualizar produto
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const produto = await Produto.findById(id);
    if (!produto) return res.status(404).json({ error: "Produto não encontrado" });

    Object.assign(produto, req.body, { atualizadoEm: new Date() });

    await produto.save();
    res.json({ message: "Produto atualizado com sucesso", produto });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
});

// Excluir produto
router.delete("/:id", async (req, res) => {
  try {
    const loja = getLoja(req);
    const { id } = req.params;

    const produto = await Produto.findById(id);
    if (!produto) return res.status(404).json({ error: "Produto não encontrado" });

    // Antes de excluir, salva no histórico
    const movimento = new Movimento({
      produtoNome: produto.nome,
      quantidade: 0,
      tipo: "Exclusão",
      usuario: req.headers["x-usuario"] || "",
      loja,
    });

    await movimento.save();

    // Exclui o produto
    await produto.deleteOne();

    res.json({ message: "Produto excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    res.status(500).json({ error: "Erro ao excluir produto" });
  }
});

module.exports = router;
