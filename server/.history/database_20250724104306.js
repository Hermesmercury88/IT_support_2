const mysql = require('mysql2');

const pool = mysql.createPool({
host: '172.16.1.11',
user: 'boat',
database: 'survey_com',
password: '784512'
});


module.exports = pool.promise();