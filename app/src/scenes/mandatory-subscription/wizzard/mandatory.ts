import { Markup } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import mandatoryChannelController from '../../../controllers/mandatory-channel-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import checker from '../../../helpers/checker';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { Languages } from '../../../models/user/user-model';
import Slices from '../../../slices';
import { ScenesTypes } from '../../index';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

export const createMandatoryChannelScene = composeWizardScene(
  async (ctx) => {
    const chat_id = ctx.chat.id
    
    try {
      let language = ctx.scene.state?.options?.language
      
      if(!language) {
        const user = await Slices.user.crud.get({ chat_id })
        language = Languages?.[user.item?.language] || 'ru'
      }
      
      if (ctx.wizard.state.options) {
        ctx.wizard.state.options.language = language
      } else {
        ctx.wizard.state.options = {
          language
        }
      }
      ctx.i18n.locale(language)
      const channels = await mandatoryChannelController.getChannels({
        active: true
      })
      
      const checkSubscribe = async (channel) => {
        return await checker(async (channel) => {
          try {
            const member = await ctx.telegram.getChatMember(channel.channel_id, chat_id)
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
          const member = await ctx.telegram.getChatMember(channel.channel_id, chat_id)
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
        return await ctx.scene.enter(ctx.wizard.state.mandatory_channel_next, ctx.wizard.state)
      }
      
      const buttons = channels.items.map((channel) => Markup.button.url(`${channel.name} | ${channel.subscribe ? '✔️' :'❌'}`, channel.link))
      
      const markup = Markup.inlineKeyboard(
        [
          ...buttons,
          Markup.button.callback(ctx.i18n.t('mandatory_subscription_check.buttons.check_subscription'), nextSceneHandler.create(types.MANDATORY)),
          Markup.button.callback(ctx.i18n.t('mandatory_subscription_check.buttons.back_to',{ menu_name: ctx.i18n.t('games.name') }), nextSceneHandler.create(ScenesTypes.menu.wizard.GAMES)),
        ],{ columns: 1 }
      )
      await send(ctx, fmt(
        bold(ctx.i18n.t('mandatory_subscription_check.name')),'\n\n',
      ), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Проверки подписки ОП', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_data = ctx.update?.callback_query?.data;
    
    try {
      if (callback_data) {
        nextSceneHandler.on(callback_data, async (value) => {
          ctx.wizard.state.nextScene = value;
        })
      }  else {
        await ctx.sendMessage(ctx.i18n.t('mandatory_subscription_check.exit',{ menu_name: ctx.i18n.t('mandatory_subscription_check.name') }))
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Проверки подписки ОП', e))
    }
    return done();
  },
);