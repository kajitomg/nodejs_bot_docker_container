import { Markup } from 'telegraf';
import { bold, fmt, FmtString, italic, quote, underline } from 'telegraf/format';
import activityController from '../../../controllers/activity-controller';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { formatText } from '../../../helpers/post-template/format-text';
import sendMessage from '../../../helpers/send-message';
import { Activity } from '../../../models/activity/activity-model';
import { Post } from '../../../models/post/post-model';
import { ScenesTypes } from '../../index';
import types from './types';

interface BodyItemProps {
  post_id: number,
  activity_id?: number,
  post?: Partial<Omit<Post, 'id' | 'type' | 'media'>>,
  warning?: string
}

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

export const createCreatePostTemplateScene = composeWizardScene<BodyItemProps>(
  async (ctx) => {
    try {
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Назад', 'back'),
          Markup.button.callback('Назад в меню', nextSceneHandler.create(types.ENTRY)),
        ],{ columns: 2 }
      )
      await sendMessage(
        ctx,{
          text:
            fmt(
              bold('Шаблон поста'),'\n\n',
              italic('Отправьте название для шаблона:')
            ),
          extra: markup
        })
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Сцена создания шаблона поста', e));
    }
    return ctx.wizard.next()
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    const message_text = ctx.message?.['text'];
    try {
      if (callback_data) {
        await nextSceneHandler.on(callback_data, async (value) => {
          await done(value)
        })
        if (callback_data === 'back') {
          await back()
        }
      } else {
        if (message_text) {
          ctx.scene.session.props.post.name = message_text
          await ctx.wizard.next()
        } else {
          ctx.scene.session.props.warning = 'Неверный формат текста!'
          await ctx.wizard.back()
        }
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Сцена создания шаблона поста', e));
    }
    return
  },
  async (ctx) => {
    try {
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Назад', 'back'),
          Markup.button.callback('Назад в меню', nextSceneHandler.create(types.ENTRY)),
        ],{ columns: 2 }
      )
      await sendMessage(
        ctx,{
          text:
            fmt(
              bold('Шаблон поста'),'\n\n',
              italic('Пример шаблон:'),'\n\n',
              quote(
                'Текст', '\n\n',
                bold(underline('Текст со стилями')), '\n\n',
                fmt('Переменная - {{variable}}'), '\n\n',
                fmt(`Переменная со стилями - {{${bold(underline('styled_variable'))}}}`)
              ),'\n\n',
              italic('Отправьте текст шаблона:')
            ),
          extra: markup
        })
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Сцена создания шаблона поста', e));
    }
    return ctx.wizard.next()
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    const message_text = ctx.message?.['text'];
    const message_entities = ctx.message?.['entities'];
    
    try {
      if (callback_data) {
        await nextSceneHandler.on(callback_data, async (value) => {
          await done(value)
        })
        if (callback_data === 'back') {
          await back()
        }
      } else {
        if (message_text) ctx.scene.session.props.post.template = message_text
        if (message_text) ctx.scene.session.props.post.entities = message_entities
        
        const markup = Markup.inlineKeyboard(
          [
            Markup.button.callback('Назад', 'back'),
            Markup.button.callback('Создать шаблон', 'create'),
            Markup.button.callback('Назад в меню', nextSceneHandler.create(types.ENTRY)),
          ],{ columns: 2 }
        )
        
        
        const formatted = formatText(
          ctx.scene.session.props.post?.template,
          ctx.scene.session.props.post?.variables,
          ctx.scene.session.props.post?.entities
        )
        
        const fmtString = new FmtString(formatted.text, formatted.entities)
        
        await sendMessage(
          ctx,{
            text: fmt(
              bold('Шаблон поста'),'\n\n',
              bold(`Название${!ctx.scene.session.props.post?.name ? '*' : ''}: ${ctx.scene.session.props.post?.name || '-'}`),'\n\n',
              quote(fmt(fmtString)),'\n\n',
              ctx.scene.session.props?.warning ? fmt(italic(ctx.scene.session.props?.warning),'\n\n') : '',
              italic('Выберите интересующее вас действие:')
            ),
            extra: markup
          })
        ctx.wizard.next();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Сцена создания шаблона поста', e));
    }
    return
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    try {
      if (callback_data) {
        await nextSceneHandler.on(callback_data, async (value) => {
          await done(value)
        })
        if (callback_data === 'back') {
          await back()
        }
        if (callback_data === 'create') {
          const template = (await postController.createTemplate({
            name: ctx.scene.session.props.post?.name,
            template: ctx.scene.session.props.post?.template,
            entities: ctx.scene.session.props.post?.entities,
          })).item
          if (ctx.scene.session.props.activity_id) {
            const reg = new RegExp(`{{([^}]+)}}`, 'g')
            const variables = ctx.scene.session.props.post?.template.match(reg)?.map((value) => ({name: value.substring(2, value.length - 2)}))
            
            const post = await postController.createBody({
              template_id: template.id,
              name: ctx.scene.session.props.post?.name,
              variables
            })
            const activity: Activity = (await activityController.getActivity({
              id: ctx.scene.session.props.activity_id
            })).item
            await activityController.updateActivity({
              id: ctx.scene.session.props.activity_id,
              body_id: post.item?.id
            })
            if (activity.body_id) {
              await postController.deletePost({
                id: activity.body_id,
              })
            }
          }
        
          const markup = Markup.inlineKeyboard(
            [
              //Markup.button.callback('Создать новый шаблон', nextSceneHandler.create(types.TEMPLATE_CREATE)),
              //Markup.button.callback('Список всех шаблонов', nextSceneHandler.create(types.TEMPLATE_LIST)),
              Markup.button.callback('Назад в меню', nextSceneHandler.create(ScenesTypes.activity.wizard.TEMPLATE_CHANGE)),
            ],{ columns: 2 }
          )
          
          const formatted = formatText(
            ctx.scene.session.props.post?.template,
            ctx.scene.session.props.post?.variables,
            ctx.scene.session.props.post?.entities
          )
          
          const fmtString = new FmtString(formatted.text, formatted.entities)
          
          await sendMessage(
            ctx,{
              text: fmt(
                bold('Шаблон поста'),'\n\n',
                bold(`Название${!ctx.scene.session.props.post?.name ? '*':''}: ${ctx.scene.session.props.post?.name ?? '-'}`),'\n\n',
                quote(fmt(fmtString)),'\n\n',
                bold('Шаблон успешно создан'),'\n\n',
                italic('Выберите интересующее вас действие:')
              ),
              extra: markup
            })
        }
      } else {
        await ctx.sendMessage('Вы покинули сцену "создание шаблона поста"')
        done()
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Сцена создания шаблона поста', e));
    }
    return
  }
);