import { Context } from 'telegraf';
import Slices from '../slices';


export default async function (ctx: Context) {
  const chat_id = ctx.chat.id
  const author = ctx.from
  
  try {
    const user = await Slices.user.crud.create({ chat_id, username: author.username, first_name: author.first_name })
    if(user.result === 0) {
      await Slices.user.crud.update({ chat_id, username: author.username, firstName: author.first_name })
      await ctx.sendMessage('Список команд:\n\n/games - Выбор игры')
    } else if (user.result === 1) {
      await ctx.sendMessage('Спасибо за использование бота!\n\nСписок команд:\n\n/games - Выбор игры')
    }
  } catch (error) {
    console.log(author.username + ' ' + error.response?.error_code + ' ' + error.response?.description)
  }
}