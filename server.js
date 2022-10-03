import dayjs from 'dayjs';
import express from 'express';
import pkg from 'pg';
import connection from './connection.js';

const server = express();
server.use(express.json());




server.get('/categories', async (req,res) => {
    const categories = await connection.query('SELECT * FROM categories;');
    res.send(categories.rows)
})

server.post('/categories', async (req, res )=>{
    const  { categorie }  = req.body;
    if(categorie === ''){return res.sendStatus(400)}
    const categoryExist = await connection.query('SELECT * FROM categories WHERE name = $1',[categorie]);
    if(categoryExist.rows.length !== 0){return res.sendStatus(409)}
    console.log(categoryExist.rows.length);
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

server.put('/customers/:id', async(req, res) =>{
    const { id } = req.params;
    const { name, phone, cpf, birthday } = req.body;
    try {
        const customer = await connection.query('SELECT * FROM customers WHERE id=$1', [id]);
        console.log(customer.rows)
        if(customer.rows.length === 0 ){return res.sendStatus(404)};
       const update = await connection.query('UPDATE customers SET name= $1, phone = $2, cpf= $3, birthday = $4 WHERE id = $5', [name, phone, cpf, birthday, id]);
        return res.send(customer.rows)
    } catch (error) {
        console.log(error.message)
    }
    
   
    
    return res.sendStatus(201);
})

server.post('/customers', async (req, res) =>{
    const {name, phone, cpf, birthday} = req.body;
    const customer = await connection.query('INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1,$2,$3,$4)', [name, phone, cpf, birthday])
    return res.send(201)
})

server.get('/rentals', async(req, res) =>{
    const rentals = await connection.query('SELECT rentals.*, games.*, customers.id, customers.name as "nameCustomer" FROM rentals, games, customers');

    let rent = []
    const myrentals = rentals.rows.map((rental)=> {
        rent.push({
            customerId:rental.customerId,
            gameId:rental.gameId,
            rentDate:rental.rentDate,
            daysRented:rental.daysRented,
            returnDate:rent.returnDate,
            originalPrice:rental.originalPrice,
            delayFee:rental.delayFee,
            customer:{
                id:rental.customerId,
                name:rental.nameCustomer
            },
            game:{
                id:rental.gameId,
                name:rental.name,
                categoryId:rental.categoryId,
                categoryName:rental.categoryName
            }
        })
    })
    res.send(rent)
})

server.post('/rentals', async(req, res) =>{
    const { customerId, gameId, daysRented } = req.body;
    const game = await connection.query('SELECT * FROM games WHERE id= $1', [gameId])
    const price = game.rows[0].pricePerDay * daysRented;
    const rentDate = dayjs().format('YYYY-MM-DD');
    const rental = connection.query('INSERT INTO rentals ("customerId","gameId","daysRented", "rentDate", "originalPrice","returnDate","delayFee") VALUES ($1,$2,$3,$4,$5,$6,$7)',[customerId, gameId, daysRented, rentDate, price, null, null]);
    return res.sendStatus(201)
})

server.post('/rentals/:id/return', async(req,res) =>{
    const { id } = req.params;
    const myrent = await connection.query('SELECT * FROM rentals WHERE id = $1', [id]);
    const newPrice = await connection.query('SELECT * FROM games WHERE id = $1',[myrent.rows[0].gameId]);
    const attReturnDate = await connection.query('UPDATE rentals SET "returnDate"= $1 WHERE id = $2',[dayjs().format('YYYY-MM-DD'),id]);
    const rentDate = dayjs(myrent.rows[0].rentDate).add(myrent.rows[0].daysRented, 'day').format('YYYY/MM/DD');
    const atualDate = dayjs().format('YYYY/MM/DD');
    if(dayjs(atualDate).isBefore(dayjs(rentDate))){
        const diff = dayjs(atualDate).diff(dayjs(rentDate,'day'));
        let milisseconds_dia = 1.15741e-8;
        let delay = diff*milisseconds_dia;
        delay = parseInt(delay)
        if(delay > 0){
        const attPrice = delay*(newPrice.rows[0].pricePerDay); 
        const newPriceRent = await connection.query('UPDATE rentals SET "delayFee"=$1 WHERE id = $2',[attPrice,id])
        }
        return res.sendStatus(201)
    } else {
        return res.send(false);
    }
    console.log(attReturnDate.rows)
    return res.sendStatus(201);
})


server.get('/status',(req, res) =>{
    res.send("ok")
})

server.listen(4000, () => console.log('the magic happens on port 4000'))