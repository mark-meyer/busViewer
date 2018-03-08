const {parseString} = require('xml2js')
const axios = require('axios')

const XML_URL = 'http://bustracker.muni.org/InfoPoint/XML/vehiclelocation.xml'

const TIME_OUT = 2 * 60 * 1000 // cache for minutes

class BusXML {
    constructor(url){
        this.url = url
        this.lastFetch = undefined
        this.busData = undefined
    }
    getXML(){
        // bus data is still fresh
        console.log("Time since last download: ", Date.now() - this.lastFetch)
        if (this.busData && Date.now() - this.lastFetch < TIME_OUT) return Promise.resolve(this.busData)
        console.log("downloading new data. Time since last: ", Date.now() - this.lastFetch)
        return axios.get(this.url)
        .then(r => new Promise((resolve, reject) => {
            parseString(r.data, {explicitArray: false}, (err, result) =>{
                this.lastFetch = Date.now()
                if(err) return reject(err)
                this.busData = result
                resolve(this.busData)
            })
        }))
    }
    getBusesOnRoute(routeId){
        const running_statuses = ['on-time', 'late', 'early']
        return this.getXML()
        .then(() => this.busData['vehicle-locations']['vehicle']
                    .filter(v => v.routeid == routeId && running_statuses.includes(v['$']['op-status'])))
    }

}

const busXML = new BusXML(XML_URL)
busXML.getXML()

module.exports = busXML