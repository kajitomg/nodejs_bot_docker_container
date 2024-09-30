import { getDateNow } from '../../helpers/get-date-now';
import { userModel } from '../../models';

export class UserCrudSlices {
  constructor() {
  }
  
  public async create(data) {
    const date_now = getDateNow().toISOString();
    
    const candidate = await this.get({ chat_id:data?.chat_id })
    
    if (candidate.item) {
      console.log(`Пользователь с chat_id ${data?.chatId} уже существует`)
      return {
        item: candidate.item,
        result: 0
      }
    }
    
    let user = await userModel.create({ ...data, last_session: date_now })
    
    if (!user) {
      console.log(`Ошибка при создании пользователя`)
    }
    
    return {
      item: user,
      result: 1
    }
  }
  
  public async gets() {
    const users = await userModel.findAll()
    
    if (!users) {
      console.log(`Ошибка при получении пользователей`)
      return {
        result: 0
      }
    }
    
    return {
      list: users,
      result: 1
    }
  }
  
  public async get(data:{ chat_id:number }) {
    const user = await userModel.findOne({ where: data })
    
    if (!user) {
      console.log(`Пользователя с chat_id ${data.chat_id} не существует`)
      return {
        result: 0
      }
    }
    
    return {
      item: user,
      result: 1
    }
  }
  
  public async update(data) {
    const date_now = getDateNow().toISOString();
    const user = await this.get({ chat_id: data?.chat_id })
    
    if (user.result === 1) {
      await user.item.update({ ...data, last_session: date_now })
    } else if (user.result === 0) {
      return {
        result: 0
      }
    }

    return {
      item: user.item,
      result: 1
    }
  }
  
  public async delete(data) {
    const user = await this.get({ chat_id: data?.chat_id })
    
    await user.item.destroy()
    
    return {
      result: 1
    }
  }
}