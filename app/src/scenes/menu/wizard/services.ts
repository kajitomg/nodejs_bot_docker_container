import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { Languages } from '../../../models/user/user-model';
import { adminUsers, isAdmin } from '../../../routes/admin-routes';
import Slices from '../../../slices';
import { ScenesTypes } from '../../index';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

export const createMenuServicesScene = composeWizardScene(
  async (ctx) => {
    const chat_id = ctx.chat.id
    try {
      
      const admin = isAdmin(chat_id)
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback(ctx.i18n.t('services.buttons.mandatory_subscription'), nextSceneHandler.create(ScenesTypes.mandatorySubscription.wizard.ENTRY), !admin),
          Markup.button.callback(ctx.i18n.t('services.buttons.broadcast'), nextSceneHandler.create(ScenesTypes.broadcast.wizard.ENTRY), !admin),
          //Markup.button.callback('Шаблон поста', nextSceneHandler.create(ScenesTypes.post.wizard.ENTRY), !admin),
          Markup.button.callback(ctx.i18n.t('services.buttons.back'), nextSceneHandler.create(ScenesTypes.menu.wizard.ENTRY)),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(bold(ctx.i18n.t('services.name')),'\n\n',italic(ctx.i18n.t('services.data.choose_action'))), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Сервисы', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_data = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_data) {
        await nextSceneHandler.on(callback_data, async (value) => {
          await done(value);
        })
      } else {
        await ctx.sendMessage(ctx.i18n.t('services.exit', {menu_name: ctx.i18n.t('services.name')}))
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Сервисы', e))
    }
    
    return;
  },
);