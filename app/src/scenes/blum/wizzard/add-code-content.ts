import { Markup } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import send from '../../../helpers/send';
import types from './types';

export const createAddCodeContentScene = composeWizardScene(
  async (ctx) => {
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Назад в меню', types.ADD_CODE),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: fmt('Введите Содержание кода:'),
      body: fmt(fmt(`- Содержание${ctx.wizard.state.code_content ? '' : '*'}: `), bold(ctx.wizard.state.code_content ? ctx.wizard.state.code_content : '-')),
    })
    
    const message = await send(ctx, text, { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup })
    //@ts-ignore
    ctx.wizard.state.delete_message_id = message?.message_id
    
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const { delete_message_id } = ctx.wizard.state;
    const chatId = ctx.chat?.id;
    const callback_query = ctx.update?.callback_query?.data;
    const messageText = ctx.message?.text;
    
    ctx.telegram.editMessageReplyMarkup(chatId, delete_message_id, undefined, undefined)
    
    if (callback_query) {
      ctx.wizard.state.nextScene = callback_query;
    } else {
      ctx.wizard.state.nextScene = types.ADD_CODE;
      ctx.wizard.state.code_content = messageText;
    }
    if (ctx.wizard.state.warning) {
      delete ctx.wizard.state.warning;
    }
    
    return done();
  },
);
