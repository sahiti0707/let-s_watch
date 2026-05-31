const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

const PORT = process.env.PORT || 3001;

// Store active rooms
const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`[connect] ${socket.id}`);

  socket.on('join-room', ({ roomId, username }) => {
    if (!roomId || !username) return;

    const room = rooms.get(roomId) || { users: [] };

    if (room.users.length >= 2) {
      socket.emit('room-full');
      return;
    }

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.username = username;

    room.users.push({ id: socket.id, username });
    rooms.set(roomId, room);

    console.log(`[join] ${username} -> room ${roomId} (${room.users.length}/2)`);

    // Notify others in the room
    socket.to(roomId).emit('user-joined', { username });

    // If both users are in the room, signal ready
    if (room.users.length === 2) {
      const [userA, userB] = room.users;
      io.to(userA.id).emit('peer-ready', {
        peerId: userB.id,
        peerUsername: userB.username,
      });
      io.to(userB.id).emit('peer-ready', {
        peerId: userA.id,
        peerUsername: userA.username,
      });
    }
  });

  // WebRTC signaling
  socket.on('offer', (data) => {
    const { roomId } = socket.data;
    if (roomId) {
      socket.to(roomId).emit('offer', {
        offer: data.offer,
        from: socket.id,
      });
    }
  });

  socket.on('answer', (data) => {
    const { roomId } = socket.data;
    if (roomId) {
      socket.to(roomId).emit('answer', {
        answer: data.answer,
        from: socket.id,
      });
    }
  });

  socket.on('ice-candidate', (data) => {
    const { roomId } = socket.data;
    if (roomId) {
      socket.to(roomId).emit('ice-candidate', {
        candidate: data,
        from: socket.id,
      });
    }
  });

  // Sync commands
  socket.on('sync', (data) => {
    const { roomId } = socket.data;
    if (roomId) {
      socket.to(roomId).emit('sync', {
        command: data,
        from: socket.id,
      });
    }
  });

  // Room chat
  socket.on('chat-message', (data) => {
    const { roomId, username } = socket.data;
    if (roomId) {
      io.to(roomId).emit('chat-message', {
        username,
        message: data.message,
        time: Date.now(),
      });
    }
  });

  // Typing indicator
  socket.on('typing', () => {
    const { roomId } = socket.data;
    if (roomId) {
      socket.to(roomId).emit('typing', {
        username: socket.data.username,
      });
    }
  });

  socket.on('leave-room', () => {
    leaveRoom(socket);
  });

  socket.on('disconnect', () => {
    console.log(`[disconnect] ${socket.id}`);
    leaveRoom(socket);
  });
});

function leaveRoom(socket) {
  const { roomId, username } = socket.data;
  if (roomId) {
    socket.to(roomId).emit('user-left', { username });
    socket.leave(roomId);

    const room = rooms.get(roomId);
    if (room) {
      room.users = room.users.filter((u) => u.id !== socket.id);
      if (room.users.length === 0) {
        rooms.delete(roomId);
      }
    }

    socket.data.roomId = null;
    socket.data.username = null;
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    rooms: rooms.size,
    connections: io.engine.clientsCount,
  });
});

app.get('/room/:id', (req, res) => {
  const room = rooms.get(req.params.id);
  if (room) {
    res.json({ exists: true, users: room.users.length });
  } else {
    res.json({ exists: false });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`signaling server running on port ${PORT}`);
});
