import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import sendMessage from '../../../helpers/send-message';
import { IMandatoryChannel } from '../../../models/mandatory-channel/mandatory-channel';
import { isAdmin } from '../../../routes/admin-routes';
import types from './types';

interface MandatoryCreateDescriptionProps {
  channel: Partial<Omit<IMandatoryChannel, 'id'>>
}

export const createCreateMandatoryChannelDescriptionScene = composeWizardScene<MandatoryCreateDescriptionProps>(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = isAdmin(chat_id)
      
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Назад в меню', 'back', !admin),
        ],{ columns: 2 }
      )
      await sendMessage(ctx, {
        text: fmt(
          bold('Меню Создание канала ОП'),'\n\n',
          italic(`Описание: ${ctx.scene.session.props.channel.description || '-'}`),'\n\n',
          italic('Введите описание канала:')
        ),
        extra: markup
      })
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    const message_text = ctx.message?.['text'];
    const channel = ctx.scene.session.props.channel
    
    try {
      await sendMessage(ctx, {}, {clear_markup: true})
      
      if (callback_data) {
        if (callback_data === 'back') {
          await back()
        }
      } else {
        const channel_updated = {
          ...channel,
          description: message_text
        }
        if (!channel.channel_id) {
          await done(types.CREATE_ID, {
            channel: channel_updated
          });
        } else if (!channel.link) {
          await done(types.CREATE_LINK, {
            channel: channel_updated
          });
        } else if (!channel.name) {
          await done(types.CREATE_NAME, {
            channel: channel_updated
          });
        } else {
          await back(types.CREATE, {
            channel: channel_updated
          });
        }
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
      await done();
    }
    return;
  },
);