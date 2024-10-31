import { Markup } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import sendTest from '../../../helpers/send-message';
import { Post, Variables } from '../../../models/post/post-model';
import { isAdmin } from '../../../routes/admin-routes';
import types from './types';

const goToChannelHandler = CallbackQueryWrapper.goToChannelHandler()

interface PostVariableListProps {
  post_id: number,
  post?: Post
}

export const createDataListScene = composeWizardScene<PostVariableListProps>(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = isAdmin(chat_id)
      
      const post = (await postController.getPost({
        id: ctx.scene.session.props.post_id
      })).item
      ctx.scene.session.props.post = post
      
      const markup = Markup.inlineKeyboard(
        [
          ...(post.variables || []).map((value: Variables) => Markup.button.callback(`${value.name} | ${value.value ? value.value : '-'}`, goToChannelHandler.create(value.name), !admin)),
          Markup.button.callback('Назад в меню', 'back', !admin),
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
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    const post = ctx.scene.session.props.post
    
    try {
      if (callback_data) {
        if (callback_data === 'back') {
          await back();
        }
        await goToChannelHandler.on(callback_data, async (value) => {
          await done(types.CREATE_VARIABLE, {
            variable_name: value,
            post_id: post.id,
          })
        })
      }  else {
        await ctx.sendMessage('Вы вышли из сцены Список каналов ОП')
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Список каналов ОП', e))
    }
    return;
  },
);