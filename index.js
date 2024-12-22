const express = require('express');
const cors = require('cors');

const app = express()
const port = process.env.port || 3000;

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send(`Food server is running`)
})

app.listen(port, ()  => {
  console.log(`Sever is running in in port: ${port}`);
})