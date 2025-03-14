import MsgBase from './msg-base.js'
import ais05Msg from 'masohi-aisparser/lib/Ais05Msg.js'
const AisMsg = ais05Msg.default

class Msg extends MsgBase {
  format () {
    return this.postProcess(new AisMsg(this.aisType, this.bitField, this.channel))
  }
}

function msg (aisStr, padBit, channel) {
  const msg = new Msg(this, aisStr, padBit, channel)
  return msg.format()
}

export default msg
