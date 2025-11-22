require("dotenv").config();
const express = require("express");
const Remootio = require("remootio-api-client");

const REMOOTIO_HOST = process.env.REMOOTIO_HOST;
const REMOOTIO_SECRET = process.env.REMOOTIO_SECRET;
const REMOOTIO_AUTH = process.env.REMOOTIO_AUTH;
const PORT = process.env.PORT || 3000;

if (!REMOOTIO_HOST || !REMOOTIO_SECRET || !REMOOTIO_AUTH) {
  console.error("Missing env vars REMOOTIO_HOST / REMOOTIO_SECRET / REMOOTIO_AUTH");
  process.exit(1);
}

const app = express();
app.use(express.json());

let state = "unknown";
let connected = false;
let authenticated = false;

const gate = new Remootio(REMOOTIO_HOST, REMOOTIO_SECRET, REMOOTIO_AUTH);

gate.on("connected", () => {
  connected = true;
  console.log("Connected to Remootio, authenticating...");
  gate.authenticate();
});

gate.on("authenticated", () => {
  authenticated = true;
  console.log("Authenticated, querying current state...");
  gate.sendQuery();
});

gate.on("disconnect", () => {
  connected = false;
  authenticated = false;
  console.log("Disconnected from Remootio");
});

gate.on("incomingmessage", (frame, payload) => {
  if (!payload) return;

  if (payload.response && payload.response.state) {
    state = payload.response.state;
    console.log("State (response):", state);
  }

  if (payload.event && payload.event.type === "StateChange") {
    state = payload.event.state;
    console.log("State (event):", state);
  }
});

gate.connect(true);

// HTTP API

app.get("/state", (_req, res) => {
  res.json({ state, connected, authenticated });
});

function ensureAuth(res) {
  if (!authenticated) {
    res.status(503).json({ error: "not_authenticated" });
    return false;
  }
  return true;
}

app.post("/open", (_req, res) => {
  if (!ensureAuth(res)) return;
  gate.sendOpen();
  res.json({ ok: true, action: "open" });
});

app.post("/close", (_req, res) => {
  if (!ensureAuth(res)) return;
  gate.sendClose();
  res.json({ ok: true, action: "close" });
});

app.post("/trigger", (_req, res) => {
  if (!ensureAuth(res)) return;
  gate.sendTrigger();
  res.json({ ok: true, action: "trigger" });
});

app.listen(PORT, () => {
  console.log(`Remootio bridge listening on port ${PORT}`);
});
