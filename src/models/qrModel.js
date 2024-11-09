import pool from '../../config/config.js';
import format from 'pg-format';

const Qr = {}

Qr.insert = async(id,date,email,style) => {
    return await pool.query(`INSERT INTO qr_codes(id_qr, time_qr_created, email, style) VALUES ($1, $2, $3, $4)`, [id,date,email,style]);
} 
Qr.show = async(id) => {
    return await pool.query(`SELECT style FROM qr_codes WHERE id_qr = $1`, [id]);
} 

Qr.getid = async(email) => {
    return await pool.query('SELECT id_qr FROM qr_codes WHERE email = $1', [email])
}

Qr.exists = async (field, value) => {
    const sql = format(`SELECT EXISTS(SELECT 1 FROM shortlinks WHERE %I = $1)`, field);
    return await pool.query(sql, [value]);
}

export default Qr;