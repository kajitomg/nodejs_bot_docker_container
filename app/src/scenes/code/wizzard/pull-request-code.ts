import { Markup } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import codeController from '../../../controllers/code-controller';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import MarkupPagination from '../../../helpers/markup-pagination';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { CodeStatuses } from '../../../models/code';
import types from './types';

const limit = 1

export const createPullRequestCodeScene = composeWizardScene(
  async (ctx) => {
    const game = ctx.wizard.state.options.game
    ctx.wizard.state.pull_request_code_pagination = ctx.wizard.state.pull_request_code_pagination || new MarkupPagination(1, 1)
    
    let code = await codeController.getCodes({
      status: CodeStatuses.moderation,
      game: game.id
    }, {
      page: ctx.wizard.state.pull_request_code_pagination.page,
      limit
    })
    
    ctx.wizard.state.pull_request_code_pagination.maxPages = Math.ceil(code.count / limit) || 1
    
    if ( ctx.wizard.state.pull_request_code_pagination.maxPages < ctx.wizard.state.pull_request_code_pagination.page) {
      ctx.wizard.state.pull_request_code_pagination.page = ctx.wizard.state.pull_request_code_pagination.maxPages
      
      code = await codeController.getCodes({
        status: CodeStatuses.moderation,
        game: game.id
      }, {
        page: ctx.wizard.state.pull_request_code_pagination.maxPages,
        limit
      })
    }
    
    ctx.wizard.state.code_id = code?.items?.[0]?.id
    ctx.wizard.state.code_name = code?.items?.[0]?.name
    ctx.wizard.state.code_content = code?.items?.[0]?.content
    
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Отклонить', 'reject'),
        Markup.button.callback('Принять', 'accept'),
        ctx.wizard.state.pull_request_code_pagination.prevPageButton('Предыдущий код'),
        ctx.wizard.state.pull_request_code_pagination.nextPageButton('Следующий код'),
        Markup.button.callback('Назад в меню', createNextScene(ctx.wizard.state.options.entry)),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: bold(`Меню модерации кодов ${game.name}`),
      body: code.items?.[0] ?
        fmt(fmt(`- Название${ctx.wizard.state.code_name ? '' : '*'}: `), bold(ctx.wizard.state.code_name ? ctx.wizard.state.code_name : '-'),fmt('\n'),fmt(`- Содержание${ctx.wizard.state.code_content ? '' : '*'}: `), bold(ctx.wizard.state.code_content ? ctx.wizard.state.code_content : '-')) :
        bold('Нет предложенных кодов')
      ,
    })
    

    await send(ctx, text, { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup })
    
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const game = ctx.wizard.state.options.game
    const callbackData = ctx.update?.callback_query?.data;
    
    if (callbackData) {
      const nextScene = getNextScene(callbackData)
      if (nextScene) {
        ctx.wizard.state.nextScene = nextScene;
      }
      
      if(callbackData === 'accept') {
        ctx.wizard.state.status = 'accept';
        ctx.wizard.state.nextScene = types.PULL_REQUEST_CODE_HANDLER;
      }
      if(callbackData === 'reject') {
        ctx.wizard.state.status = 'reject';
        ctx.wizard.state.nextScene = types.PULL_REQUEST_CODE_HANDLER;
      }
      ctx.wizard.state.pull_request_code_pagination.onPrevPage(callbackData, () => {
        ctx.wizard.state.nextScene = types.PULL_REQUEST_CODE;
      })
      ctx.wizard.state.pull_request_code_pagination.onNextPage(callbackData, () => {
        ctx.wizard.state.nextScene = types.PULL_REQUEST_CODE;
      })
      
    } else {
      await ctx.sendMessage(`Вы вышли из меню модерации кодов ${game.name}`)
    }
    return done();
  },
);