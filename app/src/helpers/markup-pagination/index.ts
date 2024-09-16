import { Markup } from 'telegraf';

export default class {
  private _page: number = 1
  private _maxPages: number = this._page
  prevMaxPages?: number
  prevPage?: number
  
  constructor(page: number, maxPages: number) {
    this._page = page
    this.maxPages = maxPages
  }
  
  prevPageButton = (text: string = '<<<') => Markup.button.callback(text, 'prev_page')
  
  nextPageButton = (text: string = '>>>') => Markup.button.callback(text, 'next_page')
  
  onPrevPage = (data: string, callback: (page, prevPage) => void) => {
    if (data === 'prev_page') {
      this.prevPage = this.page
      this.page = Math.max(this.page - 1, 1)
      
      callback(this.page, this.prevPage)
    }
  }

  onNextPage = (data: string, callback: (page, prevPage) => void) => {
    if (data === 'next_page') {
      this.prevPage = this.page
      this.page = Math.min(this.page + 1, this.maxPages)
      
      callback(this.page, this.prevPage)
    }
  }
  
  get maxPages() {
    return this._maxPages
  }
  
  set maxPages(maxPages: number) {
    this.prevMaxPages = this._maxPages
    this._maxPages = maxPages
  }
  
  get page() {
    return this._page
  }
  
  set page(page: number) {
    this.prevPage = this._page
    this._page = page
  }
  
}