import { Markup } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { isAdmin } from '../../../routes/admin-routes';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

export const createCreateBroadcastScene = composeWizardScene(
  async (ctx) => {
    const chat_id = ctx.chat.id
    
    const admin = isAdmin(chat_id)
    try {
     
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Назад к списку действий', 'back_to', !admin)
        ],{ columns: 2 }
      )
      await send(ctx, fmt(bold('Введите сообщение:')), markup);
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Рассылки сообщений', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    const message_text = ctx.message?.['text'];
    const message_entities = ctx.message?.['entities'];
    const message_forward_chat = ctx.message?.['forward_from_chat'];
    const message_forward_message_id = ctx.message?.['forward_from_message_id'];
    
    try {
      if (callback_data) {
        if (callback_data === 'back_to') {
          await back(types.ENTRY);
        }
      } else {
        await done(types.GET, {
          ...(message_text && {text: { value: message_text, entities: message_entities, }}),
          ...(message_forward_chat && {forward: { chat_id: message_forward_chat?.id, message_id: message_forward_message_id }})
        })
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Рассылки сообщений', e))
    }
    
    return;
  },
);