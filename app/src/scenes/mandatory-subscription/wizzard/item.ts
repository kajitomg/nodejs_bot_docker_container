import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import mandatoryChannelController from '../../../controllers/mandatory-channel-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { IMandatoryChannel } from '../../../models/mandatory-channel/mandatory-channel';
import { isAdmin } from '../../../routes/admin-routes';
import types from './types';

const updateChannelHandler = new CallbackQueryWrapper('update_channel')
const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

interface MandatoryItemProps {
  channel_id: number,
  channel?: Partial<IMandatoryChannel>,
}

export const createItemMandatoryChannelScene = composeWizardScene<MandatoryItemProps>(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = isAdmin(chat_id)
      const channel = (await mandatoryChannelController.getChannel({
        id: ctx.scene.session.props?.channel_id
      })).item
      
      ctx.scene.session.props.channel = {
        ...channel.dataValues
      }
      
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Изменить название', updateChannelHandler.create('name'), !admin),
          Markup.button.callback('Изменить описание', updateChannelHandler.create('description'), !admin),
          Markup.button.callback('Изменить ID', updateChannelHandler.create('channel_id'), !admin),
          Markup.button.callback('Изменить ссылку', updateChannelHandler.create('link'), !admin),
          Markup.button.callback(channel.active ? 'Выключить' : 'Включить', 'active', !admin),
          Markup.button.callback('Назад в меню', 'back', !admin),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(
        bold('Меню Канал ОП'),'\n\n',
        bold(`Название: ${channel?.name || '-'}`),'\n\n',
        bold(`Описание: ${channel?.description || '-'}`),'\n\n',
        bold(`ID: ${channel?.channel_id || '-'}`),'\n\n',
        bold(`Активирован: ${channel?.active ? '✔️' :'❌'}`),'\n\n',
        bold(`Ссылка: ${channel?.link || '-'}`)
      ), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Канал ОП', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_query = ctx.callbackQuery?.['data'];
    const channel = ctx.scene.session.props.channel
    
    try {
      if (callback_query) {
        if( callback_query === 'back' ){
          await back();
        }
        if( callback_query === 'active' ) {
          await mandatoryChannelController.updateChannel({
            id: channel?.id,
            active: !channel.active
          })
          await done(types.ITEM, {
            channel_id: ctx.scene.session.props.channel_id
          });
        }
        await nextSceneHandler.on(callback_query, async (value) => {
          await done(value);
        })
        await updateChannelHandler.on(callback_query, async (value) => {
          await done(types.ITEM_UPDATE, {
            field_name: value,
            channel
          })
        })
      }  else {
        await ctx.sendMessage('Вы вышли из Меню Канал ОП')
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Канал ОП', e))
    }
    return;
  },
);