import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import types from './types';

export const createGiveCodeScene = composeWizardScene(
  async (ctx) => {
    const game = ctx.wizard.state.options.game
    
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback(ctx.i18n.t('code.give.buttons.name'), createNextScene(types.GIVE_CODE_NAME)),
        Markup.button.callback(ctx.i18n.t('code.give.buttons.content'), createNextScene(types.GIVE_CODE_CONTENT)),
        Markup.button.callback(ctx.i18n.t('code.give.buttons.create'), createNextScene(types.GIVE_CODE_ADD_TO_DB)),
        Markup.button.callback(ctx.i18n.t('code.give.buttons.back'), createNextScene(ctx.wizard.state.options.entry)),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: bold(ctx.i18n.t('code.give.header',{ game: game.name })),
      body: fmt(fmt(`- ${ctx.i18n.t('code.give.name')}${ctx.wizard.state.code_name ? '' : '*'}: `), bold(ctx.wizard.state.code_name ? ctx.wizard.state.code_name : '-'),fmt('\n'),fmt(`- ${ctx.i18n.t('code.give.content')}${ctx.wizard.state.code_content ? '' : '*'}: `), bold(ctx.wizard.state.code_content ? ctx.wizard.state.code_content : '-')),
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
      if (nextScene === types.GIVE_CODE_ADD_TO_DB && (!ctx.wizard.state.code_name || !ctx.wizard.state.code_content)) {
        ctx.wizard.state.nextScene = types.GIVE_CODE;
        ctx.wizard.state.warning = ctx.i18n.t('code.give.warning');
      }
    } else {
      await ctx.sendMessage(ctx.i18n.t('code.give.exit',{ game: game.name }))
    }
    return done();
  },
);