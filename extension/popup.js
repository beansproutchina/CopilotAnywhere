
import { createApp } from './vue.esm-browser.js'
createApp({
    mounted(){
        chrome.storage.sync.get(['complementEnabled', 'apiPath'], (data) => {
            this.complementEnabled = data.complementEnabled !== false; // 默认启用
            this.apiPath = data.apiPath || 'http://localhost:54259/complement';
            console.log('Settings loaded in popup:', data);
        })
    },
    methods:{
        save(){
            chrome.storage.sync.set({
                complementEnabled: this.complementEnabled,
                apiPath: this.apiPath
            }, () => {
                console.log('Settings saved:', this.complementEnabled, this.apiPath);
                alert('保存成功！');
            })
        }
    },
    data() {
        return {
            title: 'Colipot Anywhere',
            desc:'欢迎！在大模型的帮助下，类似GitHub Copilot的代码补全功能现在可以在浏览器的任何文本编辑框使用！太爽啦！',
            apiPath: 'http://localhost:54259/complement',
            complementEnabled: true
        }
    }
}).mount('#app')
