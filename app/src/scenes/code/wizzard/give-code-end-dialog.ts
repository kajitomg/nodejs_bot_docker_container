import { Markup } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import types from './types';

const variants = {
  0:'Произошла ошибка при отправке кода!',
  1:'Код успешно отправлен на модерацию!'
}

export const createGiveCodeEndDialogScene = composeWizardScene(
  async (ctx) => {
    const game = ctx.wizard.state.options.game
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback(`Вернуться в меню ${game.name}`, createNextScene(ctx.wizard.state.options.entry)),
        Markup.button.callback('Предложить новый код', createNextScene(types.GIVE_CODE)),
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
    const game = ctx.wizard.state.options.game
    const callback_data = ctx.update?.callback_query?.data;
    
    if (callback_data) {
      const nextScene = getNextScene(callback_data)
      if (nextScene) {
        ctx.wizard.state.nextScene = nextScene;
      }
    } else {
      await ctx.sendMessage(`Вы вышли из меню для предложений кода ${game.name}`)
    }
    return done();
  },
);