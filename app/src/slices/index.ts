import { UserSlices } from './user';
import { codeSlices } from './code';
import { mandatoryChannelSlices } from './mandatory-channel';

export class Slices {
  private _user: UserSlices
  private _code: typeof codeSlices
  private _mandatoryChannel: typeof mandatoryChannelSlices
  
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
  
  get mandatoryChannel() {
    if (!this._mandatoryChannel) {
      this._mandatoryChannel = mandatoryChannelSlices;
    }
    return this._mandatoryChannel;
  }
}


export default new Slices()