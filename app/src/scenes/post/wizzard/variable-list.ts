import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import mandatoryChannelController from '../../../controllers/mandatory-channel-controller';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import sendTest from '../../../helpers/send-message';
import { Variables } from '../../../models/post/post-model';
import { adminUsers } from '../../../routes/admin-routes';
import { ScenesTypes } from '../../index';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()
const goToChannelHandler = CallbackQueryWrapper.goToChannelHandler()

export const createDataListScene = composeWizardScene(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = adminUsers.includes(chat_id)
      const post = (await postController.getPost({
        id: ctx.wizard.state.body_id
      })).item
      const markup = Markup.inlineKeyboard(
        [
          ...(post.variables || []).map((value: Variables) => Markup.button.callback(`${value.name} | ${value.value ? value.value : '-'}`, goToChannelHandler.create(value.name), !admin)),
          Markup.button.callback('Назад в меню', nextSceneHandler.create(types.BODY_ITEM), !admin),
        ],{ columns: 1 }
      )
      await sendTest(ctx, {
        text: fmt(
          bold('Меню Список переменных поста'),
        ),
        extra: markup
      }, {clear_media: true})
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Список каналов ОП', e))
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
        goToChannelHandler.on(callback_data, async (value) => {
          ctx.wizard.state.variable = value
          ctx.wizard.state.nextScene = types.CREATE_VARIABLE;
        })
      }  else {
        await ctx.sendMessage('Вы вышли из сцены Список каналов ОП')
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Список каналов ОП', e))
    }
    return done();
  },
);