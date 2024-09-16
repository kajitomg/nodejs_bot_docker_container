import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { ScenesTypes } from '../../index';

export const createEntryScene = composeWizardScene(
  async (ctx) => {
    ctx.scene.state = {}
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('TapSwap', ScenesTypes.tapSwap.wizard.ENTRY),
        Markup.button.callback('XEmpire', ScenesTypes.xEmpire.wizard.ENTRY),
        Markup.button.callback('Blum', ScenesTypes.blum.wizard.ENTRY),
      ],{ columns: 2 }
    )
    await send(ctx, fmt(bold('Меню'),'\n\n',italic('Выберите интересующее вас действие:')), markup)
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const sceneId = ctx.update?.callback_query?.data;
    
    if (sceneId) {
      ctx.wizard.state.nextScene = sceneId;
    } else {
      await ctx.sendMessage('Вы вышли из сцены меню')
    }
    
    return done();
  },
);