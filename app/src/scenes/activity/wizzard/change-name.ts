import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import sendMessage from '../../../helpers/send-message';
import { Activity } from '../../../models/activity/activity-model';
import { Game } from '../../../models/game';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

interface ChangeNameProps {
  game: Game
  activity: Partial<Omit<Activity, 'id'>>,
}

export const createWizardChangeNameScene = composeWizardScene<ChangeNameProps>(
  async (ctx) => {
    
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Назад', 'back'),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: genMessage({
        header: bold(`Создание активности «${ctx.scene.session.props.game?.name}»`),
        body: fmt(fmt(`- Название: `), bold(ctx.scene.session.props.activity?.name || '-')),
      }),
      body: italic('Отправьте название:'),
    })
    await sendMessage(ctx, {
      text,
      extra: { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup }
    }, {clear_media: true})
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    const message_text = ctx.message?.['text'];
    await sendMessage(ctx, {}, {clear_markup: true})
    
    if (callback_data) {
      if (callback_data === 'back') {
        await back();
      }
    } else {
      ctx.scene.session.props.activity.name = message_text
      await back(types.CREATE, {
        ...ctx.scene.session.props
      })
    }
    
    return;
  },
);
