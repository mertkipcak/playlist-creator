import express from 'express';
import cors from 'cors';
import { CreatePostRequest } from './api/create';
import path from 'path';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const createPostRequest = new CreatePostRequest();

app.post('/create', createPostRequest.handleRequest.bind(createPostRequest));

app.use(express.static(path.join(__dirname, '../../frontend/build')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
