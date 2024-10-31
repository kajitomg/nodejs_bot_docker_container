import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { isAdmin } from '../../../routes/admin-routes';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

export const createEntryScene = composeWizardScene(
  async (ctx) => {
    const chat_id = ctx.chat.id
    try {
      const admin = isAdmin(chat_id)
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback(ctx.i18n.t('menu.buttons.games'), nextSceneHandler.create(types.GAMES)),
          Markup.button.callback(ctx.i18n.t('menu.buttons.profile'), nextSceneHandler.create(types.PROFILE)),
          Markup.button.callback(ctx.i18n.t('menu.buttons.services'), nextSceneHandler.create(types.SERVICES), !admin),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(bold(ctx.i18n.t('menu.name')),'\n\n',italic(ctx.i18n.t('menu.data.choose_action'))), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Главное меню', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_data = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_data) {
        await nextSceneHandler.on(callback_data, async (value) => {
          await done(value, {test: 'test'})
        })
      } else {
        await ctx.sendMessage(ctx.i18n.t('menu.exit', {menu_name:ctx.i18n.t('menu.name')}))
        await done()
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Главное меню', e))
    }
    
    return;
  },
);