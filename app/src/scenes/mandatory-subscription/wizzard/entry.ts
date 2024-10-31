import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { adminUsers } from '../../../routes/admin-routes';
import { ScenesTypes } from '../../index';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

interface MandatoryEntryProps {
  next_scene: string,
  data: Record<string, unknown>
}

export const createEntryMandatoryChannelScene = composeWizardScene<MandatoryEntryProps>(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = adminUsers.includes(chat_id)
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Добавить канал', nextSceneHandler.create(types.CREATE), !admin),
          Markup.button.callback('Список каналов', nextSceneHandler.create(types.LIST), !admin),
          Markup.button.callback('Назад в меню', 'back_to', !admin),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(bold('Меню ОП'),'\n\n',italic('Выберите интересующее вас действие:')), markup)
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню ОП', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_data) {
        if( callback_data === 'back_to' ){
          await back(ScenesTypes.menu.wizard.SERVICES)
        }
        await nextSceneHandler.on(callback_data, async (value) => {
          await done(value);
        })
      } else {
        await ctx.sendMessage('Вы вышли из сцены Меню ОП')
        await done();
      }
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню ОП', e))
    }
    return;
  },
);