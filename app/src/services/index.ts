import { Telegraf } from 'telegraf';
import { DBService } from './db';
import ServerService from './server';
import BotService from './bot';

export class Services {
  private _server?: ServerService
  private _bot?: Telegraf
  private _db?: DBService
  
  constructor() {
  }
  
  get server() {
    if (!this._server) {
      this._server = new ServerService(this);
    }
    return this._server;
  }
  
  get bot() {
    if (!this._bot) {
      this._bot = BotService;
    }
    return this._bot;
  }
  
  get db() {
    if (!this._db) {
      this._db = new DBService(this);
    }
    return this._db;
  }
}

const services = new Services()

export default services