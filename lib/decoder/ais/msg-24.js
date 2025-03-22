import MsgBase from './msg-base.js'
import ais24Msg from 'masohi-aisparser/lib/Ais24Msg.js'
const AisMsg = ais24Msg.default

class Msg extends MsgBase {
  constructor (...args) {
    super(...args)
    this.fields = [
      'aisType:msgType',
      'channel',
      'mmsi',
      'name',
      'callSign',
      'shipType',
      'dimToBow:toBow',
      'dimToStern:toStern',
      'dimToPort:toPortside',
      'dimToStbrd:toStarboard',
      'midCountryIso:country',
      'mothershipMmsi:msMmsi',
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
