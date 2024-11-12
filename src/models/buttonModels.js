import pool from '../../config/config.js';
import format from 'pg-format';

const Button = {};

Button.getAll = async () => {
    return await pool.query(`SELECT * FROM shortlinks`);
}

Button.getBy = async (field, value) => {
    const sql = format(`SELECT * FROM buttons WHERE %I = $1`, field);
    return await pool.query(sql, [value]);
}

Button.getByExceptID = async (field, value) => {
    const sql = format(`SELECT button_position, button_name, id_shortlink FROM buttons WHERE %I = $1 ORDER BY button_position ASC`, field);
    return await pool.query(sql, [value]);
}

Button.insert = async (name, position, idLinktree, idShortlink) => {
    return await pool.query(`INSERT INTO buttons VALUES ($1, $2, $3, $4)` ,[name, position, idLinktree, idShortlink]);
}

Button.update = async (field, value, fieldCriteria, valueCriteria) => {
    const sql = format(`UPDATE buttons SET %I = $1 WHERE %I = $2`, field, fieldCriteria);
    return await pool.query(sql, [value, valueCriteria]);
}

Button.delete = async (field, value) => {
    const sql = format(`DELETE FROM buttons WHERE %I = $1`, field);
    return await pool.query(sql, [value]);
}

export default Button;