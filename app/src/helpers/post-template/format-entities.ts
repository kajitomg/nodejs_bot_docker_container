import { AbstractMessageEntity } from '../../models/post/post-model';

export const formatEntities = (entities: AbstractMessageEntity[], replaces: { start: number, end: number, offset: number }[]) => {
  const result = JSON.parse(JSON.stringify(entities))
  
   return result.map(entity => {
    const start_offset = entity.offset
    
    let offset = entity.offset
    let length = entity.length
    
    replaces.map((replace) => {
      if ((entity.offset >= replace.start) && ((entity.offset + entity.length) <= replace.end)) {
        offset = replace.start - (start_offset - offset)
        length = replace.end - replace.start + replace.offset
      }
      if (entity.offset >= replace.end) {
        offset += replace.offset
      }
    })
    
    return {
      ...entity,
      length,
      offset
    }
  });
}