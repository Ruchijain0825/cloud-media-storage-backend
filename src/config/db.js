import pg from 'pg';
const {Pool} = pg;
const pool = new Pool({
    connectionString:process.env.POSTGRE_URL,
    max: 10,
    idleTimeOutMillis:30000,
    ConnectionTimeoutMillis:5000,

})
export default pool;