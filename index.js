const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

// Servidor HTTP y WebSocket juntos
const server = app.listen(process.env.PORT || 8080);
const wss = new WebSocket.Server({ server });

// Sesiones de usuarios (userId únicos)
const usuarios = new Map();

wss.on('connection', (ws) => {
  const userId = generarIDunico();
  usuarios.set(userId, ws);

  // Envía al usuario su canal único (userId)
  ws.send(JSON.stringify({ tipo: 'conexion', userId }));

  ws.on('message', async (mensaje) => {
    const mensajeUsuario = JSON.parse(mensaje);
    mensajeUsuario.userId = userId;
    
    // No es necesario enviar a Replit desde aquí,
    // porque ahora eso lo hacemos directamente desde la interfaz en Replit.
  });

  ws.on('close', () => {
    usuarios.delete(userId);
  });
});

// Desde Replit envías instrucciones aquí, con el canal (userId)
app.post('/respuesta-gpt', (req, res) => {
  const { userId, respuestaGPT } = req.body;
  const usuarioSocket = usuarios.get(userId);

  if (usuarioSocket) {
    usuarioSocket.send(JSON.stringify({ tipo: 'respuesta', respuestaGPT }));
    res.json({ status: '✅ Enviado correctamente al usuario' });
  } else {
    res.json({ status: '⚠️ Usuario desconectado o canal incorrecto' });
  }
});

function generarIDunico() {
  return Math.random().toString(36).substr(2, 9);
}

// Ruta nueva para verificar si canal existe y está conectado
app.post('/verificar-canal', (req, res) => {
  const { userId } = req.body;
  const conectado = usuarios.has(userId);
  res.json({ conectado });
});

