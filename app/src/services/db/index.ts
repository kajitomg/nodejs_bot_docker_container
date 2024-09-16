import { Services } from '../index';
import { Postgresql } from './postgresql'

class DBService {
  private _postgres: Postgresql
  
  public services: Services
  
  constructor(services: Services) {
    this.services = services;
  }
  
  get postgres() {
    if (!this._postgres) {
      this._postgres = new Postgresql();
    }
    return this._postgres;
  }
}

export default DBService