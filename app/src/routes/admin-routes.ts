import { Composer, Scenes } from 'telegraf';
import { ScenesTypes } from '../scenes';

export const adminUsers = [
  806145885,
  1259372103
]

const adminBot = new Composer<Scenes.SceneContext>();

adminBot.command('broadcast', async ctx => {
  return await ctx.scene.enter(ScenesTypes.broadcast.wizard.ENTRY)
})

adminBot.command('mandatory', async ctx => {
  return await ctx.scene.enter(ScenesTypes.mandatorySubscription.wizard.ENTRY)
})

export default Composer.acl(adminUsers,adminBot);