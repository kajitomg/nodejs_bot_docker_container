import { Markup } from 'telegraf';
import { bold, fmt, FmtString, italic, quote, underline } from 'telegraf/format';
import activityController from '../../../controllers/activity-controller';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { formatText } from '../../../helpers/post-template/format-text';
import sendMessage from '../../../helpers/send-message';
import { Post } from '../../../models/post/post-model';
import { ScenesTypes } from '../../index';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()
const createTemplateHandler = new CallbackQueryWrapper('create_template')

interface BodyItemProps {
  activity_id?: number,
  post?: Partial<Omit<Post, 'id' | 'type' | 'media'>>,
  warning?: string
}

export const createWizardPostTemplateCreate = composeWizardScene<BodyItemProps>(
  async (ctx) => {
    if (!ctx.scene.session.props.post) ctx.scene.session.props.post = {}
    
    try {
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Назад в меню', nextSceneHandler.create(ScenesTypes.activity.wizard.TEMPLATE_CHANGE)),
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
                fmt('Переменная со стилями - {{',bold(underline('styled_variable')),'}}')
              ),'\n\n',
              italic('Введите текст шаблон:')
            ),
          extra: markup
        })
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Сцена создания шаблона поста', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_data = ctx.callbackQuery?.['data'];
    const message_text = ctx.message?.['text'];
    const message_entities = ctx.message?.['entities']
    
    let next_scene
    
    try {
      await sendMessage(ctx, {}, {clear_markup: true})
      
      if (callback_data) {
        await nextSceneHandler.on(callback_data, async (value) => {
          next_scene = value;
        })
        await done(next_scene);
      } else {
        
        if (message_text) ctx.scene.session.props.post.template = message_text
        if (message_text) ctx.scene.session.props.post.entities = message_entities
        
        const markup = Markup.inlineKeyboard(
          [
            Markup.button.callback('Назад в меню', nextSceneHandler.create(ScenesTypes.activity.wizard.TEMPLATE_CHANGE)),
          ],{ columns: 2 }
        )
        await sendMessage(
          ctx,{
            text:
              fmt(
                bold('Шаблон поста'),'\n\n',
                italic('Введите название шаблона:')
              ),
            extra: markup
          })
        await ctx.wizard.next();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Сцена создания шаблона поста', e))
    }
    return;
  },
  async (ctx, done) => {
    const callback_data = ctx.callbackQuery?.['data'];
    const message_text = ctx.message?.['text'];
    
    let next_scene
    
    try {
      await sendMessage(ctx, {}, {clear_markup: true})
      
      if (callback_data) {
        await nextSceneHandler.on(callback_data, async (value) => {
          next_scene = value;
        })
        await done(next_scene);
      } else {
        
        if (message_text) ctx.scene.session.props.post.name = message_text
        
        const markup = Markup.inlineKeyboard(
          [
            Markup.button.callback('Назад в меню', nextSceneHandler.create(ScenesTypes.activity.wizard.TEMPLATE_CHANGE)),
            Markup.button.callback('Создать шаблон', createTemplateHandler.create('create')),
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
        await ctx.wizard.next();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Сцена создания шаблона поста', e))
    }
    return;
  },
  async (ctx, done) => {
    const callback_data = ctx.callbackQuery?.['data'];
    
    let next_scene
    
    try {
      if (callback_data) {
        await nextSceneHandler.on(callback_data, async (value) => {
          next_scene = value;
        })
        await createTemplateHandler.on(callback_data, async (value) => {
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
            console.log(post.item, post.item.id)
            await activityController.updateActivity({
              id: ctx.scene.session.props.activity_id,
              body_id: post.item?.id
            })
            
          }
          const markup = Markup.inlineKeyboard(
            [
              //Markup.button.callback('Создать новый шаблон', nextSceneHandler.create(types.TEMPLATE_CREATE)),
              //Markup.button.callback('Список всех шаблонов', nextSceneHandler.create(types.TEMPLATE_LIST)),
              Markup.button.callback('Назад в меню', 'back'),
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
        })
        await ctx.wizard.next();
      } else {
        await sendMessage(ctx,{ text: 'Вы вышли из сцены создания шаблона поста' })
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Сцена создания шаблона поста', e))
    }
    return;
  },
  
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_data) {
        if (callback_data === 'back') {
          await back();
        }
      } else {
        await sendMessage(ctx,{ text: 'Вы вышли из сцены создания шаблона поста' });
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Сцена создания шаблона поста', e))
    }
    return;
  }
)