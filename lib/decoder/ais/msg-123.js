import MsgBase from './msg-base.js'
import aisCNBMsg from 'masohi-aisparser/lib/AisCNBMsg.js'
import { kn2Kmh } from '../../converter.js'

const AisMsg = aisCNBMsg.default

class Msg extends MsgBase {
  constructor (...args) {
    super(...args)
    this.fields = [
      'aisType:msgType',
      'channel',
      'mmsi',
      'latitude:lat',
      'longitude:lng',
      'heading',
      { key: 'sog', newKey: 'speed', handler: kn2Kmh },
      'cog:course',
      { key: 'rot' },
      'navStatus:navStat',
      'class',
      'utcTsSec:utcSec',
      'posAccuracy',
      'midCountryIso:country',
      'epfd'
    ]
    this.sanitizeFields()
  }

  format () {
    return this.postProcess(new AisMsg(this.aisType, this.bitField, this.channel))
  }
}

function msg (aisStr, padBit, channel) {
  const msg = new Msg(this, aisStr, padBit, channel)
  return msg.format()
}

export default msg
