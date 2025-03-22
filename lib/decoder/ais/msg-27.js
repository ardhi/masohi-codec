import MsgBase from './msg-base.js'
import ais27Msg from 'masohi-aisparser/lib/Ais27Msg.js'

const AisMsg = ais27Msg.default

class Msg extends MsgBase {
  constructor (...args) {
    super(...args)
    this.fields = [
      'aisType:msgType',
      'channel',
      'mmsi',
      { key: 'latitude', newKey: 'lat', handler: this.plugin.fixFloat },
      { key: 'longitude', newKey: 'lng', handler: this.plugin.fixFloat },
      { key: 'sog', newKey: 'speed', handler: this.plugin.kn2Kmh },
      'cog:course',
      'navStatus:navStat',
      'class',
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
