const db = require('./database');

const createOrder = (order, callback) => {
  const { customerName, totalPrice, orderDate, status, fotoProdukURL, fotoProgressURL, productName, quantity, price, videoProgressURL, items } = order;
  const orderDateIso = new Date(orderDate).toISOString();

  console.log('Order Date:', orderDate);

  db.run(
    `INSERT INTO orders (customerName, totalPrice, orderDate, status, fotoProdukURL, fotoProgressURL, productName, quantity, price, videoProgressURL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [customerName, totalPrice, orderDateIso, status, fotoProdukURL, fotoProgressURL, productName, quantity, price, videoProgressURL],
    function(err) {
      if (err) {
        return callback(err);
      }
      
      const orderId = this.lastID;
      const itemInsertions = items.map(item => createOrderItem({ ...item, orderId }));
      
      Promise.all(itemInsertions)
        .then(results => {
          callback(null, { id: orderId, ...order });
        })
        .catch(err => {
          callback(err);
        });
    }
  );
};

const createOrderItem = (item) => {
  const { orderId, productName, quantity, price, fotoProduk, fotoProgress } = item;
  
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO orderItems (orderId, productName, quantity, price, fotoProduk, fotoProgress) VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, productName, quantity, price, fotoProduk, fotoProgress],
      function(err) {
        if (err) {
          return reject(err);
        }
        resolve({ id: this.lastID, ...item });
      }
    );
  });
};

const getOrderById = (id, callback) => {
  db.get(
    `SELECT * FROM orders WHERE id = ?`,
    [id],
    (err, row) => {
      if (err) {
        return callback(err);
      }
      callback(null, row);
    }
  );
};

const getAllOrders = (callback) => {
  db.all(`SELECT * FROM orders`, (err, rows) => {
    if (err) {
      return callback(err);
    }
    callback(null, rows);
  });
};


const deleteOrder = (id, callback) => {
  console.log('checkla', id)
  db.run(
    `DELETE FROM orders WHERE id = ?`,
    [id],
    function(err) {
      if (err) {
        return callback(err);
      }
      callback(null, { deletedRows: this.changes });
    }
  );
};
const updateOrder = (order, callback) => {
  const { id, customerName, totalPrice, orderDate, status, fotoProdukURL, fotoProgressURL, productName, quantity, price, videoProgressURL, items } = order;
  const orderDateIso = orderDate ? new Date(orderDate).toISOString() : '';
  
  db.get(`SELECT * FROM orders WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return callback(err);
    }

    // Tetapkan nilai default jika field fotoProdukURL dan videoProgressURL tidak valid atau tidak berubah
    const updateFoto = (fotoProdukURL !== null && fotoProdukURL !== undefined && fotoProdukURL !== '' && fotoProdukURL !== row.fotoProdukURL) ? fotoProdukURL : row.fotoProdukURL;
    const updateVideo = (videoProgressURL !== null && videoProgressURL !== undefined && videoProgressURL !== '' && videoProgressURL !== row.videoProgressURL) ? videoProgressURL : row.videoProgressURL;

    db.run(
      `UPDATE orders 
       SET customerName = ?, 
           totalPrice = ?, 
           orderDate = ?, 
           status = ?, 
           fotoProdukURL = ?, 
           fotoProgressURL = ?, 
           productName = ?, 
           quantity = ?, 
           price = ?, 
           videoProgressURL = ? 
       WHERE id = ?`,
      [customerName, totalPrice, orderDateIso, status, updateFoto, fotoProgressURL, productName, quantity, price, updateVideo, id],
      function(err) {
        if (err) {
          return callback(err);
        }

        // Hapus dan masukkan kembali items terkait
        deleteOrderItemsByOrderId(id)
          .then(() => {
            const itemInsertions = items.map(item => createOrderItem({ ...item, orderId: id }));
            return Promise.all(itemInsertions);
          })
          .then(results => {
            callback(null, { updatedRows: this.changes });
          })
          .catch(err => {
            callback(err);
          });
      }
    );
  });
};


