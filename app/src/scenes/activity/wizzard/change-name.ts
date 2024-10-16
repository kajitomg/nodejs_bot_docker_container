import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import sendTest from '../../../helpers/send-message';
import { Languages } from '../../../models/user/user-model';
import Slices from '../../../slices';
import { ScenesTypes } from '../../index';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

export const createWizardChangeNameScene = composeWizardScene(
  async (ctx) => {
    
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Назад', nextSceneHandler.create(types.CREATE)),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: genMessage({
        header: bold(`Создание активности «${ctx.wizard.state.options.game?.name}»`),
        body: fmt(fmt(`- Название: `), bold(ctx.wizard.state.activity?.name || '-')),
      }),
      body: italic('Отправьте название:'),
    })
    await sendTest(ctx, {
      text,
      extra: { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup }
    }, {clear_media: true})
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_data = ctx.update?.callback_query?.data;
    const messageText = ctx.message?.text;
    await sendTest(ctx, {}, {clear_markup: true})
    ctx.i18n.locale(ctx.scene.state?.options?.language)
    
    if (callback_data) {
      nextSceneHandler.on(callback_data, async (value) => {
        ctx.wizard.state.nextScene = value;
      })
    } else {
      if ( messageText ) ctx.wizard.state.activity.name = messageText
      
      ctx.wizard.state.nextScene = types.CREATE
    }
    
    if (ctx.wizard.state.warning) {
      delete ctx.wizard.state.warning;
    }
    
    return done();
  },
);
