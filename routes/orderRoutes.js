const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const upload = multer({ dest: path.join(__dirname, '../temp-uploads/') });

const {
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
  
} = require('../models/order');

router.post('/orders', (req, res) => {
  const order = req.body;
  createOrder(order, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(result);
  });
});

router.get('/orders', (req, res) => {
  getAllOrders((err, orders) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(orders);
  });
});

router.get('/orders/:id', (req, res) => {
  const { id } = req.params;
  getOrderById(id, (err, order) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  });
});

router.put('/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = req.body;
  updateOrder({ ...order, id }, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.updatedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order updated successfully' });
  });
});

router.delete('/orders/:id', (req, res) => {
  const { id } = req.params;
  deleteOrder(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.deletedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).send();
  });
});

router.post('/orders/:id/items', (req, res) => {
  const item = { ...req.body, orderId: req.params.id };
  createOrderItem(item, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(result);
  });
});

router.get('/orders/:id/items', (req, res) => {
  const { id } = req.params;
  getOrderItemsByOrderId(id, (err, items) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(items);
  });
});

router.put('/orders/:id/progress', (req, res) => {
  const { id } = req.params;
  const { fotoProgressURL, status } = req.body;
  console.log(fotoProgressURL)
  updateFotoProgress(id, fotoProgressURL, status, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(result);
  });
});

router.put('/orders/:id/fotoproduct', (req, res) => {
  const { id } = req.params;
  const { foto,video } = req.body;
  console.log(foto,video)
  updateFoto(id,foto, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(result);
  });
});
router.put('/orders/:id/videoproduct', (req, res) => {
  const { id } = req.params;
  const { foto,video } = req.body;
  console.log(foto,video)
  updateVideo(id,video, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(result);
  });
});


router.get('/orders/:id/progress', (req, res) => {
  const { id } = req.params;
  getFotoProgressHistory(id, (err, history) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(history);
  });
});

router.get('/orders/:id', (req, res) => {
  const { id } = req.params;
  getVideoUrl(id, (err, history) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(progressVideoUrl);
  });
});

router.get('/orders/email/:email', (req, res) => {
  const { email } = req.params;
  getOrdersByEmail(email, (err, orders) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    console.log('ini hasil dari get ordersby email', orders);
    res.status(200).json(orders);
  });
});

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const originalName = req.file.originalname;
  const ext = path.extname(originalName); // Mendapatkan ekstensi file
  const baseName = path.basename(originalName, ext); // Nama file tanpa ekstensi

  // Membuat nama file unik dengan timestamp
  const uniqueName = `${baseName}-${Date.now()}${ext}`;

  const tempPath = req.file.path; // Path file sementara
  const targetPath = path.join(__dirname, '../uploads', uniqueName); // Path file tujuan

  // Pastikan folder 'uploads' ada
  if (!fs.existsSync(path.dirname(targetPath))) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  }

  fs.rename(tempPath, targetPath, (err) => {
    if (err) {
      console.error('Error renaming file:', err);
      return res.status(500).send('Error uploading file.');
    }

    // Mengembalikan URL file yang diupload
    const fileUrl = `http://10.0.2.2:5500/uploads/${uniqueName}`;
    res.status(200).json({ message: 'File uploaded successfully', url: fileUrl });
  });
});



module.exports = router;
