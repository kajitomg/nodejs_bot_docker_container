import { Composer, Scenes } from 'telegraf';

const adminUsers = [
  806145885,
  1259372103
]

const adminBot = new Composer<Scenes.SceneContext>();


export default Composer.acl(adminUsers,adminBot);