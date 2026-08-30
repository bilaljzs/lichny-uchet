const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { withClient, withTransaction } = require("./db");
const { signToken, requireAuth } = require("./auth");

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

const PORT = process.env.PORT || 4000;

function normalizeLogin(login) {
  return String(login || "").trim().toLowerCase();
}

/* ---------- Auth: auto-registers a login on first use, otherwise verifies password ---------- */
app.post("/api/auth/login", async (req, res) => {
  const login = normalizeLogin(req.body.login);
  const password = String(req.body.password || "");
  if (!login || !password) {
    return res.status(400).json({ error: "Введите логин и пароль" });
  }

  try {
    const existing = await withClient((client) =>
      client.query("SELECT * FROM users WHERE login = $1", [login]).then((r) => r.rows[0])
    );

    if (existing) {
      const ok = await bcrypt.compare(password, existing.password_hash);
      if (!ok) return res.status(401).json({ error: "Неверный пароль для этого логина" });
      return res.json({ token: signToken(existing), login: existing.login, isNew: false });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await withClient((client) =>
      client
        .query(
          "INSERT INTO users (login, password_hash) VALUES ($1, $2) RETURNING id, login",
          [login, passwordHash]
        )
        .then((r) => r.rows[0])
    );
    return res.json({ token: signToken(user), login: user.login, isNew: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера при входе" });
  }
});

/* ---------- State: full read/write of this login's data, always scoped by user_id ---------- */
app.get("/api/state", requireAuth, async (req, res) => {
  try {
    const state = await withClient(async (client) => {
      const subjectRows = (await client.query("SELECT * FROM subjects WHERE user_id = $1 ORDER BY position ASC", [req.userId])).rows;
      const accountRows = (await client.query("SELECT * FROM accounts WHERE user_id = $1 ORDER BY position ASC", [req.userId])).rows;
      const transactionRows = (await client.query("SELECT * FROM transactions WHERE user_id = $1 ORDER BY position ASC", [req.userId])).rows;
      const archiveRows = (await client.query("SELECT * FROM archive WHERE user_id = $1 ORDER BY position ASC", [req.userId])).rows;

      const subjects = subjectRows.map((s) => ({
        id: s.id,
        name: s.name,
        phone: s.phone,
        note: s.note,
        accounts: accountRows
          .filter((a) => a.subject_id === s.id)
          .map((a) => ({
            id: a.id,
            bank: a.bank,
            balance: a.balance,
            cardId: a.card_id,
            phone: a.phone,
            status: a.status,
          })),
      }));

      const transactions = transactionRows.map((t) => ({ id: t.id, label: t.label, delta: t.delta, time: t.time }));
      const archive = archiveRows.map((a) => ({
        id: a.id,
        amount: a.amount,
        buy: a.buy,
        sell: a.sell,
        result: a.result,
        time: a.time,
      }));

      return { subjects, transactions, archive };
    });

    res.json(state);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Не удалось загрузить данные" });
  }
});

app.put("/api/state", requireAuth, async (req, res) => {
  const { subjects = [], transactions = [], archive = [] } = req.body || {};

  try {
    await withTransaction(async (client) => {
      await client.query("DELETE FROM accounts WHERE user_id = $1", [req.userId]);
      await client.query("DELETE FROM subjects WHERE user_id = $1", [req.userId]);
      await client.query("DELETE FROM transactions WHERE user_id = $1", [req.userId]);
      await client.query("DELETE FROM archive WHERE user_id = $1", [req.userId]);

      for (let si = 0; si < subjects.length; si++) {
        const s = subjects[si];
        await client.query(
          "INSERT INTO subjects (id, user_id, name, phone, note, position) VALUES ($1, $2, $3, $4, $5, $6)",
          [s.id, req.userId, s.name, s.phone || "", s.note || "", si]
        );
        const accounts = s.accounts || [];
        for (let ai = 0; ai < accounts.length; ai++) {
          const a = accounts[ai];
          await client.query(
            "INSERT INTO accounts (id, user_id, subject_id, bank, balance, card_id, phone, status, position) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
            [a.id, req.userId, s.id, a.bank, Number(a.balance) || 0, a.cardId || "", a.phone || "", a.status || "РАБОЧИЙ", ai]
          );
        }
      }

      for (let i = 0; i < transactions.length; i++) {
        const t = transactions[i];
        await client.query(
          "INSERT INTO transactions (id, user_id, label, delta, time, position) VALUES ($1, $2, $3, $4, $5, $6)",
          [t.id, req.userId, t.label, Number(t.delta) || 0, t.time, i]
        );
      }

      for (let i = 0; i < archive.length; i++) {
        const a = archive[i];
        await client.query(
          "INSERT INTO archive (id, user_id, amount, buy, sell, result, time, position) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          [a.id, req.userId, a.amount, a.buy, a.sell, a.result, a.time, i]
        );
      }
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Не удалось сохранить изменения" });
  }
});

/* ---------- Purchase rate range: USDT/RUB from Rapira, marked up by fixed coefficients ---------- */
const LOW_COEF = 1.006;
const HIGH_COEF = 1.008;
const RAPIRA_RATES_URL = "https://api.rapira.net/open/market/rates";

function normalizeSymbol(s) {
  return String(s || "").toUpperCase().replace(/[^A-Z]/g, "");
}

function roundTo1(n) {
  return Math.round(n * 10) / 10;
}

app.get("/api/rate", requireAuth, async (_req, res) => {
  try {
    const upstream = await fetch(RAPIRA_RATES_URL);
    if (!upstream.ok) throw new Error(`Rapira responded with ${upstream.status}`);
    const payload = await upstream.json();
    const rows = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
      ? payload.data
      : Object.values(payload || {});

    const entry = rows.find((r) => normalizeSymbol(r?.symbol ?? r?.pair ?? r?.name) === "USDTRUB");
    if (!entry) throw new Error("USDT/RUB pair not found in Rapira response");

    const rapiraRate = Number(entry.close);
    if (!Number.isFinite(rapiraRate)) throw new Error("Rapira close price is not a number");

    const localLow = roundTo1(rapiraRate * LOW_COEF);
    const localHigh = roundTo1(rapiraRate * HIGH_COEF);
    res.json({ rapiraRate, localLow, localHigh });
  } catch (err) {
    console.error("Failed to fetch purchase rate:", err);
    res.status(502).json({ error: "Не удалось получить курс" });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// In production, serve the built React app from the same service as the API.
const clientDist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Finance tracker API listening on port ${PORT}`);
});
