import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { Languages } from '../../../models/user/user-model';
import Slices from '../../../slices';
import { ScenesTypes } from '../../index';

export const createMenuProfileScene = composeWizardScene(
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
          Markup.button.callback(ctx.i18n.t('profile.buttons.change_language'), createNextScene(ScenesTypes.language.wizard.ENTRY)),
          Markup.button.callback(ctx.i18n.t('profile.buttons.back'), createNextScene(ScenesTypes.menu.wizard.ENTRY)),
        ],{ columns: 1 }
      )
      await send(ctx, fmt(bold(ctx.i18n.t('profile.name')),'\n\n',italic(ctx.i18n.t('profile.data.choose_action'))), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Профиль', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const sceneId = ctx.update?.callback_query?.data;
    
    ctx.i18n.locale(ctx.scene.state?.options?.language)
    
    try {
      if (sceneId) {
        const nextScene = getNextScene(sceneId)
        if (nextScene) {
          ctx.wizard.state.nextScene = nextScene;
        }
      } else {
        await ctx.sendMessage(ctx.i18n.t('profile.exit', {menu_name: ctx.i18n.t('profile.name')}))
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Профиль', e))
    }
    
    return done();
  },
);