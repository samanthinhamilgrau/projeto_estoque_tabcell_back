const express = require('express');
const cors = require('cors');

// Importando rotas (uma versão por recurso, dinâmica)
const usuariosRoutes = require('./routes/usuarios');
const produtosRoutes = require('./routes/produtos');
const listaComprasRoutes = require('./routes/listaCompras');
const editarMovimentoRoutes = require('./routes/editarMovimento');
const estatisticasRoutes = require('./routes/estatisticas');
const historicoRoutes = require('./routes/historico');
const celularesRoutes = require('./routes/celulares');

const app = express();

// Middlewares
app.use(cors({
  origin: '*'
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Registrando rotas (cada rota irá escolher a coleção certa via header x-loja)
app.use('/usuarios', usuariosRoutes);
app.use('/produtos', produtosRoutes);
app.use('/lista-compras', listaComprasRoutes);
app.use('/movimentos', editarMovimentoRoutes);
app.use('/estatisticas', estatisticasRoutes);
app.use('/historico', historicoRoutes);
app.use('/celulares', celularesRoutes);

// Iniciando servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
