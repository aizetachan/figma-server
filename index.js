const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

// Servidor HTTP
const server = app.listen(process.env.PORT || 8080);

// Servidor WebSocket
const wss = new WebSocket.Server({ server });

const usuarios = new Map();

wss.on('connection', (ws) => {
  const userId = Math.random().toString(36).substr(2, 9);
  usuarios.set(userId, ws);
  ws.send(JSON.stringify({ tipo: 'conexion', userId }));

  ws.on('message', async (mensaje) => {
    const mensajeUsuario = JSON.parse(mensaje);
    mensajeUsuario.userId = userId;

    // Aquí conecta tu proyecto de Replit (cuando lo tengas):
    await axios.post('https://https://figma-ai-tool.replit.app//figma', mensajeUsuario);
  });

  ws.on('close', () => usuarios.delete(userId));
});

// Recibir respuestas desde Replit/GPT
app.post('/respuesta-gpt', (req, res) => {
  const { userId, respuestaGPT } = req.body;
  const usuarioSocket = usuarios.get(userId);
  if (usuarioSocket) {
    usuarioSocket.send(JSON.stringify({ tipo: 'respuesta', respuestaGPT }));
    res.json({ status: 'enviado' });
  } else {
    res.json({ status: 'usuario desconectado' });
  }
});
