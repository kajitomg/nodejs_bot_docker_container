
type DataType = string

export class CallbackWrapper {
  private readonly wrapper: string
  constructor(wrapper: string) {
    this.wrapper = wrapper
  }
  
  create(value: string): DataType {
    return `${this.wrapper}(${value})`
  }
  
  get(data: DataType): string | null {
    const reg = new RegExp(`${this.wrapper}\\(([^)]+)\\)`)
    return data.match(reg)?.[1]
  }
  
  static nextScene() {
    return new CallbackWrapper('next_scene')
  }
  
  static goToChannel() {
    return new CallbackWrapper('goto_channel')
  }
  
}