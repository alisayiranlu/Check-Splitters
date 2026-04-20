const express = require('express');
const cors = require('cors');

const sessionsRouter = require('./routes/sessions');
const receiptsRouter = require('./routes/receipts');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/sessions', sessionsRouter);
app.use('/api/receipts', receiptsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
