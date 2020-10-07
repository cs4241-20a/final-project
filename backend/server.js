import express from 'express';
import expressStaticGzip from 'express-static-gzip';
import path from 'path';

const PORT = 3000;

const app = express();

app.use(expressStaticGzip("../dist", {
    enableBrotli: true,
    orderPreference: ['br']
}));

app.use('*', (req, res) => {
    res.sendFile(path.resolve("../dist/index.html.br"), {
        headers: {
            "Content-Encoding": "br",
            "Content-Type": "text/html; charset=UTF-8"
        }
    });
});

app.listen(PORT, () => {
    console.log("Server started on http://localhost:" + PORT);
});