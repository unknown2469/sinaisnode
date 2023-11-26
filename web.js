const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Seu servidor web está funcionando!');
});

app.listen(PORT, () => {
  console.log(`Servidor web ouvindo na porta ${PORT}`);
});
