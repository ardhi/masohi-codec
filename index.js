async function factory (pkgName) {
  const me = this

  return class MasohiCodec extends this.lib.BajoPlugin {
    constructor () {
      super(pkgName, me.app)
      this.alias = 'codec'
      this.dependencies = ['masohi']
      this.config = {
      }
      this.decoders = []
    }

    decode = async (type, params = {}) => {
      const { importModule } = this.app.bajo
      const { find } = this.lib._
      const { source } = {}
      let decoder = find(this.decoders, { type, source })
      if (!decoder) {
        decoder = { type, source }
        const Mod = await importModule(`masohiCodec:/lib/decoder/${type}.js`)
        if (!Mod) this.error('unknownDecoder%s', type)
        decoder.instance = new Mod(this)
        this.decoders.push(decoder)
      }
      await decoder.instance.parse(params)
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

    kn2Kmh = (val, rec) => {
      return parseFloat((val * 1.852).toFixed(2))
    }

    fixFloat = (val, rec, prec = 5) => {
      return parseFloat(val.toFixed(prec))
    }

    getEta = (val, rec) => {
      const { padStart } = this.lib._
      const month = padStart((rec.etaMonth || 0) + '', 2, 0)
      const day = padStart((rec.etaDay || 0) + '', 2, 0)
      const hour = padStart((rec.etaHour || 0) + '', 2, 0)
      const min = padStart((rec.etaMinute || 0) + '', 2, 0)
      return `${month}-${day} ${hour}:${min}`
    }

    mergeStationData = async (params = {}) => {
      const { payload, source } = params
      const { merge, get } = this.lib._
      const { breakNsPath, importPkg, getMethod } = this.app.bajo
      const geolib = await importPkg('bajoSpatial:geolib')
      const { ns } = breakNsPath(source)
      const fnName = get(this, `app.${ns}.config.getStationData`, `${ns}:getStationData`)
      const fn = getMethod(fnName, false)
      if (!fn) return
      const station = fn(params)
      if (!station) return
      const item = {
        stationId: station.id,
        feed: station.feedType
      }
      if (station.lat && station.lng && payload.lat && payload.lng) {
        item.stationDistance = this.fixFloat(geolib.getDistance(
          { longitude: station.lng, latitude: station.lat },
          { longitude: payload.lng, latitude: payload.lat }
        ) / 1000, null, 2)
        item.stationBearing = this.fixFloat(geolib.getRhumbLineBearing(
          { longitude: station.lng, latitude: station.lat },
          { longitude: payload.lng, latitude: payload.lat }
        ), null, 2)
      }
      params.payload = merge(payload, item, station.dataMerge ?? {})
    }
  }
}

export default factory
