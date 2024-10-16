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

export const createEntryPostScene = composeWizardScene(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = adminUsers.includes(chat_id)
      delete ctx.wizard.state?.create_mandatory_channel
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Создать шаблон', nextSceneHandler.create(types.TEMPLATE_CREATE), !admin),
          Markup.button.callback('Список постов', nextSceneHandler.create(types.LIST), !admin),
          Markup.button.callback('Назад в меню', nextSceneHandler.create(ScenesTypes.menu.wizard.SERVICES), !admin),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(bold('Меню Поста'),'\n\n',italic('Выберите интересующее вас действие:')), markup)
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню постов', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_data = ctx.update?.callback_query?.data;
    
    try {
      if (callback_data) {
        nextSceneHandler.on(callback_data, async (value) => {
          ctx.wizard.state.nextScene = value;
        })
      } else {
        await ctx.sendMessage('Вы вышли из сцены Меню постов')
      }
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню постов', e))
    }
    return done();
  },
);