import express from 'express';

const app = express();
const port = 5001;

app.get('/', (req, res) => {
  res.send('Hello from Express + TypeScript!');
});

app.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});