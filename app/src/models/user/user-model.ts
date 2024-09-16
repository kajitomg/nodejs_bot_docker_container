import { CreationOptional, InferAttributes, InferCreationAttributes, Model, DataTypes } from "sequelize";
import services from '../../services';

const sequelize = services.db?.postgres?.sequelize

interface IUser extends Model<InferAttributes<IUser>, InferCreationAttributes<IUser>> {
  id: CreationOptional<number>,
  chat_id: number,
  username: string,
  first_name: string,
  last_session: string,
}

const userModel = sequelize.define<IUser>('user', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  chat_id: {type: DataTypes.INTEGER},
  username: {type: DataTypes.STRING},
  first_name: {type: DataTypes.STRING},
  last_session: {type: DataTypes.DATE}
})

export { userModel, IUser }