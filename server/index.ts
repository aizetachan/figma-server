import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import WebSocket from 'ws'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

// Creamos un servidor HTTP a partir de la app Express
const server = createServer(app)
const PORT = process.env.PORT || 8080

// Ponemos en marcha el servidor
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

// Configuramos el servidor WebSocket en el mismo servidor HTTP
const wss = new WebSocket.Server({ server })

// Mapa para almacenar conexiones (usuarios), identificados por userId
const usuarios = new Map<string, WebSocket>()

wss.on('connection', (socket: WebSocket) => {
  // Al conectarse un nuevo cliente, creamos un userId único
  const userId = Math.random().toString(36).substr(2, 9)
  usuarios.set(userId, socket)

  console.log(`✅ Nuevo cliente conectado con ID: ${userId}`)

  // Enviamos el userId al cliente al conectarse
  socket.send(JSON.stringify({ tipo: 'conexion', userId }))

  // Cuando el cliente envía un mensaje, respondemos con un "ack"
  socket.on('message', (data) => {
    console.log(`📥 Mensaje del cliente [${userId}]:`, data.toString())
    // Respuesta inmediata para confirmar
    socket.send(JSON.stringify({
      tipo: 'ack',
      mensaje: 'Recibido con éxito',
      echo: data.toString()
    }))
  })

  // Cuando el cliente se desconecta
  socket.on('close', () => {
    console.log(`❌ Cliente con ID: ${userId} se ha desconectado`)
    usuarios.delete(userId)
  })
})

// Ruta para recibir instrucciones desde Replit (GPT) y reenviarlas al cliente (plugin MCP)
app.post('/respuesta-gpt', (req, res) => {
  const { userId, respuestaGPT } = req.body

  // Buscamos al usuario por userId en el mapa
  const usuarioSocket = usuarios.get(userId)

  if (usuarioSocket) {
    usuarioSocket.send(JSON.stringify({ 
      tipo: 'respuesta', 
      respuestaGPT 
    }))
    return res.json({ status: 'ok', mensaje: 'Respuesta enviada al usuario' })
  } else {
    return res.json({ status: 'error', mensaje: 'Usuario no encontrado o desconectado' })
  }
})
