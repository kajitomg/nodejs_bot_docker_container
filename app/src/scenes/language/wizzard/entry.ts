import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { Languages } from '../../../models/user/user-model';
import Slices from '../../../slices';
import { ScenesTypes } from '../../index';
import types from './types';

export const createChangeLanguageEntryScene = composeWizardScene(
  async (ctx) => {
    const chat_id = ctx.chat.id
    
    const user = await Slices.user.crud.get({ chat_id })
    console.log(user)
    const language = Languages?.[user.item?.language] || 'ru'
    
    ctx.scene.state = {
      ...ctx.scene.state,
      options: {
        language
      }
    }
    ctx.i18n.locale(language)
    
    try {
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback(ctx.i18n.t('change_language.buttons.ru'), `${Languages.ru}`),
          Markup.button.callback(ctx.i18n.t('change_language.buttons.en'), `${Languages.en}`),
          Markup.button.callback(ctx.i18n.t('change_language.buttons.back'), createNextScene(ScenesTypes.menu.wizard.PROFILE)),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(bold(ctx.i18n.t('change_language.name')),'\n\n',italic(ctx.i18n.t('change_language.data.choose_language'))), markup)
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Выбор языка', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const author = ctx.from
    const chat_id = ctx.chat.id
    const callback_query = ctx.update?.callback_query?.data;
    
    ctx.i18n.locale(ctx.scene.state?.options?.language)
    
    try {
      if (callback_query) {
        const nextScene = getNextScene(callback_query)
        if (nextScene) {
          ctx.wizard.state.nextScene = nextScene;
        }
        
        if ( Languages.hasOwnProperty(callback_query) ) {
          const user = await Slices.user.crud.create({ chat_id, username: author.username, first_name: author.first_name })
          
          await Slices.user.crud.update({ chat_id, language: callback_query, username: author.username, firstName: author.first_name  })
          
          ctx.wizard.state.nextScene = types.ENTRY;
        }
      } else {
        await ctx.sendMessage(ctx.i18n.t('change_language.exit', { menu_name: ctx.i18n.t('change_language.name') }))
      }
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Выбор языка', e))
    }
    return done();
  },
);
