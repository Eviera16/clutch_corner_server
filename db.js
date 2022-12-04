const Pool = require('pg').Pool;

const pool = new Pool({
    user: "postgres",
    password: "#E16Vev!",
    host: "localhost",
    port: 5432,
    database: "clutchdatabase"
});

module.exports = pool;