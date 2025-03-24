import express from 'express';
import cors from 'cors';
import { setupWebSocket } from './websocketHandler';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const server = app.listen(process.env.PORT || 8080, () => {
  console.log('🚀 Server running');
});

// Inicializa WebSocket
setupWebSocket(server);

// Ruta para recibir instrucciones de Replit y enviarlas a Figma
app.post('/respuesta-gpt', (req, res) => {
  const { userId, respuestaGPT } = req.body;
  // Aquí llama a tu lógica WebSocket existente para enviar respuesta al cliente Figma
  res.json({ status: 'ok' });
});
