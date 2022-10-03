import connection from '../connection.js'
import joi from 'joi';
import dayjs from 'dayjs';

async function getGames (req,res) {
    try {
        const games = await connection.query('SELECT * FROM games;');
    res.send(games.rows)
    } catch (error) {
     console.log(error.message)   
    }
    return res.sendStatus(201);  
}

const gamesSchema = joi.object({
    name:joi.string().required().empty(""),
    stockTotal:joi.number().min(0).required(),
    pricePerDay:joi.number().min(0).required()
})

async function postGames (req, res ){
    const  { name, image, stockTotal, categoryId, pricePerDay }  = req.body;
    const validation = gamesSchema.validate({name, stockTotal, pricePerDay})
    if(validation.error){return res.status(400).send(validation.error.details.map((detail) => detail.message))}
    try {
        const categoryExist = await connection.query('SELECT categories.id FROM categories WHERE id = $1;', [categoryId])

        if(categoryExist.rows.length === 0){return  res.sendStatus(400)};
       const games = await connection.query('INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1,$2,$3,$4,$5);',
                                      [name,image,stockTotal,categoryId,pricePerDay]);
        
        return res.sendStatus(201)
        
    } catch (error) {
        console.log(error.message)
    }

    res.sendStatus(201)
}

export {getGames, postGames}