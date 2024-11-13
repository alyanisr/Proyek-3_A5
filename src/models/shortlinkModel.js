import pool from '../../config/config.js';
import format from 'pg-format';

const Shortlink = {};

Shortlink.getAll = async () => {
    return await pool.query(`SELECT * FROM shortlinks`);
}

Shortlink.getBy = async (field, value) => {
    const sql = format(`SELECT * FROM shortlinks WHERE %I = $1`, field);
    return await pool.query(sql, [value]);
}

Shortlink.update = async (field, value, fieldCriteria, valueCriteria) => {
    const sql = format(`UPDATE shortlinks SET %I = $1 WHERE %I = $2`, field, fieldCriteria);
    return await pool.query(sql, [value, valueCriteria]);
}

Shortlink.delete = async (field, value) => {
    const sql = format(`DELETE FROM shortlinks WHERE %I = $1`, field);
    return await pool.query(sql, [value]);
}

Shortlink.insert = async (id_shortlink, long_url, short_url, email) => {
    return await pool.query(`INSERT INTO shortlinks(id_shortlink, long_url, short_url, time_shortlink_created, email) VALUES ($1, $2, $3, now()::timestamp, $4)`, [id_shortlink, long_url, short_url, email]);
}

Shortlink.exists = async (field, value) => {
    const sql = format(`SELECT EXISTS(SELECT 1 FROM shortlinks WHERE %I = $1)`, field);
    return await pool.query(sql, [value]);
}

Shortlink.getByEmailPaginated = async (email, limit, offset) => {
    return await pool.query(
        `SELECT short_url, long_url, time_shortlink_created FROM shortlinks WHERE email = $1 ORDER BY time_shortlink_created DESC LIMIT $2 OFFSET $3`,
        [email, limit, offset]
    );
};

export default Shortlink;