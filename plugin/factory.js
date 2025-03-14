async function factory (pkgName) {
  const me = this

  return class MasohiCodec extends this.lib.BajoPlugin {
    constructor () {
      super(pkgName, me.app)
      this.alias = 'codec'
      this.dependencies = ['masohi']
      this.config = {
      }
    }

    decode = async (type, sentence, decoder) => {
      const { importModule } = this.app.bajo
      if (!decoder) {
        const Mod = await importModule(`masohiCodec:/lib/decoder/${type}.js`)
        if (!Mod) this.error('unknownDecoder%s', type)
        decoder = new Mod(this)
      }
      try {
        return await decoder.parse(sentence)
      } catch (err) {
        if (this.app.bajo.config.env === 'dev') this.log.error(err.message)
        throw err
      }
    }

    isValidChecksum = (sentence) => {
      const idx = sentence.indexOf('*')
      if ((idx === -1) || (idx < 2)) return false

      let chkSum = 0
      for (let i = 1; i < idx; i++) {
        chkSum ^= sentence.charCodeAt(i) & 0xFF
      }

      let chkSumStr = chkSum.toString(16).toUpperCase()
      if (chkSumStr.length < 2) chkSumStr = '0' + chkSumStr
      return chkSumStr === sentence.substr(idx + 1)
    }
  }
}

export default factory
