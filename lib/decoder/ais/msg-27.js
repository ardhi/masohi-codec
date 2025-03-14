import MsgBase from './msg-base.js'
import ais27Msg from 'masohi-aisparser/lib/Ais27Msg.js'
const AisMsg = ais27Msg.default

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
