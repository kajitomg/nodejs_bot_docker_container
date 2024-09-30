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
  // @ts-ignore
  ctx.scene.state.mandatory_channel_next = ScenesTypes.mandatoryChannel.wizard.ENTRY
  return await ctx.scene.enter(ScenesTypes.mandatoryChannel.wizard.MANDATORY, ctx.scene.state)
})

export default Composer.acl(adminUsers,adminBot);