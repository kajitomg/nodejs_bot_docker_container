import { Markup } from 'telegraf';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { Post } from '../../../models/post/post-model';
import { isAdmin } from '../../../routes/admin-routes';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

interface BodyCreateProps {
  post_id: number,
  post?: Post
}

export const createWizardPostBodyCreate = composeWizardScene<BodyCreateProps>(
  async (ctx) => {
    const chat_id = ctx.chat.id
    const admin = isAdmin(chat_id)
    if (!ctx.scene.session.props.post) {
      const post = await postController.getPost({
        id: ctx.scene.session.props.post_id
      })
      ctx.scene.session.props.post = {
        ...post.item,
        name: undefined
      }
    }
    
    try {
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Изменить название', 'create', !admin),
          Markup.button.callback('Добавить шаблон', 'create', !admin),
          Markup.button.callback('Назад в меню', nextSceneHandler.create(types.CREATE)),
        ],{ columns: 2 }
      )
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание тела поста', e))
    }
  }
)