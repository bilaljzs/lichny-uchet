const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const { mainDb, getUserDb } = require("./db");
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

  const existing = mainDb.prepare("SELECT * FROM users WHERE login = ?").get(login);

  if (existing) {
    const ok = await bcrypt.compare(password, existing.password_hash);
    if (!ok) return res.status(401).json({ error: "Неверный пароль для этого логина" });
    getUserDb(existing.id); // ensure the user's isolated database file exists
    return res.json({ token: signToken(existing), login: existing.login, isNew: false });
  }

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 12);
  mainDb
    .prepare("INSERT INTO users (id, login, password_hash, created_at) VALUES (?, ?, ?, ?)")
    .run(id, login, passwordHash, Date.now());
  getUserDb(id); // create this login's own isolated database file
  const user = { id, login };
  return res.json({ token: signToken(user), login, isNew: true });
});

/* ---------- State: full read/write of this login's isolated database ---------- */
app.get("/api/state", requireAuth, (req, res) => {
  const db = getUserDb(req.userId);

  const subjectRows = db.prepare("SELECT * FROM subjects ORDER BY position ASC").all();
  const accountRows = db.prepare("SELECT * FROM accounts ORDER BY position ASC").all();
  const transactionRows = db.prepare("SELECT * FROM transactions ORDER BY position ASC").all();
  const archiveRows = db.prepare("SELECT * FROM archive ORDER BY position ASC").all();

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

  res.json({ subjects, transactions, archive });
});

app.put("/api/state", requireAuth, (req, res) => {
  const { subjects = [], transactions = [], archive = [] } = req.body || {};
  const db = getUserDb(req.userId);

  const save = db.transaction(() => {
    db.prepare("DELETE FROM accounts").run();
    db.prepare("DELETE FROM subjects").run();
    db.prepare("DELETE FROM transactions").run();
    db.prepare("DELETE FROM archive").run();

    const insertSubject = db.prepare(
      "INSERT INTO subjects (id, name, phone, note, position) VALUES (?, ?, ?, ?, ?)"
    );
    const insertAccount = db.prepare(
      "INSERT INTO accounts (id, subject_id, bank, balance, card_id, phone, status, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    subjects.forEach((s, si) => {
      insertSubject.run(s.id, s.name, s.phone || "", s.note || "", si);
      (s.accounts || []).forEach((a, ai) => {
        insertAccount.run(a.id, s.id, a.bank, Number(a.balance) || 0, a.cardId || "", a.phone || "", a.status || "РАБОЧИЙ", ai);
      });
    });

    const insertTx = db.prepare("INSERT INTO transactions (id, label, delta, time, position) VALUES (?, ?, ?, ?, ?)");
    transactions.forEach((t, i) => insertTx.run(t.id, t.label, Number(t.delta) || 0, t.time, i));

    const insertArchive = db.prepare(
      "INSERT INTO archive (id, amount, buy, sell, result, time, position) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    archive.forEach((a, i) => insertArchive.run(a.id, a.amount, a.buy, a.sell, a.result, a.time, i));
  });

  try {
    save();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Не удалось сохранить изменения" });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Finance tracker API listening on port ${PORT}`);
});
