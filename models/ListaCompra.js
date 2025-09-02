const mongoose = require("mongoose");

const ListaCompraSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String },
  criadoEm: { type: Date, default: Date.now },
  loja: { type: String, enum: ["1", "2"], default: "1" }
});

module.exports = mongoose.model("ListaCompra", ListaCompraSchema);
