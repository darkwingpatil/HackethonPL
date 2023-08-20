import Pool from 'pg-pool';
// const url = require('url')
import dotenv from 'dotenv';
import {PoolConfig } from "pg"
import { ParsedQs } from 'qs';
// const params = url.parse(process.env.DATABASE_URL);
// const auth = params.auth.split(':');
dotenv.config();


const config:PoolConfig = {
  user: 'seamless_learning',
  password: 'seamless-learning',
  host:'localhost' ,
  port: 5442,
  database:'seamless_learning'
};
const pool = new Pool(config);

export const getLabidentity=async(id:string)=>{

  return new Promise((resolve,reject)=>{
    pool.connect().then(client => {
      client.query('SELECT title,description,environment ->> $1 AS platform FROM dvs.cloud_lab_v2 WHERE id = $2',['platform',id]).then(res => {
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


export const getAll_labdata=async(limit: string | string[] | ParsedQs | ParsedQs[],offset: string | string[] | ParsedQs | ParsedQs[])=>{
  return new Promise((resolve,reject)=>{
    pool.connect().then(client => {
      client.query('SELECT * FROM dvs.cloud_lab_v2 LIMIT $1 OFFSET $2',[limit,offset]).then(res => {
        client.release()
        console.log('hello from', res.rows)
        resolve(res.rows)
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


