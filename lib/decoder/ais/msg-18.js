import MsgBase from './msg-base.js'
import ais18Msg from 'masohi-aisparser/lib/Ais18Msg.js'
import { kn2Kmh } from '../../converter.js'

const AisMsg = ais18Msg.default

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
