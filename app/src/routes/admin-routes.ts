import { Composer, Scenes } from 'telegraf';
import { ScenesTypes } from '../scenes';
import userBot from './user-routes';

export const adminUsers = [
  806145885,
  1259372103
]

const adminBot = new Composer<Scenes.SceneContext>();

adminBot.command('menu', async ctx => {
  return await ctx.scene.enter(ScenesTypes.menu.wizard.ENTRY)
})

adminBot.command('tapswap', async ctx => {
  return await ctx.scene.enter(ScenesTypes.tapSwap.wizard.ENTRY)
})

adminBot.command('xempire', async ctx => {
  return await ctx.scene.enter(ScenesTypes.xEmpire.wizard.ENTRY)
})

adminBot.command('blum', async ctx => {
  return await ctx.scene.enter(ScenesTypes.blum.wizard.ENTRY)
})

export default Composer.acl(adminUsers,adminBot);