import { HandlerError } from '../exceptions/api-error';
import controllerWrapper from '../helpers/controller-wrapper';
import { IMandatoryChannel } from '../models/mandatory-channel/mandatory-channel';
import { mandatoryChannelSlices } from '../slices/mandatory-channel';

type indentDataType = Pick<IMandatoryChannel, 'id'>

type viewDataType = Pick<IMandatoryChannel, 'name' | 'description' | 'channel_id' | 'link'>

type optionsType = Pick<IMandatoryChannel, 'active'>

type createDataType = Pick<viewDataType, 'name' | 'link' | 'channel_id'> & Partial<optionsType> & Partial<viewDataType>
type updateDataType = indentDataType & Partial<viewDataType>

export default {
  
  async createChannel(data: createDataType) {
    try {
      const active = false
      
      const code = await controllerWrapper(
        async (transaction) => {
          return await mandatoryChannelSlices.crud.create({
            data: {
              active,
              ...data
            },
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при создании канала`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при создании канала`, error))
    }
  },
  
  async updateChannel(data: updateDataType) {
    try {
      
      const code = await controllerWrapper(
        async (transaction) => {
          return await mandatoryChannelSlices.crud.update({
            data,
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при обновлении канала`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при обновлении канала`, error))
    }
  },
  
  async getChannel(data: indentDataType) {
    try {
      
      const code = await controllerWrapper(
        async (transaction) => {
          return await mandatoryChannelSlices.crud.get({
            data,
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при получении канала`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при получении канала`, error))
    }
  },
  
  async getChannels(data?:optionsType,queries?: {
    page?: number,
    limit?: number,
    search?: string
  }) {
    try {
      
      const code = await controllerWrapper(
        async (transaction) => {
          return await mandatoryChannelSlices.crud.gets({
            data,
            queries,
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при получении каналов`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при получении каналов`, error))
    }
  },
  
  async getCount(queries?: {
    search?: string
  }) {
    try {
      
      const code = await controllerWrapper(
        async (transaction) => {
          return await mandatoryChannelSlices.crud.count({
            queries,
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при получении числа каналов`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при получении числа каналов`, error))
    }
  }
  
}