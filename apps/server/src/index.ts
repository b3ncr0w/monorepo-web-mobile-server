import cors from 'cors';
import express from 'express';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});