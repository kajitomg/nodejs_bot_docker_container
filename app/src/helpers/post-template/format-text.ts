import { formatEntities } from './format-entities';
import { replaceText } from './replace-text';

export function formatText(text, data, entities) {
  const { text: result_text, replaces } = replaceText(text, data);
  const result_entities = entities ? formatEntities(entities, replaces) : entities

  return {
    text: result_text,
    entities: result_entities
  };
}