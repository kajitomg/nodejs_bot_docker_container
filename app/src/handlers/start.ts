import { Context } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import { HandlerError } from '../exceptions/api-error';
import { Languages } from '../models/user/user-model';
import userBot from '../routes/user-routes';
import { ScenesTypes } from '../scenes';
import types from '../scenes/blum/wizzard/types';
import Slices from '../slices';


export default async function (ctx: Context) {
  const chat_id = ctx.chat.id
  const author = ctx.from

  try {
    let { result, item } = (await Slices.user.crud.create({ chat_id, username: author.username, first_name: author.first_name }))
    
    item = (await Slices.user.crud.get({ chat_id: chat_id })).item
    const language = Languages?.[item?.language] || 'ru'

    //@ts-ignore
    ctx.i18n.locale(language)
    if(result === 0) {
      await Slices.user.crud.update({ chat_id, username: author.username, firstName: author.first_name })
      await ctx.sendMessage(fmt(
        //@ts-ignore
        bold(ctx.i18n.t('start.data.command_list')),'\n\n',
        //@ts-ignore
        `/menu - ${ctx.i18n.t('start.data.main_menu')}`,'\n\n',
        //@ts-ignore
        `/games - ${ctx.i18n.t('start.data.games')}`,'\n\n',
        //@ts-ignore
        `/profile - ${ctx.i18n.t('start.data.profile')}`
      ))
    } else if (result === 1) {
      await ctx.sendMessage(fmt(
        //@ts-ignore
        bold(ctx.i18n.t('start.data.thanks_for_use')),'\n\n',
        //@ts-ignore
        bold(ctx.i18n.t('start.data.command_list')),'\n\n',
        //@ts-ignore
        `/menu - ${ctx.i18n.t('start.data.main_menu')}`,'\n\n',
        //@ts-ignore
        `/games - ${ctx.i18n.t('start.data.games')}`,'\n\n',
        //@ts-ignore
        `/profile - ${ctx.i18n.t('start.data.profile')}`
      ))
    }
  } catch (error) {
    console.error(new HandlerError(400, `Ошибка: Стартовая сцена`, error))
  }
}