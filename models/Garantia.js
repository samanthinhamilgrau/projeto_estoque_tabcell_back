const mongoose = require('mongoose');

const GarantiaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  contato: { type: String, required: true },
  modelo: { type: String, required: true },
  defeito: { type: String, required: true },
  valor: { type: Number, required: true },
  dataChegada: { type: Date, required: true },
  loja: { type: String },
  dataEntrega: { type: Date, required: true },
});

module.exports = mongoose.model('Garantia', GarantiaSchema);
