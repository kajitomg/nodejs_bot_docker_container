import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { Languages } from '../../../models/user/user-model';
import Slices from '../../../slices';
import { ScenesTypes } from '../../index';

export const createEntryScene = composeWizardScene(
  async (ctx) => {
    const chat_id = ctx.chat.id
    let language = ctx.scene.state?.options?.language
    try {
      if(!language) {
        const user = await Slices.user.crud.get({ chat_id })
        language = Languages?.[user.item?.language] || 'ru'
      }
      
      ctx.scene.state = {
        options: {
          language
        }
      }
      ctx.i18n.locale(language)
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('TapSwap', createNextScene(ScenesTypes.tapSwap.wizard.ENTRY)),
          Markup.button.callback('XEmpire', createNextScene(ScenesTypes.xEmpire.wizard.ENTRY)),
          Markup.button.callback('Blum', createNextScene(ScenesTypes.blum.wizard.ENTRY)),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(bold(ctx.i18n.t('menu.header')),'\n\n',italic(ctx.i18n.t('menu.body'))), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const sceneId = ctx.update?.callback_query?.data;
    
    try {
      if (sceneId) {
        const nextScene = getNextScene(sceneId)
        if (nextScene) {
          ctx.wizard.state.nextScene = nextScene;
        }
      } else {
        await ctx.sendMessage(ctx.i18n.t('menu.exit'))
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню', e))
    }
    
    return done();
  },
);