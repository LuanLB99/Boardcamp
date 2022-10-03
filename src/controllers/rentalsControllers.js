import connection from '../connection.js'
import joi from 'joi';
import dayjs from 'dayjs';


async function getRentals(req, res){
    try {
        const rentals = await connection.query('SELECT rentals.*, games.*, customers.id, customers.name as "nameCustomer" FROM rentals, games, customers');
        console.log(rentals.rows)
        let rent = []
        const myrentals = rentals.rows.forEach((rental)=> {
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
       return res.send(rent)
        
    } catch (error) {
        console.log(error.message)
    }
   res.sendStatus(201)
}

async function postRentals(req, res){
    const { customerId, gameId, daysRented } = req.body;
    try {
        const game = await connection.query('SELECT * FROM games WHERE id= $1', [gameId])
        const price = game.rows[0].pricePerDay * daysRented;
        const rentDate = dayjs().format('YYYY-MM-DD');
        const rental = connection.query('INSERT INTO rentals ("customerId","gameId","daysRented", "rentDate", "originalPrice","returnDate","delayFee") VALUES ($1,$2,$3,$4,$5,$6,$7)',[customerId, gameId, daysRented, rentDate, price, null, null]);
        return res.sendStatus(201)
    } catch (error) {
        console.log(error.message)
    }
    return res.sendStatus(201)
}


async function attRentals(req,res){
    const { id } = req.params;
    try {
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
        
    } catch (error) {
        console.log(error.message)
    }
   
    return res.sendStatus(201);
}


/*export async function deleteRentals(req, res) {
    const verifyRentals = await connection.query(
      `SELECT * FROM rentals WHERE id = $1;`,
      [req.params.id]
    );
  
    if (verifyRentals.rows.length === 0) return res.sendStatus(404);
    if (verifyRentals.rows[0].returnDate === null) return res.sendStatus(400);
  
    const deleteRentals = await connection.query(
      `DELETE FROM rentals WHERE id = $1;`,
      [req.params.id]
    );
    res.sendStatus(201);
  }*/
export {postRentals, getRentals, attRentals }