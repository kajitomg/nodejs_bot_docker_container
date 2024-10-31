import { Markup } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import codeController from '../../../controllers/code-controller';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import MarkupPagination from '../../../helpers/markup-pagination';
import send from '../../../helpers/send';
import { CodeStatuses } from '../../../models/code';
import { ICode } from '../../../models/code/code-model';
import { Game } from '../../../models/game';
import types from './types';

const limit = 1

interface CodeModerateProps {
  game: Game,
  pagination?: MarkupPagination,
  code?: ICode
}

export const createPullRequestCodeScene = composeWizardScene<CodeModerateProps>(
  async (ctx) => {
    const game = ctx.scene.session?.props?.game
    
    ctx.scene.session.props.pagination = new MarkupPagination(
      ctx.scene.session.props.pagination?._page || 1,
      ctx.scene.session.props.pagination?._maxPages || 1,
      ctx.scene.session.props.pagination?.prevMaxPages,
      ctx.scene.session.props.pagination?.prevPage
    )
    let code = await codeController.getCodes({
      status: CodeStatuses.moderation,
      game: game.id
    }, {
      page: ctx.scene.session.props.pagination.page,
      limit
    })
    
    ctx.scene.session.props.pagination.maxPages = Math.ceil(code?.count / limit) || 1
    
    if ( ctx.scene.session.props.pagination.maxPages < ctx.scene.session.props.pagination.page) {
      ctx.scene.session.props.pagination.page = ctx.scene.session.props.pagination.maxPages
      
      code = await codeController.getCodes({
        status: CodeStatuses.moderation,
        game: game.id
      }, {
        page: ctx.scene.session.props.pagination.maxPages,
        limit
      })
    }
    
    ctx.scene.session.props.code = code.items?.[0]
    
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback(ctx.i18n.t('code_moderate.buttons.reject'), 'reject'),
        Markup.button.callback(ctx.i18n.t('code_moderate.buttons.accept'), 'accept'),
        ctx.scene.session.props.pagination.prevPageButton(ctx.i18n.t('code_moderate.buttons.prev')),
        ctx.scene.session.props.pagination.nextPageButton(ctx.i18n.t('code_moderate.buttons.next')),
        Markup.button.callback(ctx.i18n.t('code_moderate.buttons.back'), 'back'),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: bold(ctx.i18n.t('code_moderate.name',{ game_name:game.name })),
      body: code.items?.[0] ?
        fmt(fmt(ctx.scene.session.props.code.id, '\n\n'),fmt(`- ${ctx.i18n.t('code_moderate.data.name')}${ctx.scene.session.props.code.name ? '' : '*'}: `), bold(ctx.scene.session.props.code.name ? ctx.scene.session.props.code.name : '-'),fmt('\n'),fmt(`- ${ctx.i18n.t('code_moderate.data.content')}${ctx.scene.session.props.code.content ? '' : '*'}: `), bold(ctx.scene.session.props.code.content ? ctx.scene.session.props.code.content : '-')) :
        bold(ctx.i18n.t('code_moderate.data.warning_codes_not_found'))
      ,
    })
    

    await send(ctx, text, { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup })
    
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const chat_id = ctx.chat?.id;
    const game = ctx.scene.session?.props?.game
    const callback_data = ctx.callbackQuery?.['data'];
    
    ctx.scene.session.props.pagination = new MarkupPagination(
      ctx.scene.session.props.pagination?._page || 1,
      ctx.scene.session.props.pagination?._maxPages || 1,
      ctx.scene.session.props.pagination?.prevMaxPages,
      ctx.scene.session.props.pagination?.prevPage
    )
    
    if (callback_data) {
      
      await ctx.scene.session.props.pagination.onPrevPage(callback_data, async () => {})
      await ctx.scene.session.props.pagination.onNextPage(callback_data, async () => {})
      await done(types.PULL_REQUEST_CODE, {
        ...ctx.scene.session.props
      });
      
      if (callback_data === 'back') {
        await back();
      }
      if(callback_data === 'accept') {
        await codeController.updateCode({
          id: ctx.scene.session?.props.code.id,
          status: CodeStatuses.accept,
          moderator_id: chat_id,
        })
      }
      if(callback_data === 'reject') {
        await codeController.updateCode({
          id: ctx.scene.session?.props.code.id,
          status: CodeStatuses.reject,
          moderator_id: chat_id,
        })
      }
      
    } else {
      await ctx.sendMessage(ctx.i18n.t('code_moderate.exit',{ menu_name: ctx.i18n.t('code_moderate.name',{ game_name:game.name }) }))
      await done();
    }
    return;
  },
);