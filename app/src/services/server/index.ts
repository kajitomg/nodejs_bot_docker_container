require('dotenv').config()
import express, { Express } from 'express';
import { Services } from '../index';

export default class ServerService {
  private app: Express = express()
  public PORT: number = +(process.env.PORT || 5000)
  public services: Services
  
  constructor(services: Services) {
    this.services = services
    this.app.use(express.urlencoded({extended: true}));
  }
  
  public run = async (callback:() => Promise<void>) => {
    try {
      
      await this.app.listen(this.PORT, () => console.log(`Server has been started on ${this.PORT} port`))
      await callback()
    }
    catch (e) {
      console.log(e)
    }
  }
}