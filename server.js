import dayjs from 'dayjs';
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
    res.sendStatus(201);
})

server.get('/games', async (req,res) => {
    const games = await connection.query('SELECT * FROM games;');
    res.send(games.rows)
})

server.post('/games', async (req, res )=>{
    const  { name, image, stockTotal, categoryId, pricePerDay }  = req.body;
    if(name === '' || stockTotal < 0 || pricePerDay < 0){return res.sendStatus(400)}
    const categoryExist = await connection.query('SELECT categories.id FROM categories WHERE id = $1', [categoryId])
    if(!categoryExist){return res.sendStatus(400)};
    const games = await connection.query('INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1,$2,$3,$4,$5);',
                                        [name,image,stockTotal,categoryId,pricePerDay]);
    
    res.sendStatus(201);
})

server.get('/customers', async (req,res) => {
    const customers = await connection.query('SELECT * FROM customers;');
    res.send(customers.rows)
})

server.get('/customers/:id', async(req, res) =>{
    const { id } = req.params;
    const customer = await connection.query('SELECT * FROM customers WHERE id=$1', [id]);
    if(customer.rows.length === 0 ){return res.sendStatus(404)};
    return res.send(customer.rows);
})

server.post('/customers', async (req, res) =>{
    const {name, phone, cpf, birthday} = req.body;

    const customer = await connection.query('INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1,$2,$3,$4)', [name, phone, cpf, birthday])
    return res.send(201)
})

server.get('/rentals', async(req, res) =>{
    const rentals = await connection.query('SELECT * FROM rentals;');
    res.send(rentals.rows)
})

server.post('/rentals', async(req, res) =>{
    const { customerId, gameId, daysRented } = req.body;
    const game = await connection.query('SELECT * FROM games WHERE id= $1', [gameId])
    const price = game.rows[0].pricePerDay * daysRented;
    const rentDate = dayjs().format('YYYY-MM-DD')
    const rental = connection.query('INSERT INTO rentals ("customerId","gameId","daysRented", "rentDate", "originalPrice","returnDate","delayFee") VALUES ($1,$2,$3,$4,$5,$6,$7)',[customerId, gameId, daysRented, rentDate, price, null, null]);
    return res.sendStatus(201)
})


server.get('/status',(req, res) =>{
    res.send("ok")
})

server.listen(4000, () => console.log('the magic happens on port 4000'))