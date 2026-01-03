export function getDefaultValue(type: string): unknown {
  switch (type) {
    case 'text':
    case 'shortText':
      return ''
    case 'choice':
    case 'binary':
    case 'imageChoice':
    case 'dropdown':
      return null
    case 'multiChoice':
      return []
    case 'statement':
    case 'scale':
    case 'frequency':
    case 'number':
    case 'date':
    case 'vas':
      return null
    case 'matrix':
      return {}
    case 'ranking':
      return []
    default:
      return null
  }
}

