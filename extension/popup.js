
import { createApp } from './vue.esm-browser.js'
createApp({
    mounted(){
        chrome.storage.sync.get(['implementEnabled', 'apiPath'], (data) => {
            this.implementEnabled = data.implementEnabled !== false; // 默认启用
            this.apiPath = data.apiPath || 'http://localhost:54259/implement';
            console.log('Settings loaded in popup:', data);
        })
    },
    methods:{
        save(){
            chrome.storage.sync.set({
                implementEnabled: this.implementEnabled,
                apiPath: this.apiPath
            }, () => {
                console.log('Settings saved:', this.implementEnabled, this.apiPath);
                alert('保存成功！');
            })
        }
    },
    data() {
        return {
            title: 'Colipot Anywhere',
            desc:'欢迎！在大模型的帮助下，类似GitHub Copilot的代码补全功能现在可以在浏览器的任何文本编辑框使用！太爽啦！',
            apiPath: 'http://localhost:54259/implement',
            implementEnabled: true
        }
    }
}).mount('#app')
