type DataType = string

export class CallbackQueryWrapper {
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
  
  async on(data: DataType, callback: (value: string) => Promise<void>): Promise<void> {
    const value = this.get(data)
    if (value) {
      await callback(value)
    }
  }
  
  static nextSceneHandler() {
    return new CallbackQueryWrapper('next_scene')
  }
  
  static goToChannelHandler() {
    return new CallbackQueryWrapper('goto_channel')
  }
  
}