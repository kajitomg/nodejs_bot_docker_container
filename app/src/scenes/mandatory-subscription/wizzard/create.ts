import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import mandatoryChannelController from '../../../controllers/mandatory-channel-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { adminUsers } from '../../../routes/admin-routes';
import types from './types';

export const createCreateMandatoryChannelScene = composeWizardScene(
  async (ctx) => {
    try {
      ctx.wizard.state.create_mandatory_channel = {
        id: null,
        link: null,
        name: null,
        description: null,
        ...ctx.wizard.state.create_mandatory_channel,
      }
      const chat_id = ctx.chat.id
      
      const admin = adminUsers.includes(chat_id)
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Изменить ID', createNextScene(types.CREATE_ID), !admin),
          Markup.button.callback('Изменить ссылку', createNextScene(types.CREATE_LINK), !admin),
          Markup.button.callback('Изменить название', createNextScene(types.CREATE_NAME), !admin),
          Markup.button.callback('Изменить описание', createNextScene(types.CREATE_DESCRIPTION), !admin),
          Markup.button.callback('Добавить канал', 'create', !admin),
          Markup.button.callback('Назад в меню', createNextScene(types.ENTRY), !admin),
        ],{ columns: 2 }
      )

      await send(ctx,
        fmt(
          bold('Меню Создание канала ОП'),'\n\n',
          bold(`ID${ctx.wizard.state?.create_mandatory_channel?.id ? '' : '*'}: ${ctx.wizard.state?.create_mandatory_channel?.id || '-'}`),'\n\n',
          bold(`Ссылка${ctx.wizard.state?.create_mandatory_channel?.link ? '' : '*'}: ${ctx.wizard.state?.create_mandatory_channel?.link || '-'}`),'\n\n',
          bold(`Название${ctx.wizard.state?.create_mandatory_channel?.name ? '' : '*'}: ${ctx.wizard.state?.create_mandatory_channel?.name || '-'}`),'\n\n',
          bold(`Описание: ${ctx.wizard.state?.create_mandatory_channel?.description || '-'}`),'\n\n',
          ctx.wizard.state?.create_mandatory_channel?.warning ? fmt(italic(ctx.wizard.state?.create_mandatory_channel?.warning),'\n\n') : '',
          italic('Выберите интересующее вас действие:')
        )
        , markup)
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
    }
    delete ctx.wizard.state?.create_mandatory_channel.warning
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_query = ctx.update?.callback_query?.data;
    
    try {
      if (callback_query) {
        const nextScene = getNextScene(callback_query)
        if (nextScene) {
          ctx.wizard.state.nextScene = nextScene;
        }
        if (callback_query === 'create') {
          if ( ctx.wizard.state.create_mandatory_channel.id && ctx.wizard.state.create_mandatory_channel.link && ctx.wizard.state.create_mandatory_channel.name ) {
            ctx.wizard.next();
            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
          } else {
            ctx.wizard.state.create_mandatory_channel.warning = 'Заполните все обязательные поля*';
            ctx.wizard.state.nextScene = types.CREATE;
          }
        }
      } else {
        delete ctx.wizard.state.create_mandatory_channel
        await ctx.sendMessage('Вы вышли из сцены Создание канала ОП')
      }
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
    }
    return done();
  },
  async (ctx) => {
    try {
      
      await mandatoryChannelController.createChannel({
        channel_id: ctx.wizard.state.create_mandatory_channel.id,
        name: ctx.wizard.state.create_mandatory_channel.name,
        description: ctx.wizard.state.create_mandatory_channel.description,
        link: ctx.wizard.state.create_mandatory_channel.link,
      })
      
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Добавить новый канал', createNextScene(types.CREATE)),
          Markup.button.callback('Назад в меню', createNextScene(types.ENTRY)),
        ],{ columns: 2 }
      )
      await send(ctx,
        fmt(
          bold('Меню Создание канала ОП'),'\n\n',
          italic('Канал успешно добавлен!','\n\n',
          bold(`ID ${ctx.wizard.state?.create_mandatory_channel?.id || '*'}`),'\n\n',
          bold(`Ссылка ${ctx.wizard.state?.create_mandatory_channel?.link || '*'}`),'\n\n',
          bold(`Название ${ctx.wizard.state?.create_mandatory_channel?.name || '*'}`),'\n\n',
          bold(`Описание ${ctx.wizard.state?.create_mandatory_channel?.description || '*'}`)
          ))
        , markup)
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_query = ctx.update?.callback_query?.data;
    
    try {
      if (callback_query) {
        const nextScene = getNextScene(callback_query)
        if (nextScene) {
          ctx.wizard.state.nextScene = nextScene;
        }
      } else {
        await ctx.sendMessage('Вы вышли из сцены Создание канала ОП')
      }
      delete ctx.wizard.state.create_mandatory_channel
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
    }
    return done();
  },
);