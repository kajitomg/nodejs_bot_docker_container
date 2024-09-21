import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
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
        Markup.button.callback(ctx.i18n.t('code.add.buttons.name'), createNextScene(types.ADD_CODE_NAME)),
        Markup.button.callback(ctx.i18n.t('code.add.buttons.content'), createNextScene(types.ADD_CODE_CONTENT)),
        Markup.button.callback(ctx.i18n.t('code.add.buttons.create'), createNextScene(types.ADD_CODE_ADD_TO_DB)),
        Markup.button.callback(ctx.i18n.t('code.add.buttons.back'), createNextScene(ctx.wizard.state.options.entry)),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: bold(ctx.i18n.t('code.add.header',{ game:game.name })),
      body: fmt(fmt(`- ${ctx.i18n.t('code.add.name')}${ctx.wizard.state.code_name ? '' : '*'}: `), bold(ctx.wizard.state.code_name ? ctx.wizard.state.code_name : '-'),fmt('\n'),fmt(`- ${ctx.i18n.t('code.add.content')}${ctx.wizard.state.code_content ? '' : '*'}: `), bold(ctx.wizard.state.code_content ? ctx.wizard.state.code_content : '-')),
      ...(ctx.wizard.state.warning && {footer: italic(`${ctx.wizard.state.warning}*`)})
    })
    
    await send(ctx, text, { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup })
    
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const game = ctx.wizard.state.options.game
    const sceneId = ctx.update?.callback_query?.data;
    
    if (sceneId) {
      const nextScene = getNextScene(sceneId)
      if (nextScene) {
        ctx.wizard.state.nextScene = nextScene;
      }
      if (nextScene === types.ADD_CODE_ADD_TO_DB && (!ctx.wizard.state.code_name || !ctx.wizard.state.code_name)) {
        ctx.wizard.state.nextScene = types.ADD_CODE;
        ctx.wizard.state.warning = ctx.i18n.t('code.add.warning');
      }
    } else {
      await ctx.sendMessage(ctx.i18n.t('code.add.exit',{ game:game.name }))
    }
    return done();
  },
);
