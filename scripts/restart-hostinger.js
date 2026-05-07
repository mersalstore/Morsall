const { Client } = require("ssh2");

const conn = new Client();

conn
  .on("ready", () => {
    const restartCommand =
      "cd /home/u754458241/domains/morsall.com/nodejs && pkill -f 'server-hostinger.js|server.js' || true; nohup npm run start:hostinger > app.log 2>&1 < /dev/null &";

    conn.exec(restartCommand, (err, stream) => {
      if (err) {
        console.error("Failed to run restart command:", err);
        conn.end();
        process.exit(1);
        return;
      }

      stream
        .on("close", (code) => {
          console.log("Restart command sent. Exit code:", code);
          conn.end();
        })
        .on("data", (data) => process.stdout.write(data))
        .stderr.on("data", (data) => process.stderr.write(data));
    });
  })
  .on("error", (err) => {
    console.error("SSH connection error:", err);
    process.exit(1);
  })
  .connect({
    host: "82.198.228.182",
    port: 65002,
    username: "u754458241",
    password: "Code_2252",
    readyTimeout: 20000,
  });
