// server.js
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");
const os = require("os");
const qrcode = require("qrcode-terminal");

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

io.on("connection", (socket) => {
    // 1. รับภาพ
    socket.on("stream_data", (image) => {
        socket.broadcast.emit("stream_data", image);
    });

    // 2. รับเสียง (เพิ่มส่วนนี้)
    socket.on("stream_audio", (audioData) => {
        socket.broadcast.emit("stream_audio", audioData);
    });
});

http.listen(port, () => {
    const ips = getLocalIpAddresses();
    const mainIp = ips.length > 0 ? ips[0] : null;

    console.log("\n==================================================");
    console.log("🚀 Web Screen & Audio Share Running!");
    console.log(`\n💻 Host (คนแชร์): http://localhost:${port}/host.html`);
    
    if(mainIp) {
        const url = `http://${mainIp}:${port}`;
        console.log(`📱 Viewer (คนดู): ${url}`);
        qrcode.generate(url, { small: true });
    }
    console.log("==================================================\n");
});