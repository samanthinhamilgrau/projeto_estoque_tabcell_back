const mongoose = require('mongoose');

const LucroServicoSchema = new mongoose.Schema({
  descricao: { type: String, required: true }, // ex: "Galaxy A10 (tela quebrada)"
  valor: { type: Number, required: true },
  data: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LucroServico', LucroServicoSchema);
