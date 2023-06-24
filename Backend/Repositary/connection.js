import Pool from 'pg-pool';
// const url = require('url')
import dotenv from 'dotenv';
// const params = url.parse(process.env.DATABASE_URL);
// const auth = params.auth.split(':');
dotenv.config();


const config = {
  user: 'channels_admin',
  password: 'yA647r(243Y',
  host:'channels-rds.eplur-staging.vnerd.com' ,
  port: 5432,
  database:'postgres'
};

const pool = new Pool(config);



export const getLabidentity=(id)=>{

  pool.connect().then(client => {
    client.query('SELECT * FROM labshackethon where id=$1',[id]).then(res => {
      client.release()
      console.log('hello from', res.rows[0])
      return res.rows[0]
    })
    .catch(e => {
      client.release()
      console.error('query error', e.message, e.stack)
    })
  })
}


