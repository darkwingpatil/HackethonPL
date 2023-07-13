import Pool from 'pg-pool';
// const url = require('url')
import dotenv from 'dotenv';
import {PoolConfig } from "pg"
// const params = url.parse(process.env.DATABASE_URL);
// const auth = params.auth.split(':');
dotenv.config();


const config:PoolConfig = {
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host:process.env.POSTGRES_HOST ,
  port: process.env.POSTGRES_PORT?Number(process.env.POSTGRES_PORT):5442,
  database:process.env.POSTGRES_DB
};

const pool = new Pool(config);



export const getLabidentity=async(id:string)=>{

  return new Promise((resolve,reject)=>{
    pool.connect().then(client => {
      client.query('SELECT environment ->> $1 AS platform FROM dvs.cloud_lab_v2 WHERE id = $2',['platform',id]).then(res => {
        client.release()
        console.log('hello from', res.rows[0])
        resolve(res.rows[0])
      })
      .catch(e => {
        client.release()
        resolve({})
        console.error('query error', e.message, e.stack)
      })
    })
  })
}


// getLabidentity('62473215-caf6-4efe-8996-decbc94b8400')


