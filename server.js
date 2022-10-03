import dayjs from 'dayjs';
import express from 'express';
import connection from './src/connection.js';
import { getGames, postGames } from './src/controllers/gamesControllers.js';

import { getCategories, postCategories } from './src/controllers/categoriesController.js';
import { changeCustomers, getCustomers, getCustomersById, postCustomers } from './src/controllers/costumersControllers.js';
import { attRentals,getRentals, postRentals } from './src/controllers/rentalsControllers.js';

const server = express();
server.use(express.json());



server.get('/categories', getCategories)
server.post('/categories', postCategories)

server.get('/games', getGames)
server.post('/games', postGames)

server.get('/customers', getCustomers)
server.get('/customers/:id', getCustomersById)
server.put('/customers/:id', changeCustomers)
server.post('/customers', postCustomers)

server.get('/rentals',getRentals )
server.post('/rentals', postRentals)
server.post('/rentals/:id/return',attRentals )
//server.delete('/rentals/:id',deleteRentals)


server.get('/status',(req, res) =>{
    res.send("ok")
})

server.listen(process.env.PORT, () => console.log('the magic happens on port 4000'))