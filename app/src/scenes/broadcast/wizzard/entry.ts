import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { isAdmin } from '../../../routes/admin-routes';
import { ScenesTypes } from '../../index';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

export const createEntryBroadcastScene = composeWizardScene(
  async (ctx) => {
    const chat_id = ctx.chat.id
    
    const admin = isAdmin(chat_id)
    try {
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Получить текущее сообщение', nextSceneHandler.create(types.GET), !admin),
          Markup.button.callback('Создать новое сообщение', nextSceneHandler.create(types.CREATE), !admin),
          Markup.button.callback('Назад в меню', 'back_to', !admin),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(bold('Рассылка'),'\n\n',italic('Выберите интересующее вас действие:')), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Рассылки сообщений', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_data) {
        if (callback_data === 'back_to') {
          await back(ScenesTypes.menu.wizard.SERVICES)
        }
        await nextSceneHandler.on(callback_data, async (value) => {
          await done(value);
        })
      } else {
        await ctx.sendMessage('Вы вышли из Рассылки')
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Рассылка', e));
    }
    
    return;
  },
);