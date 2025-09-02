const mongoose = require("mongoose");

const ProdutoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  quantidadeEntrada: { type: Number, required: true },
  valorCompra: { type: Number, required: true },
  valorVenda: { type: Number, required: true },
  quantidadeMinima: { type: Number, required: true },
  foto: { type: String, default: null },
  categoria: { type: String, required: true }, // 🔹 novo campo
  loja: { type: String, default: "1" },
  criadoEm: { type: Date, default: Date.now },
  atualizadoEm: { type: Date },
});

module.exports = mongoose.model("Produto", ProdutoSchema);
