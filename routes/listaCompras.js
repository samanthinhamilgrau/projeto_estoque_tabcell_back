const express = require("express");
const router = express.Router();
const ListaCompra = require("../models/ListaCompra");

// Função para identificar loja pelo header
function getLoja(req) {
  return req.headers["x-loja"] === "2" ? "2" : "1";
}

// Listar (ordenado por criadoEm desc)
router.get("/", async (req, res) => {
  try {
    const loja = getLoja(req);
    const items = await ListaCompra.find({ loja }).sort({ criadoEm: -1 });
    res.status(200).json(items);
  } catch (err) {
    console.error("Erro ao buscar lista de compras:", err);
    res.status(500).json({ error: "Erro ao buscar lista de compras" });
  }
});

// Adicionar item
router.post("/", async (req, res) => {
  try {
    const loja = getLoja(req);
    const { nome, descricao, criadoEm } = req.body;
    if (!nome) return res.status(400).json({ error: "Nome é obrigatório" });

    const newItem = new ListaCompra({
      nome,
      descricao,
      criadoEm: criadoEm ? new Date(criadoEm) : new Date(),
      loja
    });

    await newItem.save();
    res.status(201).json({ id: newItem._id, message: "Adicionado" });
  } catch (err) {
    console.error("Erro ao adicionar item:", err);
    res.status(500).json({ error: "Erro ao adicionar" });
  }
});

// Deletar item
router.delete("/:id", async (req, res) => {
  try {
    const loja = getLoja(req);
    const { id } = req.params;

    const deleted = await ListaCompra.findOneAndDelete({ _id: id, loja });
    if (!deleted) {
      return res.status(404).json({ error: "Item não encontrado" });
    }

    res.status(200).json({ message: "Removido" });
  } catch (err) {
    console.error("Erro ao remover item:", err);
    res.status(500).json({ error: "Erro ao remover" });
  }
});

module.exports = router;
