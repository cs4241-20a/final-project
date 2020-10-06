import express from 'express';
import expressStaticGzip from 'express-static-gzip';

const PORT = 3000;

const app = express();

app.use(expressStaticGzip("../dist", {
    enableBrotli: true,
    orderPreference: ['br']
}));

app.listen(PORT, () => {
    console.log("Server started on http://localhost:" + PORT);
});