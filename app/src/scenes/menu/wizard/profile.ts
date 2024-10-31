import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { ScenesTypes } from '../../index';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

export const createMenuProfileScene = composeWizardScene(
  async (ctx) => {
    try {
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback(ctx.i18n.t('profile.buttons.change_language'), nextSceneHandler.create(ScenesTypes.language.wizard.ENTRY)),
          Markup.button.callback(ctx.i18n.t('profile.buttons.back'), 'back_to'),
        ],{ columns: 1 }
      )
      await send(ctx, fmt(bold(ctx.i18n.t('profile.name')),'\n\n',italic(ctx.i18n.t('profile.data.choose_action'))), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Профиль', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_data) {
        await nextSceneHandler.on(callback_data, async (value) => {
          await done(value)
        })
        if ( callback_data === 'back_to' ) {
          await back(ScenesTypes.menu.wizard.ENTRY);
        }
      } else {
        await ctx.sendMessage(ctx.i18n.t('profile.exit', {menu_name: ctx.i18n.t('profile.name')}))
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Профиль', e))
    }
    
    return;
  },
);