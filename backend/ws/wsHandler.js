const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');

function initWebSocket(server) {
  const wss = new WebSocketServer({ 
    server,
    handleProtocols: (protocols) => {
      const token = Array.from(protocols)[0];
      return token || false; 
    }
  });

  wss.on('connection', (ws) => {
    const token = ws.protocol;

    if (!token) {
      console.log('[WS] Rejected: No token provided in protocols');
      ws.close(4001, 'Unauthorized');
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = decoded.id;
      ws.username = decoded.username;
      
      console.log(`[WS] User "${ws.username}" connected securely ✅`);

      ws.on('error', console.error);
      ws.on('close', () => console.log(`[WS] User "${ws.username}" disconnected`));

    } catch (err) {
      console.log('[WS] Rejected: Invalid JWT');
      ws.close(4001, 'Invalid token');
    }
  });

  console.log('[WS] WebSocket engine initialized');
  return wss;
}

module.exports = initWebSocket;