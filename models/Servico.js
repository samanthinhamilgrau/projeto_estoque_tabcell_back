// models/Servico.js
const mongoose = require('mongoose');

const ServicoSchema = new mongoose.Schema({
  descricao: { type: String, required: true },
  valor: { type: Number, required: true },
  data: { type: Date, required: true, default: Date.now },
  cliente: { type: String }, // opcional
  // adicione outros campos se tiver, como status, celularId etc.
});

module.exports = mongoose.model('Servico', ServicoSchema);
