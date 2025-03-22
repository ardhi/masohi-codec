import MsgBase from './msg-base.js'
import ais21Msg from 'masohi-aisparser/lib/Ais21Msg.js'
const AisMsg = ais21Msg.default

class Msg extends MsgBase {
  constructor (...args) {
    super(...args)
    this.fields = [
      'aisType:msgType',
      'channel',
      'mmsi',
      'latitude:lat',
      'longitude:lng',
      'name',
      'dimToBow:toBow',
      'dimToStern:toStern',
      'dimToPort:toPortside',
      'dimToStbrd:toStarboard',
      'length',
      'width',
      'aidType',
      'nameExt',
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
