const mysql = require('mysql2');

const pool = mysql.createPool({
host: 'localhost',
user: 'root',
database: '',
password: '784512'
});


module.exports = pool.promise();