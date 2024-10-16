export const replaceText = (text, data) => {
  const replaces = [];
  let result = text;
  result = result?.replace(/{{(.*?)}}/g, (match, key) => {
    const value = data?.find(item => item.name === key)?.value;
    const start = result.indexOf(match);
    
    if (value) {
      const match_length = match.length;
      const offset = value.length - match_length;
      
      replaces.push({ start, end: start + match_length, offset});
      return value;
    } else {
      return match;
    }
  });
  
  return {
    text: result,
    replaces
  };
};