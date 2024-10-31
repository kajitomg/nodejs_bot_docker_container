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

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

interface MandatoryCreateProps {
  channel: Partial<Omit<IMandatoryChannel, 'id'>>,
  warning: string,
}

export const createCreateMandatoryChannelScene = composeWizardScene<MandatoryCreateProps>(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      if (!ctx.scene.session.props.channel) ctx.scene.session.props.channel = {}
      const channel = ctx.scene.session.props.channel
      
      const admin = isAdmin(chat_id)
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Изменить ID', nextSceneHandler.create(types.CREATE_ID), !admin),
          Markup.button.callback('Изменить ссылку', nextSceneHandler.create(types.CREATE_LINK), !admin),
          Markup.button.callback('Изменить название', nextSceneHandler.create(types.CREATE_NAME), !admin),
          Markup.button.callback('Изменить описание', nextSceneHandler.create(types.CREATE_DESCRIPTION), !admin),
          Markup.button.callback('Добавить канал', 'create', !admin),
          Markup.button.callback('Назад в меню', nextSceneHandler.create(types.ENTRY), !admin),
        ],{ columns: 2 }
      )

      await send(ctx,
        fmt(
          bold('Меню Создание канала ОП'),'\n\n',
          bold(`ID${channel?.channel_id ? '' : '*'}: ${channel?.channel_id || '-'}`),'\n\n',
          bold(`Ссылка${channel?.link ? '' : '*'}: ${channel?.link || '-'}`),'\n\n',
          bold(`Название${channel?.name ? '' : '*'}: ${channel?.name || '-'}`),'\n\n',
          bold(`Описание: ${channel?.description || '-'}`),'\n\n',
          ctx.scene.session.props.warning ? fmt(italic(ctx.scene.session.props?.warning),'\n\n') : '',
          italic('Выберите интересующее вас действие:')
        )
        , markup)
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
    }
    delete ctx.scene.session.props?.warning
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_data = ctx.callbackQuery?.['data'];
    const channel = ctx.scene.session.props.channel
    
    try {
      if (callback_data) {
        await nextSceneHandler.on(callback_data, async (value) => {
          switch (value) {
            case types.CREATE_ID: {
              await done(value, {
                channel
              })
              return
            }
            case types.CREATE_LINK: {
              await done(value, {
                channel
              })
              return
            }
            case types.CREATE_NAME: {
              await done(value, {
                channel
              })
              return
            }
            case types.CREATE_DESCRIPTION: {
              await done(value, {
                channel
              })
              return
            }
            default: {
              await done(value)
            }
          }
        })
        if (callback_data === 'create') {
          if ( channel.channel_id && channel.link && channel.name ) {
            ctx.wizard.next();
            return ctx.wizard['steps'][ctx.wizard.cursor](ctx);
          } else {
            ctx.scene.session.props.warning = 'Заполните все обязательные поля*';
            await done(types.CREATE);
          }
        }
      } else {
        await ctx.sendMessage('Вы вышли из сцены Создание канала ОП')
        await done();
      }
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
    }
    return;
  },
  async (ctx) => {
    const channel = ctx.scene.session.props?.channel
    try {
      await mandatoryChannelController.createChannel({
        channel_id: channel.channel_id,
        name: channel.name,
        description: channel.description,
        link: channel.link,
      })
      
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Добавить новый канал', nextSceneHandler.create(types.CREATE)),
          Markup.button.callback('Назад в меню', nextSceneHandler.create(types.ENTRY)),
        ],{ columns: 2 }
      )
      await send(ctx,
        fmt(
          bold('Меню Создание канала ОП'),'\n\n',
          italic('Канал успешно добавлен!','\n\n',
          bold(`ID ${channel?.channel_id || '*'}`),'\n\n',
          bold(`Ссылка ${channel?.link || '*'}`),'\n\n',
          bold(`Название ${channel?.name || '*'}`),'\n\n',
          bold(`Описание ${channel?.description || '*'}`)
          ))
        , markup)
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
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
        await ctx.sendMessage('Вы вышли из сцены Создание канала ОП')
        await done();
      }
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
    }
    return;
  },
);