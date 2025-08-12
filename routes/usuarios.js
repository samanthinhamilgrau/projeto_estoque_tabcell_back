const express = require('express');
const router = express.Router();
const db = require('../services/firebase');

// Função para converter email em uma chave válida no RTDB
function emailParaChave(email) {
  // troca todos os pontos por vírgulas
  return email.replace(/\./g, ',');
}

// GET usuário por email
router.get('/:email', async (req, res) => {
  try {
    const emailKey = emailParaChave(req.params.email);
    const snapshot = await db.ref(`usuarios/${emailKey}`).once('value');
    const usuario = snapshot.val();

    if (!usuario) {
      return res.json(null); // usuário não existe
    }

    return res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// Cadastro
router.post('/', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Campos obrigatórios: nome, email e senha' });
  }

  try {
    const emailKey = emailParaChave(email);
    const userRef = db.ref(`usuarios/${emailKey}`);
    const snapshot = await userRef.once('value');

    if (snapshot.val() !== null) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    await userRef.set({ nome, email, senha });
    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }

  try {
    const emailKey = emailParaChave(email);
    const snapshot = await db.ref(`usuarios/${emailKey}`).once('value');
    const usuario = snapshot.val();

    if (!usuario) {
      return res.status(404).json({ error: 'E-mail não encontrado' });
    }
    if (usuario.senha !== senha) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    return res.status(200).json({ message: 'Login bem-sucedido', usuario });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro no login' });
  }
});

// Atualizar dados do usuário
router.put('/:email', async (req, res) => {
  const { nome, emailNovo, senha } = req.body;
  const emailAntigo = req.params.email;

  try {
    const emailKeyAntigo = emailParaChave(emailAntigo);
    const userRef = db.ref(`usuarios/${emailKeyAntigo}`);
    const snapshot = await userRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const novosDados = { nome, senha };

    // Trocar o email (chave no RTDB)
    if (emailNovo && emailNovo !== emailAntigo) {
      const emailKeyNovo = emailParaChave(emailNovo);
      const novoRef = db.ref(`usuarios/${emailKeyNovo}`);
      await novoRef.set({ nome, email: emailNovo, senha });
      await userRef.remove();
      return res.json({ message: 'Usuário atualizado com sucesso', email: emailNovo });
    }

    await userRef.update(novosDados);
    res.json({ message: 'Usuário atualizado com sucesso', email: emailAntigo });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

module.exports = router;
