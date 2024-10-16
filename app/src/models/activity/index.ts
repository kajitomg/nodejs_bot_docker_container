import { postModel } from '../post';
import { activityModel } from './activity-model'

postModel.hasMany(activityModel)
activityModel.belongsTo(postModel, { foreignKey: 'post_id' })

export {
  activityModel
}