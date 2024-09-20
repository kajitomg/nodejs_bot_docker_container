import { Markup } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import types from './types';

export const createAddCodeScene = composeWizardScene(
  async (ctx) => {
    const game = ctx.wizard.state.options.game
    
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Изменить название', createNextScene(types.ADD_CODE_NAME)),
        Markup.button.callback('Изменить содержание', createNextScene(types.ADD_CODE_CONTENT)),
        Markup.button.callback('Создать код', createNextScene(types.ADD_CODE_ADD_TO_DB)),
        Markup.button.callback('Назад в меню', createNextScene(ctx.wizard.state.options.entry)),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: bold(`Сцена создания кода ${game.name}`),
      body: fmt(fmt(`- Название${ctx.wizard.state.code_name ? '' : '*'}: `), bold(ctx.wizard.state.code_name ? ctx.wizard.state.code_name : '-'),fmt('\n'),fmt(`- Содержание${ctx.wizard.state.code_content ? '' : '*'}: `), bold(ctx.wizard.state.code_content ? ctx.wizard.state.code_content : '-')),
      ...(ctx.wizard.state.warning && {footer: fmt(`*${ctx.wizard.state.warning}*`)})
    })
    
    await send(ctx, text, { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup })
    
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const game = ctx.wizard.state.game
    const sceneId = ctx.update?.callback_query?.data;
    
    if (sceneId) {
      const nextScene = getNextScene(sceneId)
      if (nextScene) {
        ctx.wizard.state.nextScene = nextScene;
      }
      if (sceneId === types.ADD_CODE_ADD_TO_DB && (!ctx.wizard.state.code_name || !ctx.wizard.state.code_name)) {
        ctx.wizard.state.nextScene = types.ADD_CODE;
        ctx.wizard.state.warning = 'Заполните обязательные поля';
      }
    } else {
      await ctx.sendMessage(`Вы вышли из меню создания кода ${game.name}`)
    }
    return done();
  },
);
