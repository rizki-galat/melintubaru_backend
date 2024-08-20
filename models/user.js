const db = require('./database');

const createUser = (user, callback) => {
  const { email, password, role, foto } = user;
  db.run(
    `INSERT INTO users (email, password, role, foto) VALUES (?, ?, ?, ?)`,
    [email, password, role, foto],
    function(err) {
      if (err) {
        return callback(err);
      }
      callback(null, { id: this.lastID, ...user });
    }
  );
};


const getUserByEmail = (email, callback) => {
  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [email],
    (err, row) => {
      if (err) {
        return callback(err);
      }
      callback(null, row);
    }
  );
};

const getAllUsers = (callback) => {
  db.all(`SELECT * FROM users`, (err, rows) => {
    if (err) {
      return callback(err);
    }
    callback(null, rows);
  });
};

const deleteUser = (id, callback) => {
  db.run(
    `DELETE FROM users WHERE id = ?`,
    [id],
    function(err) {
      if (err) {
        return callback(err);
      }
      callback(null, { deletedRows: this.changes });
    }
  );
};

const login = (email, password, callback) => {
  getUserByEmail(email, (err, user) => {
    if (err) {
      return callback(err);
    }
    if (!user) {
      return callback(null, { success: false, message: 'Email atau password salah.' });
    }
    if (user.password === password) {
      callback(null, {
        success: true,
        id: user.id,
        email: user.email,
        password: user.password,
        role: user.role,
        foto: user.foto
      });
    } else {
      callback(null, { success: false, message: 'Email atau password salah.' });
    }
  });
};
const getUserById = (id, callback) => {
  db.get(
    `SELECT * FROM users WHERE id = ?`,
    [id],
    (err, row) => {
      if (err) {
        return callback(err);
      }
      callback(null, row);
    }
  );
};



module.exports = { createUser, getUserByEmail, getAllUsers, deleteUser, login, getUserById };
