const mongoose = require("mongoose");

const MovimentoSchema = new mongoose.Schema({
  produtoId: { type: mongoose.Schema.Types.ObjectId, ref: "Produto" }, // null no caso de exclusão
  produtoNome: { type: String }, // usado em exclusões
  quantidade: { type: Number, default: 0 },
  tipo: { type: String, enum: ["entrada", "saida", "Exclusão"], required: true },
  data: { type: Date, default: Date.now },
  usuario: { type: String, required: true }, // email do usuário
  loja: { type: String, enum: ["1", "2"], default: "1" }
});

module.exports = mongoose.model("Movimento", MovimentoSchema);
