import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { Languages } from '../../../models/user/user-model';
import { adminUsers } from '../../../routes/admin-routes';
import Slices from '../../../slices';
import types from './types';

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
      const admin = adminUsers.includes(chat_id)
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback(ctx.i18n.t('menu.buttons.games'), createNextScene(types.GAMES)),
          Markup.button.callback(ctx.i18n.t('menu.buttons.profile'), createNextScene(types.PROFILE)),
          Markup.button.callback(ctx.i18n.t('menu.buttons.services'), createNextScene(types.SERVICES), !admin),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(bold(ctx.i18n.t('menu.name')),'\n\n',italic(ctx.i18n.t('menu.data.choose_action'))), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Главное меню', e))
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
        await ctx.sendMessage(ctx.i18n.t('menu.exit', {menu_name:ctx.i18n.t('menu.name')}))
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Главное меню', e))
    }
    
    return done();
  },
);