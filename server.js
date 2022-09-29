import express from 'express';

const server = express();

server.get('/status',(req, res) =>{
    res.send("ok")
})

server.listen(4000, () => console.log('the magic happens on port 4000'))