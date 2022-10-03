import connection from '../connection.js'
import joi from 'joi';
import dayjs from 'dayjs';

const customersSchema = joi.object({
    name:joi.string().required().empty(""),
    phone:joi.string().min(10).max(11).required(),
    cpf:joi.string().max(11).min(11).required(),
    birthday:joi.date().required()
})

async function getCustomers(req,res){

    try {
        const customers = await connection.query('SELECT * FROM customers;');
        return res.send(customers.rows)
    } catch (error) {
        console.log(error.message)
    }
   return res.sendStatus(201)
}

async function getCustomersById(req, res){
    const { id } = req.params;
    try {
        const customer = await connection.query('SELECT * FROM customers WHERE id=$1', [id]);
    if(customer.rows.length === 0 ){return res.sendStatus(404)};
    return res.send(customer.rows);
    } catch (error) {
        console.log(error.message)
    }
    return res.sendStatus(201)
}

async function changeCustomers(req, res){
    const { id } = req.params;
    const { name, phone, cpf, birthday } = req.body;
    try {
        const customer = await connection.query('SELECT * FROM customers WHERE id=$1', [id]);
        if(customer.rows.length === 0 ){return res.sendStatus(404)};
       const update = await connection.query('UPDATE customers SET name= $1, phone = $2, cpf= $3, birthday = $4 WHERE id = $5', [name, phone, cpf, birthday, id]);
        return res.send(customer.rows)
    } catch (error) {
        console.log(error.message)
    }
    
    return res.sendStatus(201);
}

async function postCustomers (req, res){
    const {name, phone, cpf, birthday} = req.body;
    const validation = customersSchema.validate({name, phone, cpf, birthday})
    if(validation.error){return res.status(400).send(validation.error.details.map((detail) => detail.message))}
    try {
        const customer = await connection.query('INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1,$2,$3,$4)', [name, phone, cpf, birthday])
    return res.sendStatus(201)
    } catch (error) {
        console.log(error.message)
    }
    return res.sendStatus(201)
}

export {getCustomers, getCustomersById, changeCustomers, postCustomers}