import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import mandatoryChannelController from '../../../controllers/mandatory-channel-controller';
import { HandlerError } from '../../../exceptions/api-error';
import checker from '../../../helpers/checker';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createGoToChannel } from '../../../helpers/go-to-channel';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import types from './types';
const reqChannelIDs = ['-1002216264610', '-1002206346301']

export const createMandatoryChannelScene = composeWizardScene(
  async (ctx) => {
    const chatId = ctx.chat.id
    
    try {
      const channels = await mandatoryChannelController.getChannels({
        active: true
      })
      
      const checkSubscribe = async (channel) => {
        return await checker(async (channel) => {
          try {
            const member = await ctx.telegram.getChatMember(channel.channel_id, chatId)
            if (member.status != "member" && member.status != "administrator" && member.status != "creator"){
              return false;
            } else {
              return true;
            }
          } catch (e) {
            if (e.response.error_code === 400) {
              console.error(new HandlerError(400, 'Ошибка: Меню Проверки подписки ОП', e))
              
              return true
            }
          }
        }, channel)
      }
      const subscribe = await checker(async (channel) => {
        try {
          const member = await ctx.telegram.getChatMember(channel.channel_id, chatId)
          if (member.status != "member" && member.status != "administrator" && member.status != "creator"){
            channel.subscribe = false
            return false;
          } else {
            channel.subscribe = true
            return true;
          }
        } catch (e) {
          if (e.response.error_code === 400) {
            console.error(new HandlerError(400, 'Ошибка: Меню Проверки подписки ОП', e))
            return true
          }
        }
      }, ...channels.items)
      
      if(subscribe) {
        return await ctx.scene.enter(ctx.wizard.state.mandatory_channel_next)
      }
      
      const buttons = channels.items.map((channel) => Markup.button.url(`${channel.name} | ${channel.subscribe ? '✔️' :'❌'}`, channel.link))
      
      const markup = Markup.inlineKeyboard(
        [
          ...buttons,
          Markup.button.callback('Проверить подписки', createNextScene(types.MANDATORY)),
          Markup.button.callback('Назад в меню', createNextScene(types.LIST)),
        ],{ columns: 1 }
      )
      await send(ctx, fmt(
        bold('Меню Проверки подписки ОП'),'\n\n',
      ), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Проверки подписки ОП', e))
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
      }  else {
        await ctx.sendMessage('Вы вышли из Меню Проверки подписки ОП')
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Проверки подписки ОП', e))
    }
    return done();
  },
);