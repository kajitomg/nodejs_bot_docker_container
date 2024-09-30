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

export const createChangeLanguageScene = composeWizardScene(
  async (ctx) => {
    const chat_id = ctx.chat.id
    
    const user = await Slices.user.crud.get({ chat_id })
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
          Markup.button.callback('RU', `${Languages.ru}`),
          Markup.button.callback('EN', `${Languages.en}`),
          Markup.button.callback(ctx.i18n.t('changeLanguage.buttons.back'), createNextScene(ScenesTypes.menu.wizard.ENTRY)),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(bold(ctx.i18n.t('changeLanguage.header')),'\n\n',italic(ctx.i18n.t('changeLanguage.body'))), markup)
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Выбор языка', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const author = ctx.from
    const chat_id = ctx.chat.id
    const callback_query = ctx.update?.callback_query?.data;
    
    try {
      if (callback_query) {
        const nextScene = getNextScene(callback_query)
        if (nextScene) {
          ctx.wizard.state.nextScene = nextScene;
        }
        
        if ( Languages.hasOwnProperty(callback_query) ) {
          const user = await Slices.user.crud.create({ chat_id, username: author.username, first_name: author.first_name })
          
          await Slices.user.crud.update({ chat_id, language: callback_query, username: author.username, firstName: author.first_name  })
          
          ctx.wizard.state.nextScene = types.CHANGE_LANGUAGE;
        }
      } else {
        await ctx.sendMessage(ctx.i18n.t('changeLanguage.exit'))
      }
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Выбор языка', e))
    }
    return done();
  },
);
