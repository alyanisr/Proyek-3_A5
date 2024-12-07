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
  const sql = format(
    `UPDATE shortlinks SET %I = $1, time_shortlink_last_updated = CURRENT_TIMESTAMP WHERE %I = $2`,
    field,
    fieldCriteria
  );
  return await pool.query(sql, [value, valueCriteria]);
};

Shortlink.patch = async (custom, oldUrl) => {
    return pool.query(
      `UPDATE shortlinks 
       SET short_url = $1, 
           time_shortlink_last_updated = CURRENT_TIMESTAMP 
       WHERE short_url = $2`,
      [custom, oldUrl]
    );
  };

Shortlink.delete = async (field, value) => {
    const sql = format(`DELETE FROM shortlinks WHERE %I = $1`, field);
    return await pool.query(sql, [value]);
};

Shortlink.insert = async (id_shortlink, long_url, short_url, email, title, method) => {
    return await pool.query(`INSERT INTO shortlinks(id_shortlink, long_url, short_url, time_shortlink_created, email, title, create_method, time_shortlink_last_updated) VALUES ($1, $2, $3, now()::timestamp, $4, $5, $6, now()::timestamp)`, [id_shortlink, long_url, short_url, email, title, method]);
}

Shortlink.exists = async (field, value) => {
    const sql = format(`SELECT EXISTS(SELECT 1 FROM shortlinks WHERE %I = $1)`, field);
    return await pool.query(sql, [value]);
}

Shortlink.getByEmailPaginated = async (email) => {
    return await pool.query(
        `SELECT id_shortlink, title, short_url, long_url, TO_CHAR(time_shortlink_created, 'DD-MM-YYYY') AS time_shortlink_created
         FROM shortlinks s
         WHERE email = $1 and create_method = 'shortlink'
         ORDER BY s.time_shortlink_created DESC`,
        [email]
    );
};

export default Shortlink;