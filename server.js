import express from 'express';
import pkg from 'pg';

const { Pool } = pkg;
const server = express();
server.use(express.json());

const connection = new Pool({
    host:'localhost',
    port: 5432,
    user:'postgres',
    password:'benilda12',
    database:'boardcamp',
})


server.get('/categories', async (req,res) => {
    const categories = await connection.query('SELECT * FROM categories;');
    res.send(categories.rows)
})

server.post('/categories', async (req, res )=>{
    const  { categorie }  = req.body;
    const categories = await connection.query('INSERT INTO categories (name) VALUES ($1);',[categorie]);
    console.log(categories);
    res.sendStatus(201);
})

server.get('/games', async (req,res) => {
    const games = await connection.query('SELECT * FROM games;');
    res.sendStatus(games.rows)
})

server.get('/costumers', async (req,res) => {
    const costumers = await connection.query('SELECT * FROM costumers;');
    res.sendStatus(costumers.rows)
})

server.get('/rentals', async(req, res) =>{
    const rentals = await connection.query('SELECT * FROM rentals;');
    res.sendStatus(rentals.rows)
})



server.get('/status',(req, res) =>{
    res.send("ok")
})

server.listen(4000, () => console.log('the magic happens on port 4000'))