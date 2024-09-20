require('dotenv').config()
import * as pg from 'pg'
import { Sequelize } from 'sequelize';

const DB = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect:'postgres',
    dialectModule: pg,
    host: process.env.DB_HOST,
    port: +(process.env.DB_PORT || 5432),
  }
)

class Postgresql {
  public sequelize  = DB
  public models
  
  constructor() {}
  
  async start(models) {
    await this.sequelize.authenticate()
    await this.sequelize.sync({
      alter: true
    })
    this.models = models
  }
}

export {Postgresql}