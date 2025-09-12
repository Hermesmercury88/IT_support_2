const mysql = require('mysql2');

const pool = mysql.createPool({
host: 'localhost',
user: 'root',
database: 'survey_com',
password: '784512'
});


module.exports = pool.promise();