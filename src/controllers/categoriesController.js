import connection from '../connection.js';
import joi from 'joi';
import dayjs from 'dayjs';

const categoriesSchema = joi.object({
    name:joi.string().required().empty("")
})

async function getCategories (req,res){
    try {
        const categories = await connection.query('SELECT * FROM categories;');
        res.send(categories.rows)
    } catch (error) {
        console.log(error.message)
    }
    
    res.send(201)
}


async function postCategories(req, res ){
    const  { name }  = req.body;
    const validation = categoriesSchema.validate({name}) 
    if(validation.error){return res.sendStatus(400)}
    try {
        const categoryExist = await connection.query('SELECT * FROM categories WHERE name = $1',[name]);
    if(categoryExist.rows.length !== 0){return res.sendStatus(409)}
    const categories = await connection.query('INSERT INTO categories (name) VALUES ($1);',[name]);
    res.sendStatus(201);
        
    } catch (error) {
        console.log(error)
    }

    res.sendStatus(201);
}

export {getCategories, postCategories}