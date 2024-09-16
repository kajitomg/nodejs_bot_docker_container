import { FmtString } from 'telegraf/format';
import createListMessage from '../create-list-message';

export function genMessage(sections:{
  header?: FmtString<string>,
  body?: FmtString<string>,
  footer?: FmtString<string>
}): FmtString<string> {
  
  const content_values = Object.values(sections)
  const text = createListMessage({list: content_values},{ interval: 'indent' })
  
  return text
}

interface IResult {
  text: FmtString,
  reply_markup: any
}

export class createMessageSample<T> {
  private _data?:T
  private readonly sample: (data:T) => IResult
  private readonly content_wait: FmtString
  private _is_loading?: boolean = false
  public result: IResult
  
  constructor(data: { sample: (data:T) => IResult, content_wait: FmtString, data?:T, is_loading?: boolean  }) {
    this._data = data.data
    this.sample = data.sample
    this.content_wait = data.content_wait
    this._is_loading = data?.is_loading || false
  }
  
  private compile() {
    const compilation = this.sample(this.data)

    const text = genMessage({
      body: compilation.text,
      ...(this.is_loading && {footer: this.content_wait})
    })
    
    this.result = {
      text,
      ...(!this.is_loading && {reply_markup: compilation.reply_markup})
    }
  }
  
  get data() {
    return this._data
  }
  
  set data(data:T) {
    this._data = data
    this.compile()
  }
  
  set data_update(data:Partial<T>) {
    this.data = { ...this.data, ...data }
  }
  
  get is_loading() {
    return this._is_loading
  }
  
  set is_loading(data:boolean) {
    this._is_loading = data
    this.compile()
  }
  
}