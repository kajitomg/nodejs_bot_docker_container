import { Markup } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import mandatoryChannelController from '../../../controllers/mandatory-channel-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import checker from '../../../helpers/checker';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { ScenesTypes } from '../../index';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

interface MandatoryProps {
  next_scene: string,
  data: Record<string, unknown>
}

export const createMandatoryChannelScene = composeWizardScene<MandatoryProps>(
  async (ctx, done) => {
    const chat_id = ctx.chat.id
    
    try {
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
      console.log(subscribe)
      if(subscribe) {
        return await done(ctx.scene.session.props.next_scene, ctx.scene.session.props.data)
      }
      
      const buttons = channels.items.map((channel) => Markup.button.url(`${channel.name} | ${channel.subscribe ? '✔️' :'❌'}`, channel.link))
      
      const markup = Markup.inlineKeyboard(
        [
          ...buttons,
          Markup.button.callback(ctx.i18n.t('mandatory_subscription_check.buttons.check_subscription'), nextSceneHandler.create(types.MANDATORY)),
          Markup.button.callback(ctx.i18n.t('mandatory_subscription_check.buttons.back_to',{ menu_name: ctx.i18n.t('games.name') }), 'back_to'),
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
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_data) {
        if( callback_data === 'back_to' ){
          await back(ScenesTypes.menu.wizard.GAMES);
        }
        await nextSceneHandler.on(callback_data, async (value) => {
          await done(value, {...ctx.scene.session.props});
        })
      }  else {
        await ctx.sendMessage(ctx.i18n.t('mandatory_subscription_check.exit',{ menu_name: ctx.i18n.t('mandatory_subscription_check.name') }))
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Проверки подписки ОП', e))
    }
    return;
  },
);