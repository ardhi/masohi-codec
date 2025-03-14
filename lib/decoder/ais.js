import aisBitField from 'masohi-aisparser/lib/AisBitField.js'
import msg123 from './ais/msg-123.js'
import msg04 from './ais/msg-04.js'
import msg05 from './ais/msg-05.js'
import msg18 from './ais/msg-18.js'
import msg19 from './ais/msg-19.js'
import msg21 from './ais/msg-21.js'
import msg24 from './ais/msg-24.js'
import msg27 from './ais/msg-27.js'

const { default: AisBitField } = aisBitField
const prefixes = ['!AIVDO', '!AIVDM', '!ABVDO', '!ABVDM']

class Ais {
  constructor (plugin) {
    this.plugin = plugin
    this._context = {}
    this.write = this.plugin.print.write
    this.error = this.plugin.error
  }

  _postProcess (rec) {
    const result = {}
    if (rec.valid !== 'VALID') throw this.error('invalid%s%s', this.write('sentence'), rec.errMsg)
    for (const field in rec.supportedValues) {
      result[field] = rec[field]
    }
    return result
  }

  parse = (sentence, { checksum = true } = {}) => {
    if (!sentence) throw this.error('invalidType%s', sentence)
    const [prefix] = sentence.split(',')
    if (!prefixes.includes(prefix)) throw this.error('invalidType%s', prefix)
    if (checksum && !this.plugin.isValidChecksum(sentence)) throw this.error('invalidChecksum%s')

    const part = sentence.split(',')
    if (part.length !== 7) throw this.error('invalid%s%s', this.write('length'), sentence)
    const msgCount = Number(part[1])
    const msgIdx = Number(part[2])
    const msgId = part[3]
    const padBit = Number(part[6].substr(0, 1))
    let aisStr = part[5]
    let msgParts

    if (msgCount > 1) {
      if (msgIdx === msgCount) {
        msgParts = this._context[msgId]
        if (!msgParts) throw this.error('invalid%s%s', this.write('priorMsg'), sentence)
        if (msgIdx !== (msgParts.idx + 1)) {
          delete this._context[msgId]
          throw this.error('invalid%s%s', this.write('sequence'), sentence)
        }
        aisStr = msgParts.aisStr + aisStr
        delete this._context[msgId]
      } else {
        if (padBit !== 0) throw this.error('invalid%s%s', this.write('padbit'), sentence)
        msgParts = this._context[msgId]
        if (msgIdx === 1) {
          if (typeof msgParts !== 'undefined') {
            delete this._context[msgId]
            throw this.error('invalid%s%s', this.write('sequenceIndex'), sentence)
          }
          this._context[msgId] = { idx: msgIdx, aisStr }
          throw this.error('incomplete')
        } else {
          if (!msgParts) throw this.error('invalid%s%s', this.write('priorMsg'), sentence)
          if (msgIdx !== (msgParts.idx + 1)) {
            delete this._context[msgId]
            throw this.error('invalid%s%s', this.write('sequence'), sentence)
          }
          msgParts.idx = msgIdx
          msgParts.aisStr += aisStr
          throw this.error('incomplete')
        }
      }
    } else {
      if (msgIdx !== 1) throw this.error('invalid%s%s', this.write('sequenceIndex'), sentence)
    }

    try {
      const bitField = new AisBitField(aisStr, padBit)
      const aisType = bitField.getInt(0, 6, true)
      switch (aisType) {
        case 1:
        case 2:
        case 3: return msg123.call(this.plugin, aisStr, padBit, part[4])
        case 4: return msg04.call(this.plugin, aisStr, padBit, part[4])
        case 5: return msg05.call(this.plugin, aisStr, padBit, part[4])
        case 18: return msg18.call(this.plugin, aisStr, padBit, part[4])
        case 19: return msg19.call(this.plugin, aisStr, padBit, part[4])
        case 21: return msg21.call(this.plugin, aisStr, padBit, part[4])
        case 24: return msg24.call(this.plugin, aisStr, padBit, part[4])
        case 27: return msg27.call(this.plugin, aisStr, padBit, part[4])
        default:
          throw this.error('unsupported%s%s', this.write('aisType%s', aisType), sentence)
      }
    } catch (err) {
      throw this.error(err.message)
    }
  }
}

export default Ais
