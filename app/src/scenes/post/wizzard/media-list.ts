import { Markup } from 'telegraf';
import { bold, fmt} from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import sendMessage from '../../../helpers/send-message';
import { Post, Variables } from '../../../models/post/post-model';
import { adminUsers } from '../../../routes/admin-routes';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()
const editPhotoHandler = new CallbackQueryWrapper('edit_photo')

interface PostMediaListProps {
  post_id: number,
  post?: Post
}

export const createMediaListScene = composeWizardScene<PostMediaListProps>(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = adminUsers.includes(chat_id)
      
      const post = (await postController.getPost({
        id: ctx.scene.session.props.post_id
      })).item
      ctx.scene.session.props.post = post
      
      const markup = Markup.inlineKeyboard(
        [
          ...(post?.media || []).map((value: Variables, i) => [Markup.button.callback(`${value.name}`, editPhotoHandler.create(i), !admin)]),
          [
            Markup.button.callback('Добавить фото', nextSceneHandler.create(types.CREATE_PHOTO), !admin),
            //Markup.button.callback('Добавить видео', 'add_media', !admin)
          ],
          /*[
            Markup.button.callback('Добавить документ', 'add_media', !admin),
            Markup.button.callback('Добавить аудио', 'add_media', !admin)
          ],*/
          [
            Markup.button.callback('Назад в меню', 'back', !admin),
          ]
        ],{ columns: 1 }
      )
      await sendMessage(ctx, {
        text: fmt(
          bold('Меню Список медиа поста'),
        ),
        extra: markup
      }, {clear_media: true})
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Список медиа поста', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_data) {
        if( callback_data === 'back' ) {
          await back();
        }
        await nextSceneHandler.on(callback_data, async (value) => {
          await done(value, {
            post_id: ctx.scene.session.props.post_id
          });
        })
        await editPhotoHandler.on(callback_data, async (value) => {
          await done(types.MEDIA_PHOTO_ITEM, {
            media_index: value,
            post_id: ctx.scene.session.props.post.id
          });
        })
      }  else {
        await ctx.sendMessage('Вы вышли из сцены Список медиа поста')
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Список медиа поста', e))
    }
    return;
  },
);