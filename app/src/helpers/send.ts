import { Context } from 'telegraf';
import { FmtString } from 'telegraf/format';
import { ExtraEditMessageText, ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { HandlerError } from '../exceptions/api-error';

export default async (ctx:Context, text:string | FmtString<any>, extra?: ExtraEditMessageText) => {
  try {
    if (ctx.updateType === 'message') {
      return await ctx.reply(text, extra);
    } else if (ctx.updateType === 'callback_query') {
      await ctx.answerCbQuery();
      return await ctx.editMessageText(text, extra);
    }
  } catch (e) {
    console.error(new HandlerError(400, 'Ошибка: Отправка сообщения', e))
  }
};