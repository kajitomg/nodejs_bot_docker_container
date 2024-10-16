import { Markup } from 'telegraf';
import { bold, fmt, FmtString, italic, quote, underline } from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { formatText } from '../../../helpers/post-template/format-text';
import sendMessage from '../../../helpers/send-message';
import Slices from '../../../slices';
import { ScenesTypes } from '../../index';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()
const createTemplateHandler = new CallbackQueryWrapper('create_template')

export const createWizardPostTemplateCreate = composeWizardScene(
  async (ctx) => {
    if (!ctx.wizard.state.post_template) ctx.wizard.state.post_template = {}
    
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
    const callback_data = ctx.update?.callback_query?.data;
    const message_text = ctx.message?.text;
    const message_entities = ctx.message?.entities
    
    try {
      await sendMessage(ctx, {}, {clear_markup: true})
      
      if (callback_data) {
        await nextSceneHandler.on(callback_data, async (value) => {
          delete ctx.wizard.state.post_template
          ctx.wizard.state.nextScene = value;
        })
      } else {
        //const reg = new RegExp(`{{([^}]+)}}`, 'g')
        //const variables = message_text.match(reg)?.map((value) => ({name: value.substring(2, value.length - 2)}))
        
        if (message_text) ctx.wizard.state.post_template.template = message_text
        if (message_text) ctx.wizard.state.post_template.entities = message_entities
        
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
        return ctx.wizard.next();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Сцена создания шаблона поста', e))
    }
    return done();
  },
  async (ctx, done) => {
    const callback_data = ctx.update?.callback_query?.data;
    const message_text = ctx.message?.text;
    
    try {
      await sendMessage(ctx, {}, {clear_markup: true})
      
      if (callback_data) {
        await nextSceneHandler.on(callback_data, async (value) => {
          delete ctx.wizard.state.post_template
          ctx.wizard.state.nextScene = value;
        })
      } else {
        
        if (message_text) ctx.wizard.state.post_template.name = message_text
        
        const markup = Markup.inlineKeyboard(
          [
            Markup.button.callback('Назад в меню', nextSceneHandler.create(ScenesTypes.activity.wizard.TEMPLATE_CHANGE)),
            Markup.button.callback('Создать шаблон', createTemplateHandler.create('create')),
          ],{ columns: 2 }
        )
        
        const formatted = formatText(
          ctx.wizard.state.post_template?.template,
          ctx.wizard.state.post_template?.variables,
          ctx.wizard.state.post_template?.entities
        )
        
        const fmtString = new FmtString(formatted.text, formatted.entities)
        
        await sendMessage(
          ctx,{
            text: fmt(
              bold('Шаблон поста'),'\n\n',
              bold(`Название${!ctx.wizard.state.post_template?.name ? '*' : ''}: ${ctx.wizard.state.post_template?.name || '-'}`),'\n\n',
              quote(fmt(fmtString)),'\n\n',
              ctx.wizard.state.post_template?.warning ? fmt(italic(ctx.wizard.state.post_template?.warning),'\n\n') : '',
              italic('Выберите интересующее вас действие:')
            ),
            extra: markup
          })
        return ctx.wizard.next();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Сцена создания шаблона поста', e))
    }
    return done();
  },
  async (ctx, done) => {
    const callback_data = ctx.update?.callback_query?.data;
    
    try {
      if (callback_data) {
        await nextSceneHandler.on(callback_data, async (value) => {
          delete ctx.wizard.state.post_template
          ctx.wizard.state.nextScene = value;
        })
        await createTemplateHandler.on(callback_data, async (value) => {
          await postController.createTemplate({
            name: ctx.wizard.state.post_template?.name,
            template: ctx.wizard.state.post_template?.template,
            entities: ctx.wizard.state.post_template?.entities,
          })
          if (ctx.wizard.state.activity_id) {
            const reg = new RegExp(`{{([^}]+)}}`, 'g')
            const variables = ctx.wizard.state.post_template?.template.match(reg)?.map((value) => ({name: value.substring(2, value.length - 2)}))
            const post = await postController.createBody({
              name: ctx.wizard.state.post_template?.name,
              template: ctx.wizard.state.post_template?.template,
              entities: ctx.wizard.state.post_template?.entities,
              variables
            })
            await Slices.activity.crud.update({data:{
              id: ctx.wizard.state.activity_id,
              body_id: post.item?.id
            }})
            
          }
          const markup = Markup.inlineKeyboard(
            [
              //Markup.button.callback('Создать новый шаблон', nextSceneHandler.create(types.TEMPLATE_CREATE)),
              //Markup.button.callback('Список всех шаблонов', nextSceneHandler.create(types.TEMPLATE_LIST)),
              Markup.button.callback('Назад в меню', nextSceneHandler.create(ScenesTypes.activity.wizard.TEMPLATE_CHANGE)),
            ],{ columns: 2 }
          )
          
          const formatted = formatText(
            ctx.wizard.state.post_template?.template,
            ctx.wizard.state.post_template?.variables,
            ctx.wizard.state.post_template?.entities
          )
          
          const fmtString = new FmtString(formatted.text, formatted.entities)
          
          await sendMessage(
            ctx,{
              text: fmt(
                bold('Шаблон поста'),'\n\n',
                bold(`Название${!ctx.wizard.state.post_template?.name ? '*':''}: ${ctx.wizard.state.post_template?.name ?? '-'}`),'\n\n',
                quote(fmt(fmtString)),'\n\n',
                bold('Шаблон успешно создан'),'\n\n',
                italic('Выберите интересующее вас действие:')
              ),
              extra: markup
            })
        })
        return ctx.wizard.next();
      } else {
        delete ctx.wizard.state.post_template
        await sendMessage(ctx,{ text: 'Вы вышли из сцены создания шаблона поста' })
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Сцена создания шаблона поста', e))
    }
    return done();
  },
  
  async (ctx, done) => {
    const callback_data = ctx.update?.callback_query?.data;
    
    try {
      if (callback_data) {
        await nextSceneHandler.on(callback_data, async (value) => {
          delete ctx.wizard.state.post_template
          ctx.wizard.state.nextScene = value;
        })
      } else {
        delete ctx.wizard.state.post_template
        await sendMessage(ctx,{ text: 'Вы вышли из сцены создания шаблона поста' })
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Сцена создания шаблона поста', e))
    }
    return done();
  }
)