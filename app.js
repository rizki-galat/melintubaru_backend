const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const path = require('path');
const app = express();
const port = process.env.PORT ||5500;

app.use(bodyParser.json());

// Routes


app.use('/', userRoutes);
app.use('/', orderRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.listen(port, () => {
  console.log(`Server running on http://10.0.2.2:${port}`);
});
