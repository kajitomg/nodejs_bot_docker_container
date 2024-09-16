import { Markup } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import codeController from '../../../controllers/code-controller';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import send from '../../../helpers/send';
import { Games } from '../../../models';
import types from './types';

export const createGiveCodeAddToDBScene = composeWizardScene(
  async (ctx) => {
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Назад в меню', types.GIVE_CODE),
        Markup.button.callback('Предложить код', 'create-code'),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: bold('Вы хотите отправить код Blum на модерацию:'),
      body: fmt(fmt(`- Название${ctx.wizard.state.code_name ? '' : '*'}: `), bold(ctx.wizard.state.code_name ? ctx.wizard.state.code_name : '-'),fmt('\n\n'),fmt(`- Содержание${ctx.wizard.state.code_content ? '' : '*'}: `), bold(ctx.wizard.state.code_content ? ctx.wizard.state.code_content : '-')),
    })
    
    await send(ctx, text, { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup })
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const chatId = ctx.chat?.id;
    const callback_data = ctx.update?.callback_query?.data;
    
    if (callback_data) {
      ctx.wizard.state.nextScene = callback_data;
      if (callback_data === 'create-code') {
        const code = await codeController.suggestCode({
          name: ctx.wizard.state.code_name,
          content: ctx.wizard.state.code_content,
          game: Games.BLUM,
          sender_id: ctx.chat.id
        })
        
        ctx.wizard.state.add_code_result = code.result;
        ctx.wizard.state.nextScene = types.GIVE_CODE_END_DIALOG;
      }
    } else {
      await ctx.sendMessage('Вы вышли из меню для предложений кода Blum')
    }
    return done();
  },
);