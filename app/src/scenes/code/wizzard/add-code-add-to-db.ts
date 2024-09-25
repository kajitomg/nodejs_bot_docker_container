import { Markup } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import codeController from '../../../controllers/code-controller';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import types from './types';

export const createAddCodeAddToDBScene = composeWizardScene(
  async (ctx) => {
    const game = ctx.wizard.state.options.game
    
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback(ctx.i18n.t('code.addToDB.buttons.back'), createNextScene(types.ADD_CODE)),
        Markup.button.callback(ctx.i18n.t('code.addToDB.buttons.create'), 'create-code'),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: bold(ctx.i18n.t('code.addToDB.header',{game: game.name})),
      body: fmt(fmt(`- ${ctx.i18n.t('code.addToDB.name')}${ctx.wizard.state.code_name ? '' : '*'}: `), bold(ctx.wizard.state.code_name ? ctx.wizard.state.code_name : '-'),fmt('\n\n'),fmt(`- ${ctx.i18n.t('code.addToDB.content')}${ctx.wizard.state.code_content ? '' : '*'}: `), bold(ctx.wizard.state.code_content ? ctx.wizard.state.code_content : '-')),
    })
    
    await send(ctx, text, { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup })
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
      if (callback_data === 'create-code') {
        const code = await codeController.createCode({
          name: ctx.wizard.state.code_name,
          content: ctx.wizard.state.code_content,
          game: game.id,
          sender_id: ctx.chat.id
        })
        
        ctx.wizard.state.add_code_result = code.result;
        ctx.wizard.state.nextScene = types.ADD_CODE_END_DIALOG;
      }
    } else {
      await ctx.sendMessage(ctx.i18n.t('code.addToDB.exit',{ game: game.name }))
    }
    return done();
  },
);