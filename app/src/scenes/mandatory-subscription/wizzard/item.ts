import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import mandatoryChannelController from '../../../controllers/mandatory-channel-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import types from './types';

const ToItemUpdate = new CallbackWrapper('to_item_update')

export const createItemMandatoryChannelScene = composeWizardScene(
  async (ctx) => {
    try {
      const item = await mandatoryChannelController.getChannel({
        id: ctx.wizard.state?.mandatory_channel_item?.id
      })
      
      ctx.wizard.state.item_mandatory_channel = {
        id: item.item.channel_id,
        link: item.item.link,
        name: item.item.name,
        description: item.item.description,
        active: item.item.active,
      }
      
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Изменить название', ToItemUpdate.create('name')),
          Markup.button.callback('Изменить описание', ToItemUpdate.create('description')),
          Markup.button.callback('Изменить ID', ToItemUpdate.create('channel_id')),
          Markup.button.callback('Изменить ссылку', ToItemUpdate.create('link')),
          Markup.button.callback(item.item.active ? 'Выключить' : 'Включить', ToItemUpdate.create('active')),
          Markup.button.callback('Назад в меню', createNextScene(types.LIST)),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(
        bold('Меню Канал ОП'),'\n\n',
        bold(`Название: ${item.item?.name || '-'}`),'\n\n',
        bold(`Описание: ${item.item?.description || '-'}`),'\n\n',
        bold(`ID: ${item.item?.channel_id || '-'}`),'\n\n',
        bold(`Активирован: ${item.item?.active ? '✔️' :'❌'}`),'\n\n',
        bold(`Ссылка: ${item.item?.link || '-'}`)
      ), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Канал ОП', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_query = ctx.update?.callback_query?.data;
    
    try {
      if (callback_query) {
        const nextScene = getNextScene(callback_query)
        const toItemUpdate = ToItemUpdate.get(callback_query)
        if (nextScene) {
          ctx.wizard.state.nextScene = nextScene;
        }
        if (toItemUpdate) {
          ctx.wizard.state.item_mandatory_channel_update = toItemUpdate
          ctx.wizard.state.nextScene = types.ITEM_UPDATE;
          if(toItemUpdate === 'active') {
            await mandatoryChannelController.updateChannel({
              id: ctx.wizard.state?.mandatory_channel_item?.id,
              [ctx.wizard.state.item_mandatory_channel_update]: !ctx.wizard.state.item_mandatory_channel.active
            })
            ctx.wizard.state.nextScene = types.ITEM;
            delete ctx.wizard.state.item_mandatory_channel_update
          }
        }
      }  else {
        await ctx.sendMessage('Вы вышли из Меню Канал ОП')
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Канал ОП', e))
    }
    return done();
  },
);