global.env = process.env.WHATSAPP_ENV || "development";

import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

import UserDao from './dao/user.js';
import { createUsers, loginUser, updateUser } from './controllers/users.js';
import { addMemberToGroup, createGroup, createMessage, getGroupData } from './controllers/groups.js';
import { ADMIN_RESTRICTED_PATHS, JWT_SECRET_KEY } from './constants.js';

import http from 'http';
import {Server as SocketServer} from 'socket.io';

import { WebSocketServer } from 'ws';
const app = express();
const port = 3000;
const server = http.createServer(app);
const ws = new WebSocketServer({server});


ws.on('connection',(socket) => {
  console.log('Someone connected!')

  socket.on('message', function message(data) {
    // data format - groupid_username_message
    console.log('received: %s', data);
    const [groupId, userName, message] = data.toString().split('_');
    createMessage(groupId, userName, message);
    ws.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === 1) {
        client.send(message);
      }
    });
  });
});

app.use(bodyParser.json());



// Authentication middleware
async function authenticateUserMiddleware(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Authorization required' });
  }

  
  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    const userDao = new UserDao();
    const user = await userDao.findByUserName(decoded.username);
    
    const isAdminPath = ADMIN_RESTRICTED_PATHS.some(
      (restrictedPath) =>
        req.path === restrictedPath.path && req.method === restrictedPath.method
    );

    if (isAdminPath && !user.is_admin){
      res.status(401).json("Access Denied!")
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message || 'Invalid token' });
  }
}

app.post('/login', loginUser);
app.post('/users', authenticateUserMiddleware, createUsers);
app.put('/users/:username', authenticateUserMiddleware, updateUser);

app.post('/groups', authenticateUserMiddleware, createGroup);
app.post('/groups/:groupId/addMember', authenticateUserMiddleware, addMemberToGroup);
app.get('/users/:username/getGroupData', authenticateUserMiddleware, getGroupData);

app.get('/ping', (req, res) => res.send("pong"))

// io.listen(3000);
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});