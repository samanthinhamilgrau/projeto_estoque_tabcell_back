const mongoose = require('mongoose');

const CelularSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  contato: { type: String, required: true },
  modelo: { type: String, required: true },
  defeito: { type: String, required: true },
  valor: { type: Number, required: true },
  dataChegada: { type: Date, default: Date.now },
  loja: { type: String }, // Ex: "celulares" ou "celulares2"
});

module.exports = mongoose.model('Celular', CelularSchema);
