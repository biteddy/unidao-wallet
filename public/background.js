

//Chrome扩展背景脚本
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'authorize') {
        // 处理DApp的授权请求
    }
    if (request.action === 'signTransaction') {
        // 签署交易并发送响应
    }
});
