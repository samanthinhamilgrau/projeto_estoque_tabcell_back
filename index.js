const express = require('express');
const cors = require('cors');
require('dotenv').config(); // para usar o MONGO_URI do .env

// Importando rotas
const usuariosRoutes = require('./routes/usuarios');
const produtosRoutes = require('./routes/produtos');
const listaComprasRoutes = require('./routes/listaCompras');
const editarMovimentoRoutes = require('./routes/editarMovimento');
const estatisticasRoutes = require('./routes/estatisticas');
const historicoRoutes = require('./routes/historico');
const celularesRoutes = require('./routes/celulares');

// Conexão MongoDB
const connectDB = require('./services/mongo'); 

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rotas
app.use('/usuarios', usuariosRoutes);
app.use('/produtos', produtosRoutes);
app.use('/lista-compras', listaComprasRoutes);
app.use('/movimentos', editarMovimentoRoutes);
app.use('/estatisticas', estatisticasRoutes);
app.use('/historico', historicoRoutes);
app.use('/celulares', celularesRoutes);

// Iniciando servidor só depois de conectar no banco
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
});
