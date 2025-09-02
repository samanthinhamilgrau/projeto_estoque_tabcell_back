const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");

// GET usuário por email
router.get("/:email", async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ email: req.params.email });

    if (!usuario) {
      return res.json(null); // usuário não existe
    }

    return res.json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

// Cadastro
router.post("/", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ error: "Campos obrigatórios: nome, email e senha" });
  }

  try {
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    const novoUsuario = new Usuario({ nome, email, senha });
    await novoUsuario.save();

    res.status(201).json({ message: "Usuário criado com sucesso", novoUsuario });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Preencha todos os campos" });
  }

  try {
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(404).json({ error: "E-mail não encontrado" });
    }
    if (usuario.senha !== senha) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    return res.status(200).json({ message: "Login bem-sucedido", usuario });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro no login" });
  }
});

// Atualizar dados do usuário
router.put("/:email", async (req, res) => {
  const { nome, emailNovo, senha } = req.body;
  const emailAntigo = req.params.email;

  try {
    const usuario = await Usuario.findOne({ email: emailAntigo });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    usuario.nome = nome || usuario.nome;
    usuario.senha = senha || usuario.senha;

    if (emailNovo && emailNovo !== emailAntigo) {
      usuario.email = emailNovo;
    }

    await usuario.save();
    res.json({ message: "Usuário atualizado com sucesso", usuario });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

module.exports = router;
