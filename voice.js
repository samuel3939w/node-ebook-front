const Base64 = require('js-base64').Base64
const md5 = require('js-md5')
const qs = require('qs')
const http = require('http')
const { mp3FilePath, resUrl } = require('./const')
const fs = require('fs')

function createVoice(req, res) {
    //const text = req.query.text
    //const lang = req.query.lang
    const text = '測試科大訊飛再現語音合成api的功能,比如說,我們輸入一段話,科大訊飛api會在線時實生成語音返回給客戶端'
    const lang = 'cn'

    let engineType = 'intp65'
    if (lang.toLowerCase() === 'en') {
        engineType = 'en'
    }
    let speed = '30'
    const voiceParam = {
        auf: 'audio/L16;rate=16000',
        aue: 'lame',
        voice_name: 'xiaoyan',
        speed,
        volume: '50',
        pitch: '50',
        engine_type: engineType,
        text_type: 'text'
    }

    const currentTime = Math.floor(new Date().getTime() / 1000)
    const appId = '935fba7c'
    const apiKey = '45cb8335acd428cf2e04e4d41a77f4d7'
    const xParam = Base64.encode(JSON.stringify(voiceParam))
    const checkSum = md5(apiKey + currentTime + xParam)
    const headers = {}
    headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'
    headers['X-Param'] = xParam
    headers['X-Appid'] = appId
    headers['X-CurTime'] = currentTime
    headers['X-CheckSum'] = checkSum
    headers['X-Reak-Ip'] = '127.0.0.1'
    const data = qs.stringify({
        text
    })
    const options = {
        hostUrl: "wss://tts-api.xfyun.cn/v2/tts",
        host: "tts-api.xfyun.cn",
        method: 'POST',
        headers
    }
    const request = http.request(options, (response) => {
        let mp3 = ''
        const contentLength = response.headers['content-length']
        response.setEncoding('binary')
        response.on('data', data => {
            mp3 += data
            const progress = data.length / contentLength * 100
            const percent = parseInt(progress.toFixed(2))
            console.log(percent);
        })
        response.on('end', () => {
            console.log(mp3);
            const contentType = response.headers['content-type']
            if (contentType === 'text/html') {
                res.send(mp3)
            } else {
                const fileName = new Date().getTime()
                const filePath = `${mp3FilePath}/${fileName}.mp3`
                const downloadUrl = `${resUrl}/mp3/${fileName}.mp3`
                fs.writeFile(filePath, mp3, 'binary', err => {
                    if (err) {
                        res.json({
                            error: 1,
                            msg: '下載失敗'
                        })
                    } else {
                        res.json({
                            error: 1,
                            msg: '下載成功',
                            path: downloadUrl
                        })
                    }
                })
            }
        })
    })
    request.write(data)
    request.end()
}

module.exports = createVoice