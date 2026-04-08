// Por que separar app.js de server.js?
// Nos testes, nós importamos o app diretamente (sem subir o servidor).
// Se o app.listen() estivesse dentro do app.js, o servidor subiria toda vez que rodássemos os testes, o que causaria conflitos de porta.

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});