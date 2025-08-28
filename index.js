const { createServer } = require("http");
const express = require("express");
const next = require("next");
const { initSocketIO } = require("./libs/socket");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  expressApp.use(express.static("public"));

  const httpServer = createServer(expressApp);
  initSocketIO(httpServer);

  expressApp.all(/(.*)/, (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
