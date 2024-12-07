import pool from '../../config/config.js';
import format from 'pg-format';

const account = {};

account.insert = async (email,hashedPassword,active) => {
            return await pool.query(`INSERT INTO accounts VALUES ($1, $2, $3)`, [email,hashedPassword,active]);
    }

account.emails = async (email) =>{
            return await pool.query(`SELECT password FROM accounts WHERE email = $1`, [email]);
}

account.exist = async(email) =>{
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM accounts
        WHERE email = $1
      )
    `;
    return await pool.query(query, [email]);
}


export default account;