import MsgBase from './msg-base.js'
import ais05Msg from 'masohi-aisparser/lib/Ais05Msg.js'

const AisMsg = ais05Msg.default

class Msg extends MsgBase {
  constructor (...args) {
    super(...args)
    this.fields = [
      'aisType:msgType',
      'channel',
      'mmsi',
      'midCountryIso:country',
      'callSign',
      'name',
      'imo',
      'shipType',
      'dimToBow:toBow',
      'dimToStern:toStern',
      'dimToPort:toPortside',
      'dimToStbrd:toStarboard',
      'draught',
      'destination',
      { key: 'etaMonth', newKey: 'eta', handler: this.plugin.getEta },
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
