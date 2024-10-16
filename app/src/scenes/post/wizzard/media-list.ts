import { Markup } from 'telegraf';
import { bold, fmt} from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import sendTest from '../../../helpers/send-message';
import { Variables } from '../../../models/post/post-model';
import { adminUsers } from '../../../routes/admin-routes';
import { ScenesTypes } from '../../index';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()
const editPhotoHandler = new CallbackQueryWrapper('edit_photo')

export const createMediaListScene = composeWizardScene(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = adminUsers.includes(chat_id)
      const post = (await postController.getPost({
        id: ctx.wizard.state.body_id
      })).item
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
            Markup.button.callback('Назад в меню', nextSceneHandler.create(types.BODY_ITEM), !admin),
          ]
        ],{ columns: 1 }
      )
      await sendTest(ctx, {
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
  async (ctx, done) => {
    const callback_data = ctx.update?.callback_query?.data;
    
    try {
      if (callback_data) {
        nextSceneHandler.on(callback_data, async (value) => {
          ctx.wizard.state.nextScene = value;
        })
        editPhotoHandler.on(callback_data, async (value) => {
          ctx.wizard.state.media_index = value;
          ctx.wizard.state.nextScene = types.MEDIA_PHOTO_ITEM
        })
      }  else {
        await ctx.sendMessage('Вы вышли из сцены Список медиа поста')
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Список медиа поста', e))
    }
    return done();
  },
);