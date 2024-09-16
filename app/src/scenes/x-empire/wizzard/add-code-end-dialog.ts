import { Markup } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import send from '../../../helpers/send';
import types from './types';

const variants = {
  0:'Произошла ошибка при добавлении кода!',
  1:'Код успешно добавлен!'
}

export const createAddCodeEndDialogScene = composeWizardScene(
  async (ctx) => {
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Вернуться в меню X-Empire', types.ENTRY),
        Markup.button.callback('Создать новый код', types.ADD_CODE),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: bold(variants[ctx.wizard.state.add_code_result]),
      body: fmt(fmt(`- Название${ctx.wizard.state.code_name ? '' : '*'}: `), bold(ctx.wizard.state.code_name ? ctx.wizard.state.code_name : '-'),fmt('\n\n'),fmt(`- Содержание${ctx.wizard.state.code_content ? '' : '*'}: `), bold(ctx.wizard.state.code_content ? ctx.wizard.state.code_content : '-')),
    })
    
    await send(ctx, text, { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup })
    
    delete ctx.wizard.state?.code_name
    delete ctx.wizard.state?.code_content
    delete ctx.wizard.state?.add_code_result
    
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_data = ctx.update?.callback_query?.data;
    
    if (callback_data) {
      ctx.wizard.state.nextScene = callback_data;
    } else {
      await ctx.sendMessage('Вы вышли из меню создания кода X-Empire')
    }
    return done();
  },
);