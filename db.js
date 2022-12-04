const Pool = require('pg').Pool;

// const pool = new Pool({
//     user: "postgres",
//     password: "#E16Vev!",
//     host: "localhost",
//     port: 5432,
//     database: "clutchdatabase"
// });

const pool = new Pool({
    user: "dxfdcubtwzpnrh",
    password: "95109ac28212ef8382d21a135221e082a84f3466fde7c4a27c8417dc69840bd4",
    host: "ec2-3-223-169-166.compute-1.amazonaws.com",
    port: 5432,
    database: "d4mmlh8phneco9"
});

module.exports = pool;