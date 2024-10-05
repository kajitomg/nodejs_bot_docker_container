import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { adminUsers } from '../../../routes/admin-routes';
import types from './types';

export const createCreateMandatoryChannelDescriptionScene = composeWizardScene(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = adminUsers.includes(chat_id)
      
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Назад в меню', createNextScene(types.CREATE), !admin),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(
        bold('Меню Создание канала ОП'),'\n\n',
        italic(`Описание: ${ctx.wizard.state.create_mandatory_channel.description || '-'}`),'\n\n',
        italic('Введите описание канала:')
      ), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const chatId = ctx.chat?.id;
    const callback_query = ctx.update?.callback_query?.data;
    const message_text = ctx.message?.text;
    
    try {
      ctx.telegram.editMessageReplyMarkup(chatId, ctx.wizard.state.delete_message_id, undefined, undefined)
      if (callback_query) {
        const nextScene = getNextScene(callback_query)
        if (nextScene) {
          ctx.wizard.state.nextScene = nextScene;
        }
      } else {
        if (!ctx.wizard.state.create_mandatory_channel.id) {
          ctx.wizard.state.nextScene = types.CREATE_ID;
        } else if (!ctx.wizard.state.create_mandatory_channel.link) {
          ctx.wizard.state.nextScene = types.CREATE_LINK;
        } else if (!ctx.wizard.state.create_mandatory_channel.name) {
          ctx.wizard.state.nextScene = types.CREATE_NAME;
        } else {
          ctx.wizard.state.nextScene = types.CREATE;
        }
        ctx.wizard.state.create_mandatory_channel.description = message_text;
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