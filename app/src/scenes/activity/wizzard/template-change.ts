import { Markup } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import sendTest from '../../../helpers/send-message';
import { Languages } from '../../../models/user/user-model';
import { adminUsers } from '../../../routes/admin-routes';
import Slices from '../../../slices';
import { ScenesTypes } from '../../index';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

export const createWizardActivityTemplateChange = composeWizardScene(
  async (ctx) => {
    const chat_id = ctx.chat.id
    
    const admin = adminUsers.includes(chat_id)
    let language = ctx.scene.state?.options?.language
    try {
      const activity = await Slices.activity.crud.get({
        data: {
          id: ctx.wizard.state.activity_id
        }
      })
      if(!language) {
        const user = await Slices.user.crud.get({ chat_id })
        language = Languages?.[user.item?.language] || 'ru'
      }
      
      ctx.scene.state = {
        ...ctx.scene.state,
        options: {
          ...ctx.scene.state.options,
          language
        }
      }
      ctx.i18n.locale(language)
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Создать шаблон', nextSceneHandler.create(ScenesTypes.post.wizard.TEMPLATE_CREATE), !admin),
          //Markup.button.callback('Выбрать шаблон', nextSceneHandler.create(ScenesTypes.post.wizard.TEMPLATE_LIST), !admin),
          Markup.button.callback('Назад', nextSceneHandler.create(types.ITEM))
        ],{ columns: 2 }
      )
      
      await sendTest(ctx, {
        text: fmt(bold(`${activity.item.name} «${ctx.wizard.state.options.game?.name}»`), '\n\n', bold('Выберите интересующее вас действие:')),
        extra: markup
      }, {clear_media: true})
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Активности', e))
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
      } else {
        await ctx.sendMessage(`ВЫ покинули меню «Активность ${ctx.wizard.state.options?.game?.name || ''}»`)
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Активности', e))
    }
    
    return done();
  },
);