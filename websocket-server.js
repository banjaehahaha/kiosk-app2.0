const WebSocket = require('ws');
const http = require('http');

// HTTP 서버 생성
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// 연결된 클라이언트들을 저장
const clients = new Set();

console.log('🌍 글로벌 배송 트래커 WebSocket 서버 시작...');

// WebSocket 연결 처리
wss.on('connection', (ws, req) => {
  console.log('새로운 클라이언트 연결됨:', req.socket.remoteAddress);
  
  // 클라이언트 추가
  clients.add(ws);
  
  // 연결 상태 메시지 전송
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'WebSocket 연결됨',
    timestamp: new Date().toISOString()
  }));

  // 클라이언트로부터 메시지 수신
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('클라이언트로부터 메시지 수신:', data);
      
      // 메시지 타입에 따른 처리
      switch (data.type) {
        case 'ping':
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString()
          }));
          break;
          
        default:
          console.log('알 수 없는 메시지 타입:', data.type);
      }
    } catch (error) {
      console.error('메시지 파싱 오류:', error);
    }
  });

  // 연결 종료 처리
  ws.on('close', () => {
    console.log('클라이언트 연결 종료:', req.socket.remoteAddress);
    clients.delete(ws);
  });

  // 오류 처리
  ws.on('error', (error) => {
    console.error('WebSocket 오류:', error);
    clients.delete(ws);
  });
});

// 모든 클라이언트에게 메시지 브로드캐스트
function broadcast(message) {
  const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
  
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(messageStr);
      } catch (error) {
        console.error('클라이언트에게 메시지 전송 실패:', error);
      }
    }
  });
}

// 결제 알림 전송 함수
function sendPaymentNotification(paymentData) {
  const notification = {
    type: 'payment',
    payment: paymentData,
    timestamp: new Date().toISOString()
  };
  
  console.log('결제 알림 전송:', notification);
  broadcast(notification);
}

// HTTP POST 요청으로 결제 알림 받기
server.on('request', (req, res) => {
  if (req.method === 'POST' && req.url === '/api/payment-notification') {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const paymentData = JSON.parse(body);
        console.log('결제 알림 수신:', paymentData);
        
        // WebSocket으로 연결된 모든 클라이언트에게 알림 전송
        sendPaymentNotification(paymentData);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: '결제 알림이 전송되었습니다.',
          clientsCount: clients.size
        }));
      } catch (error) {
        console.error('결제 알림 처리 오류:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: '잘못된 요청입니다.'
        }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/status') {
    // 서버 상태 확인
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'running',
      timestamp: new Date().toISOString(),
      connectedClients: clients.size,
      uptime: process.uptime()
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// 서버 시작
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📡 WebSocket URL: ws://localhost:${PORT}`);
  console.log(`🌐 HTTP API: http://localhost:${PORT}/api/payment-notification`);
  console.log(`📊 상태 확인: http://localhost:${PORT}/status`);
});

// 정상 종료 처리
process.on('SIGINT', () => {
  console.log('\n🛑 서버 종료 중...');
  
  // 모든 클라이언트 연결 종료
  clients.forEach((client) => {
    client.close();
  });
  
  server.close(() => {
    console.log('✅ 서버가 정상적으로 종료되었습니다.');
    process.exit(0);
  });
});

// 테스트용 결제 알림 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  console.log('🧪 개발 모드: 테스트 결제 알림이 10초 후 자동으로 전송됩니다.');
  
  setTimeout(() => {
    const testPayment = {
      propId: 1,
      propName: 'North Korean Army Badge',
      fromCity: 'Charleston',
      fromCountry: 'United States',
      amount: 45000
    };
    
    sendPaymentNotification(testPayment);
  }, 10000);
}

