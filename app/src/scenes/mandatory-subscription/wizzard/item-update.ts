import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import mandatoryChannelController from '../../../controllers/mandatory-channel-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { adminUsers } from '../../../routes/admin-routes';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

export const createItemUpdateMandatoryChannelScene = composeWizardScene(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = adminUsers.includes(chat_id)
      
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Назад в меню', nextSceneHandler.create(types.ITEM), !admin),
        ],{ columns: 2 }
      )
      const message = await send(ctx, fmt(
        bold('Меню Изменение канала ОП'),'\n\n',
        italic(`${ctx.wizard.state.item_mandatory_channel_update}: ${ctx.wizard.state?.update_mandatory_channel?.[ctx.wizard.state.item_mandatory_channel_update] || '-'}`),'\n\n',
        italic('Отправьте текст:')
      ), markup)
      //@ts-ignore
      ctx.wizard.state.delete_message_id = message?.message_id
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const chatId = ctx.chat?.id;
    const callback_data = ctx.update?.callback_query?.data;
    const message_text = ctx.message?.text;
    
    try {
      ctx.telegram.editMessageReplyMarkup(chatId, ctx.wizard.state.delete_message_id, undefined, undefined)
      
      if (callback_data) {
        nextSceneHandler.on(callback_data, async (value) => {
          ctx.wizard.state.nextScene = value;
        })
      } else {
        ctx.wizard.state.nextScene = types.ITEM;
        await mandatoryChannelController.updateChannel({
          id: ctx.wizard.state?.mandatory_channel_item?.id,
          [ctx.wizard.state.item_mandatory_channel_update]: message_text
        })
        delete ctx.wizard.state.item_mandatory_channel_update
      }
      if (ctx.wizard.state.warning) {
        delete ctx.wizard.state.warning;
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
    }
    return done();
  },
);