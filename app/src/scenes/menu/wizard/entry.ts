import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { ScenesTypes } from '../../index';

export const createEntryScene = composeWizardScene(
  async (ctx) => {
    ctx.scene.state = {}
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('TapSwap', createNextScene(ScenesTypes.tapSwap.wizard.ENTRY)),
        Markup.button.callback('XEmpire', createNextScene(ScenesTypes.xEmpire.wizard.ENTRY)),
        Markup.button.callback('Blum', createNextScene(ScenesTypes.blum.wizard.ENTRY)),
      ],{ columns: 2 }
    )

    await send(ctx, fmt(bold(ctx.i18n.t('menu.header')),'\n\n',italic(ctx.i18n.t('menu.body'))), markup)
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const sceneId = ctx.update?.callback_query?.data;
    
    if (sceneId) {
      const nextScene = getNextScene(sceneId)
      if (nextScene) {
        ctx.wizard.state.nextScene = nextScene;
      }
    } else {
      await ctx.sendMessage(ctx.i18n.t('menu.exit'))
    }
    
    return done();
  },
);