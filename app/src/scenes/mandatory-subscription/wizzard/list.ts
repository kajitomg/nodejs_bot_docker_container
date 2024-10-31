import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import mandatoryChannelController from '../../../controllers/mandatory-channel-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { isAdmin } from '../../../routes/admin-routes';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()
const goToChannelHandler = CallbackQueryWrapper.goToChannelHandler()

export const createListMandatoryChannelScene = composeWizardScene(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = isAdmin(chat_id)
      const list = await mandatoryChannelController.getChannels()
      
      const markup = Markup.inlineKeyboard(
        [
          ...list.items.map((channel) => Markup.button.callback(`${channel.name} | ${channel.active ? '✔️' :'❌'}`, goToChannelHandler.create(channel.id), !admin)),
          Markup.button.callback('Назад в меню', 'back', !admin),
        ],{ columns: 1 }
      )
      await send(ctx, fmt(
        bold('Меню Список каналов ОП'),'\n\n',
        italic('Страница: 1/1')
      ), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Список каналов ОП', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_data) {
        if (callback_data === 'back') {
          await back();
        }
        await goToChannelHandler.on(callback_data, async (value) => {
          await done(types.ITEM, {
            channel_id: value
          });
        })
      }  else {
        await ctx.sendMessage('Вы вышли из сцены Список каналов ОП')
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Список каналов ОП', e))
    }
    return;
  },
);