const deleteOrderItemsByOrderId = (orderId) => {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM orderItems WHERE orderId = ?`,
      [orderId],
      function(err) {
        if (err) {
          return reject(err);
        }
        resolve();
      }
    );
  });
};

const getOrderItemsByOrderId = (orderId, callback) => {
  db.all(
    `SELECT * FROM orderItems WHERE orderId = ?`,
    [orderId],
    (err, rows) => {
      if (err) {
        return callback(err);
      }
      callback(null, rows);
    }
  );
};

const updateFotoProgress = (orderId, newFotoProgressURL, status, callback) => {
  db.get(`SELECT fotoProgressURL FROM orders WHERE id = ?`, [orderId], (err, row) => {
    if (err) {
      return callback(err);
    }

    const oldFotoProgressURL = row ? row.fotoProgressURL : '';
    const updateDate = new Date()
    console.log('checkmasuk gak sih ke neweFotoProgressURL',newFotoProgressURL )
    console.log('cek tanggal yang masuk',updateDate)

    db.run(
      `UPDATE orders SET fotoProgressURL = ?, status = ? WHERE id = ?`,
      [newFotoProgressURL, status, orderId],
      function(err) {
        if (err) {
          return callback(err);
        }
        // Log the details being inserted into order_progress_history
        console.log('Inserting into order_progress_history:', {
          orderId,
          oldFotoProgressURL,
          newFotoProgressURL,
          status,
          updateDate
        });
         
        db.run(
          `INSERT INTO order_progress_history (orderId, oldFotoProgressURL, newFotoProgressURL, status, updateDate) VALUES (?, ?, ?, ?, ?)`,
          [orderId, oldFotoProgressURL, newFotoProgressURL, status, updateDate],
          function(err) {
            if (err) {
              return callback(err);
            }
            callback(null, { updatedRows: this.changes });
          }
        );
      }
    );
  });
};

const updateFoto = (orderId, newFotoProduct, status, callback) => {
  db.get(`SELECT fotoProdukURL FROM orders WHERE id = ?`, [orderId], (err, row) => {
    if (err) {
      return callback(err);
    }
    console.log('checkmasuk gak sih ke neweFotoProdukURL',newFotoProduct )
    db.run(
      `UPDATE orders SET fotoProdukURL = ? WHERE id = ?`,
      [newFotoProduct, orderId],
      function(err) {
        if (err) {
          return callback(err);
        }
        callback(null, { updatedRows: this.changes });
      }
    );
  });
};
const updateVideo = (orderId, videoProgressURL, status, callback) => {
  db.get(`SELECT videoProgressURL FROM orders WHERE id = ?`, [orderId], (err, row) => {
    if (err) {
      return callback(err);
    }
    console.log('checkmasuk gak sih ke videoProgressURL',videoProgressURL )
    db.run(
      `UPDATE orders SET videoProgressURL = ? WHERE id = ?`,
      [videoProgressURL, orderId],
      function(err) {
        if (err) {
          return callback(err);
        }
        callback(null, { updatedRows: this.changes });
      }
    );
  });
};

const getFotoProgressHistory = (orderId, callback) => {
  db.all(
    `SELECT * FROM order_progress_history WHERE orderId = ?`,
    [orderId],
    (err, rows) => {
      if (err) {
        return callback(err);
      }
      
      // Log updateDate untuk setiap catatan
      rows.forEach(row => {
        console.log('Update Date for orderId', orderId, ':', row.updateDate);
      });

      callback(null, rows);
    }
  );
};

const getVideoUrl = (orderId, callback) => {
  db.all(
    `SELECT * FROM orders WHERE orderId = ?`,
    [orderId],
    (err, rows) => {
      if (err) {
        return callback(err);
      }
      callback(null, rows);
    }
  );
};


const getOrdersByEmail = (email, callback) => {
  db.all(
    `SELECT * FROM orders WHERE customerName = ?`,
    [email],
    (err, rows) => {
      if (err) {
        return callback(err);
      }
      callback(null, rows);
    }
  );
};


module.exports = {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrder,
  deleteOrder,
  createOrderItem,
  getOrderItemsByOrderId,
  updateFotoProgress,
  getFotoProgressHistory,
  getVideoUrl,
  getOrdersByEmail,
  updateFoto,
  updateVideo
};

