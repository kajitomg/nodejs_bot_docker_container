import { Markup } from 'telegraf';
import { bold, fmt} from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import sendMessage from '../../../helpers/send-message';
import { Variables } from '../../../models/post/post-model';
import { adminUsers } from '../../../routes/admin-routes';
import { ScenesTypes } from '../../index';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

export const createWizardPostMediaPhotoItem = composeWizardScene(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = adminUsers.includes(chat_id)
      const post = (await postController.getPost({
        id: ctx.wizard.state.body_id
      })).item
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Удалить фото', 'delete', !admin),
          Markup.button.callback('Назад в меню', nextSceneHandler.create(types.MEDIA_LIST), !admin),
        ],{ columns: 1 }
      )
      await sendMessage(ctx, {
        text: fmt(
          bold('Меню Список медиа поста'),'\n\n',
          fmt(`Название: `, bold(post.media[ctx.wizard.state.media_index]?.name || '-')),
        ),
        media: {
          type: post.media[ctx.wizard.state.media_index].type,
          file_id: post.media[ctx.wizard.state.media_index].id
        },
        extra: markup
      })
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Список медиа поста', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_data = ctx.update?.callback_query?.data;
    
    try {
      if (callback_data) {
        const post = (await postController.getPost({
          id: ctx.wizard.state.body_id
        })).item
        nextSceneHandler.on(callback_data, async (value) => {
          ctx.wizard.state.nextScene = value;
        })
        if (callback_data === 'delete') {
          post.media.splice(ctx.wizard.state.media_index, 1)
          await postController.updatePost({
            id: ctx.wizard.state.body_id,
            media: post.media
          })
          ctx.wizard.state.nextScene = types.MEDIA_LIST;
        }
      }  else {
        await ctx.sendMessage('Вы вышли из сцены Список медиа поста')
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Список медиа поста', e))
    }
    return done();
  },
);