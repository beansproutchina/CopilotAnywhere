let lang = 'javascript';
let filename = 'example.js';
let apiPath = 'http://localhost:54259/implement';
let enabled = true;
const debounce = (func, wait) => {
    let timeout;
    return function (...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
class Copilot {
    textarea;
    overlapBox;
    overlapBoxScroll;
    overlapBoxTextBefore;
    overlapBoxTextImplement;
    hasImplement = false;
    destroyed = false;
    constructor(textarea) {
        this.textarea = textarea;
        let debounced = debounce(this.handleInput.bind(this), 1000)
        this.textarea.addEventListener('input', () => {
            if (this.destroyed) return;
            this.hideImplement();
            debounced();
        });
        this.textarea.addEventListener('blur', () => {
            this.hideImplement();
        });
        this.overlapBox = document.createElement('div');
        this.overlapBox.style.fontSize = window.getComputedStyle(this.textarea).fontSize;
        this.overlapBox.style.fontFamily = window.getComputedStyle(this.textarea).fontFamily;
        this.overlapBox.style.lineHeight = window.getComputedStyle(this.textarea).lineHeight;
        this.overlapBox.classList.add('overlapbox');
        this.overlapBoxScroll = document.createElement('div');
        this.overlapBoxScroll.classList.add("scrollarea");
        this.overlapBox.appendChild(this.overlapBoxScroll);
        this.overlapBoxTextBefore = document.createElement('span');
        this.overlapBoxTextBefore.className = 'hidetext';
        this.overlapBoxScroll.appendChild(this.overlapBoxTextBefore);
        this.overlapBoxTextImplement = document.createElement('span');
        this.overlapBoxTextImplement.className = 'implement';
        this.overlapBoxScroll.appendChild(this.overlapBoxTextImplement);
        this.overlapBox.style.display = 'none';
        this.hasImplement = false;
        setTimeout(() => {
            document.body.appendChild(this.overlapBox);
            document.addEventListener('keydown', this.handleKeyDown.bind(this));
        }, 100);
    }
    handleKeyDown(event) {
        if (this.destroyed || !enabled) return;
        if (this.hasImplement) {
            if (event.keyCode === 9) { // 检测Tab键
                event.preventDefault();
                const cursorPosition = this.textarea.selectionStart;
                const implementText = this.overlapBoxTextImplement.innerText;
                const text = this.textarea.value;
                const newText = text.slice(0, cursorPosition) + implementText + text.slice(cursorPosition);
                this.textarea.value = newText;
                this.textarea.selectionStart = this.textarea.selectionEnd = cursorPosition + implementText.length;
                this.hideImplement();
            }
            else if (event.keyCode === 27) { // 检测Esc键
                event.preventDefault();
                this.hideImplement();
            }
        }
    }
    async handleInput() {
        if (this.destroyed || !enabled) return;
        const text = this.textarea.value;
        this.hideImplement();
        if (text.length < 3) {
            return;
        }
        const cursorPosition = this.textarea.selectionStart;
        const prompt = text.slice(0, cursorPosition) + `<FillHere>` + text.slice(cursorPosition);
        chrome.runtime.sendMessage({
            type: 'startImplement'
        });
        filename = document.title;
        lang = "编程";
        if (window.location.hostname == 'shuiyuan.sjtu.edu.cn') {
            lang = '水源社区';
            if (document.querySelector("#reply-title")) {
                filename = document.querySelector("#reply-title").value || '[未命名帖子]';
            } else if (document.querySelector(".topic-link")) {
                filename = "回复：" + (document.querySelector(".topic-title").innerText || '[未命名帖子]');
            }
        } else if (["chat.openai.com", "chat.deepseek.com", "chat.qwen.ai", "www.doubao.com", "www.kimi.com"].includes(window.location.hostname)) {
            lang = 'ai';
        }

        const f = await fetch(apiPath, {
            method: 'POST',
            body: JSON.stringify({
                content: prompt,
                language: lang,
                filename: filename
            }),
            headers: {
                'Content-Type': 'application/json'
            },
        })
        const implement = await f.text();
        this.showImplement(implement, cursorPosition);
    }

    showImplement(implement, cursorPosition) {
        chrome.runtime.sendMessage({
            type: 'receivedImplement'
        });
        if (!this.hasImplement) {
            this.overlapBox.style.display = 'block';
            this.hasImplement = true;
        }
        const outerRect = this.textarea.getBoundingClientRect();
        const scroll = {
            left: this.textarea.scrollLeft,
            top: this.textarea.scrollTop,
            width: this.textarea.scrollWidth,
            height: this.textarea.scrollHeight,
        };
        const innerRect = {
            left: outerRect.left - scroll.left,
            top: outerRect.top - scroll.top,
            width: scroll.width,
            height: scroll.height,
        }

        const padding = {
            top: window.getComputedStyle(this.textarea).paddingTop,
            bottom: window.getComputedStyle(this.textarea).paddingBottom,
            left: window.getComputedStyle(this.textarea).paddingLeft,
            right: window.getComputedStyle(this.textarea).paddingRight,

        }
        this.overlapBox.style.left = `${outerRect.left}px`;
        this.overlapBox.style.top = `${outerRect.top}px`;
        this.overlapBox.style.width = `${outerRect.width}px`;
        this.overlapBox.style.height = `${outerRect.height}px`;
        this.overlapBoxScroll.style.left = `${innerRect.left - outerRect.left}px`;
        this.overlapBoxScroll.style.top = `${innerRect.top - outerRect.top}px`;
        this.overlapBoxScroll.style.width = `${innerRect.width}px`;
        this.overlapBoxScroll.style.height = `${innerRect.height}px`;
        this.overlapBoxScroll.style.paddingTop = `${padding.top}`;
        this.overlapBoxScroll.style.paddingBottom = `${padding.bottom}`;
        this.overlapBoxScroll.style.paddingLeft = `${padding.left}`;
        this.overlapBoxScroll.style.paddingRight = `${padding.right}`;
        this.overlapBoxScroll.scrollLeft = scroll.left;
        this.overlapBoxScroll.scrollTop = scroll.top;
        this.overlapBoxTextBefore.innerText = this.textarea.value.slice(0, cursorPosition);
        this.overlapBoxTextImplement.innerText = implement;
    }
    hideImplement() {
        this.overlapBox.style.display = 'none';
        this.hasImplement = false;
    }

    destroy() {
        this.destroyed = true;
        this.overlapBox.remove();
    }
}

let textarea2Copilot = {};

updateTextareas = () => {
    const textareas = Array.from(document.querySelectorAll('textarea, input[type="text"], input[type="search"]'));
    textareas.forEach((textarea) => {
        if (textarea.id == 'reply-title') return; // 水源社区的标题栏不处理
        if (!textarea2Copilot[textarea]) {
            textarea2Copilot[textarea] = new Copilot(textarea);
            console.log('New textarea:', textarea);
        }
    })
    Object.keys(textarea2Copilot).forEach((textarea) => {
        if (!Array.from(textareas).map(t => t == textarea).includes(true)) {
            console.log('Textarea removed:', textarea);
            textarea2Copilot[textarea].destroy();
            delete textarea2Copilot[textarea];
        }
    })

    console.log('Active textareas:', textarea2Copilot);
}

(() => {
    console.log('Content script loaded');
    filename = document.title;
    lang = "编程";
    chrome.storage.sync.get(['implementEnabled', 'apiPath'], (data) => {
        enabled = data.implementEnabled !== false;
        apiPath = data.apiPath || 'http://localhost:54259/implement';
    });
    if (enabled) {
        updateTextareas();
        document.addEventListener('click', () => {
            setTimeout(() => {
                if (document.activeElement.tagName === 'TEXTAREA' || (document.activeElement.tagName === 'INPUT' && (document.activeElement.type === 'text' || document.activeElement.type === 'search'))) {
                    updateTextareas();
                }
            }, 1);
        });
    }
})();