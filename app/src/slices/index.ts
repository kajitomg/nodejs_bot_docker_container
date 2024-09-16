import { UserSlices } from './user';
import { codeSlices } from './code';

export class Slices {
  private _user: UserSlices
  private _code: typeof codeSlices
  
  constructor() {}
  
  get user() {
    if (!this._user) {
      this._user = new UserSlices();
    }
    return this._user;
  }
  
  get code() {
    if (!this._code) {
      this._code = codeSlices;
    }
    return this._code;
  }
}


export default new Slices()