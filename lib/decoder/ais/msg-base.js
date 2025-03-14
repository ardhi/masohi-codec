import aisBitField from 'masohi-aisparser/lib/AisBitField.js'
const { default: AisBitField } = aisBitField

class MsgBase {
  constructor (plugin, aisStr, padBit, channel) {
    this.plugin = plugin
    this.bitField = new AisBitField(aisStr, padBit)
    this.aisType = this.bitField.getInt(0, 6, true)
    this.channel = channel
    this.fields = []
    this.keys = []
  }

  sanitizeFields () {
    const { map } = this.plugin.lib._
    this.fields = map(this.fields, f => {
      if (typeof f === 'string') {
        let [key, newKey] = f.split(':')
        if (!newKey) newKey = key
        return { key, newKey }
      }
      if (!f.newKey) f.newKey = f.key
      return f
    })
    this.keys = map(this.fields, 'key')
  }

  postProcess (rec) {
    const { find } = this.plugin.lib._
    if (rec.valid !== 'VALID') throw this.plugin.error('invalid%s%s', this.plugin.print.write('sentence'), rec.errMsg)
    const result = {}
    const keys = this.keys.length > 0 ? this.keys : Object.keys(rec.supportedValues)
    for (const key of keys) {
      const field = find(this.fields, { key })
      if (!field) {
        result[key] = rec[key]
        continue
      }
      const val = field.handler ? field.handler.call(this.plugin, rec[key]) : rec[key]
      result[field.newKey] = val
    }
    return result
  }
}

export default MsgBase
