const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  
  // Handle root redirect
  if (reqUrl === '/' || reqUrl === '/index.html') {
    res.writeHead(302, { 'Location': '/bandding/index.html' });
    res.end();
    return;
  }
  
  if (reqUrl === '/bandding') {
    res.writeHead(302, { 'Location': '/bandding/' });
    res.end();
    return;
  }
  
  // Strip '/bandding/' prefix to find local file path
  let relativePath = reqUrl;
  if (reqUrl.startsWith('/bandding/')) {
    relativePath = reqUrl.substring('/bandding/'.length);
  }
  
  // Default to index.html if directory
  if (relativePath === '' || relativePath === '/') {
    relativePath = 'index.html';
  }
  
  const filePath = path.join(__dirname, relativePath);
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + reqUrl);
      return;
    }
    
    // Serve file
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

// ===== TELEGRAM INTEGRATION LONG-POLLING DAEMON =====
const configPath = path.join(__dirname, 'js', 'config.js');
let supabaseUrl = '';
let supabaseKey = '';
let telegramBotToken = '';
let telegramChatId = '';

try {
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const urlMatch = configContent.match(/const\s+SUPABASE_URL\s*=\s*['"]([^'"]+)['"]/);
    const keyMatch = configContent.match(/const\s+SUPABASE_KEY\s*=\s*['"]([^'"]+)['"]/);
    const tokenMatch = configContent.match(/const\s+TELEGRAM_BOT_TOKEN\s*=\s*['"]([^'"]*)['"]/);
    const chatIdMatch = configContent.match(/const\s+TELEGRAM_CHAT_ID\s*=\s*['"]([^'"]*)['"]/);
    
    if (urlMatch) supabaseUrl = urlMatch[1];
    if (keyMatch) supabaseKey = keyMatch[1];
    if (tokenMatch) telegramBotToken = tokenMatch[1];
    if (chatIdMatch) telegramChatId = chatIdMatch[1];
    
    console.log(`[Telegram Daemon] Loaded configs. Bot Token: ${telegramBotToken ? '***' : 'NONE'}, Chat ID: ${telegramChatId || 'NONE'}`);
  }
} catch (e) {
  console.error("[Telegram Daemon] Failed to read config:", e);
}

let tgOffset = 0;

async function pollTelegramUpdates() {
  if (!telegramBotToken || !telegramChatId || !supabaseUrl || !supabaseKey) {
    // If not configured, wait 10s and check again
    setTimeout(pollTelegramUpdates, 10000);
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getUpdates?offset=${tgOffset}&timeout=20`);
    if (!res.ok) throw new Error(`Telegram API returned ${res.status}`);
    const data = await res.json();

    if (data.ok && data.result) {
      for (const update of data.result) {
        tgOffset = update.update_id + 1;

        const msg = update.message;
        if (msg && msg.chat && msg.chat.id.toString() === telegramChatId.toString()) {
          const threadId = msg.message_thread_id;
          if (!threadId) continue;
          
          // Ignore bot messages
          if (msg.from && msg.from.is_bot) continue;

          let text = msg.text;
          let msgType = 'text';

          // Handle incoming photos/videos from Telegram
          if (msg.photo) {
            const photo = msg.photo[msg.photo.length - 1]; // Highest resolution
            const fileId = photo.file_id;
            try {
              const fileRes = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getFile?file_id=${fileId}`);
              const fileData = await fileRes.json();
              if (fileData.ok && fileData.result) {
                text = `https://api.telegram.org/file/bot${telegramBotToken}/${fileData.result.file_path}`;
                msgType = 'image';
              }
            } catch (err) {
              console.error("[Telegram Daemon] Failed to get photo file path:", err);
            }
          } else if (msg.video) {
            const fileId = msg.video.file_id;
            try {
              const fileRes = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getFile?file_id=${fileId}`);
              const fileData = await fileRes.json();
              if (fileData.ok && fileData.result) {
                text = `https://api.telegram.org/file/bot${telegramBotToken}/${fileData.result.file_path}`;
                msgType = 'video';
              }
            } catch (err) {
              console.error("[Telegram Daemon] Failed to get video file path:", err);
            }
          }

          if (text) {
            // 1. Fetch chat room matching the threadId using Supabase REST API
            const roomUrl = `${supabaseUrl}/rest/v1/chat_rooms?telegram_thread_id=eq.${threadId}&select=id,seller_id,buyer_id`;
            const roomRes = await fetch(roomUrl, {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
              }
            });
            
            if (roomRes.ok) {
              const rooms = await roomRes.json();
              if (rooms && rooms.length > 0) {
                const room = rooms[0];

                // 2. Check if this telegram message was already processed
                const checkUrl = `${supabaseUrl}/rest/v1/chat_messages?telegram_msg_id=eq.${msg.message_id}&select=id`;
                const checkRes = await fetch(checkUrl, {
                  headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                  }
                });
                
                if (checkRes.ok) {
                  const checkedMsgs = await checkRes.json();
                  if (checkedMsgs && checkedMsgs.length > 0) {
                    // Already processed, skip
                    continue;
                  }
                }

                // 3. Insert reply into Supabase
                const insertUrl = `${supabaseUrl}/rest/v1/chat_messages`;
                const insertRes = await fetch(insertUrl, {
                  method: 'POST',
                  headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                  },
                  body: JSON.stringify({
                    room_id: room.id,
                    sender_id: room.seller_id, // Admin replies represent the seller
                    message: text,
                    message_type: msgType,
                    telegram_msg_id: msg.message_id.toString()
                  })
                });

                if (insertRes.ok) {
                  // 4. Update room updated_at timestamp to bubble it to top
                  const updateRoomUrl = `${supabaseUrl}/rest/v1/chat_rooms?id=eq.${room.id}`;
                  await fetch(updateRoomUrl, {
                    method: 'PATCH',
                    headers: {
                      'apikey': supabaseKey,
                      'Authorization': `Bearer ${supabaseKey}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      updated_at: new Date().toISOString()
                    })
                  });
                  console.log(`[Telegram Daemon] Synced message (${msgType}) from Telegram Thread ${threadId} to Supabase room ${room.id}`);
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("[Telegram Daemon] Error polling Updates:", err.message);
  }

  // Continue long polling
  setTimeout(pollTelegramUpdates, 1500);
}

// Start the daemon loop
setTimeout(pollTelegramUpdates, 2000);

server.listen(PORT, () => {
  console.log(`\n🚀 Bandding Market Local Server is running!`);
  console.log(`👉 http://localhost:${PORT}/bandding/index.html\n`);
  console.log(`Press Ctrl+C to stop the server.`);
});
