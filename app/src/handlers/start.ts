import { Context } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import { HandlerError } from '../exceptions/api-error';
import userBot from '../routes/user-routes';
import { ScenesTypes } from '../scenes';
import Slices from '../slices';


export default async function (ctx: Context) {
  const chat_id = ctx.chat.id
  const author = ctx.from

  try {
    const user = await Slices.user.crud.create({ chat_id, username: author.username, first_name: author.first_name })
    if(user.result === 0) {
      await Slices.user.crud.update({ chat_id, username: author.username, firstName: author.first_name })
      await ctx.sendMessage(fmt(
        bold('Список команд:'),'\n\n',
        '/menu - Выбор игры','\n\n',
        '/language - Выбор языка','\n\n',
      ))
    } else if (user.result === 1) {
      await ctx.sendMessage(fmt(
        bold('Спасибо за использование бота!'),'\n\n',
        bold('Список команд:'),'\n\n',
        '/menu - Выбор игры','\n\n',
        '/language - Выбор языка',
      ))
    }
  } catch (error) {
    console.error(new HandlerError(400, `Ошибка: Стартовая сцена`, error))
  }
}