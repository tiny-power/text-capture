<template>
    <div class="flex-container">
        <div style="font-size: 24px; margin-bottom: 10px">👍</div>
        <div>Copied to Clipboard</div>
    </div>
</template>

<script>
import { createWorker } from 'tesseract.js'
const Store = require('electron-store')
const store = new Store()
export default {
    data() {
        return {}
    },
    mounted() {
        window.ipcRenderer.on('recognize', (event, data) => {
            this.recognize(data)
        })
    },
    methods: {
        async recognize(data) {
            let lang = store.get('lang') || 'eng'
            const worker = await createWorker(lang, 1, {
                workerPath: '/tesseract/workerPath/worker.min.js',
                workerBlobURL: false,
                langPath: '/tesseract/langPath',
                corePath: '/tesseract/corePath'
            })
            const ret = await worker.recognize(data)
            let speech = store.get('speech') || false
            if (speech) {
                this.speechSynthesis(ret.data.text)
            } else {
                await window.ipcRenderer.invoke('writeText', ret.data.text)
            }
            await worker.terminate()
        },
        speechSynthesis(text) {
            if (text) {
                const speech = new SpeechSynthesisUtterance(text)
                window.speechSynthesis.speak(speech)
            }
        }
    }
}
</script>

<style scoped>
.flex-container {
    box-sizing: border-box;
    background: #2d2d2d;
    color: #fff;
    font-weight: bold;
    font-size: 13px;
    height: 92px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}
</style>
