import { Markup } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import send from '../../../helpers/send';
import types from './types';

export const createGiveCodeNameScene = composeWizardScene(
  async (ctx) => {
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Назад в меню', types.GIVE_CODE),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: fmt('Введите Название кода:'),
      body: fmt(fmt(`- Название${ctx.wizard.state.code_name ? '' : '*'}: `), bold(ctx.wizard.state.code_name ? ctx.wizard.state.code_name : '-')),
    })
    
    const message = await send(ctx, text, { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup })    //@ts-ignore
    ctx.wizard.state.delete_message_id = message?.message_id
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const chatId = ctx.chat?.id;
    const callback_query = ctx.update?.callback_query?.data;
    const messageText = ctx.message?.text;
    
    ctx.telegram.editMessageReplyMarkup(chatId, ctx.wizard.state.delete_message_id, undefined, undefined)
    
    if (callback_query) {
      ctx.wizard.state.nextScene = callback_query;
    } else {
      if (ctx.wizard.state.code_content) {
        ctx.wizard.state.nextScene = types.GIVE_CODE;
      } else {
        ctx.wizard.state.nextScene = types.GIVE_CODE_CONTENT;
      }
      ctx.wizard.state.code_name = messageText;
    }
    
    if (ctx.wizard.state.warning) {
      delete ctx.wizard.state.warning;
    }
    
    return done();
  },
);
