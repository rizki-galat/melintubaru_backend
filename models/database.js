const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db');

db.serialize(() => {
  // Buat tabel jika belum ada
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    foto TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT NOT NULL,
    totalPrice REAL NOT NULL,
    orderDate TEXT NOT NULL,
    status TEXT NOT NULL,
    fotoProdukURL TEXT,
    fotoProgressURL TEXT,
    productName TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    videoProgressURL TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orderItems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER NOT NULL,
    productName TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    fotoProduk TEXT,
    fotoProgress TEXT,
    FOREIGN KEY (orderId) REFERENCES orders(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS order_progress_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER NOT NULL,
    oldFotoProgressURL TEXT,
    newFotoProgressURL TEXT,
    status TEXT,
    updateDate TEXT NOT NULL,
    FOREIGN KEY (orderId) REFERENCES orders(id)
  )`);
});


module.exports = db;
