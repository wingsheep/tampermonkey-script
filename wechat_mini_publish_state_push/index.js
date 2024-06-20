// ==UserScript==
// @name         小程序审核状态截图推送
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  微信小程序审核状态截图推送
// @author       wingsheep
// @icon         data:image/png;base64,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
// @include      http://*/*
// @include      https://mp.weixin.qq.com/wxamp/wacodepage/getcodepage*
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

        // 初始化默认配置
    const defaultConfig = {
        apiUrl: '',
        mentionedMobileList: "@all",
    };

    // 加载配置
    function loadConfig() {
        return {
            apiUrl: GM_getValue('apiUrl', defaultConfig.apiUrl),
            mentionedMobileList: GM_getValue('mentionedMobileList', defaultConfig.mentionedMobileList),
        };
    }

    // 保存配置
    function saveConfig(config) {
        GM_setValue('apiUrl', config.apiUrl);
        GM_setValue('mentionedMobileList', config.mentionedMobileList);
    }

    // 显示配置对话框
    function showConfigDialog() {
        const config = loadConfig();
        const newApiUrl = prompt('请输入企业微信群机器人webhookurl:', config.apiUrl);
        const newMentionedMobileList = prompt('请输入企业微信群机器人@人员手机号(以逗号隔开):', config.mentionedMobileList);

        if (newApiUrl !== null && newMentionedMobileList !== null) {
            saveConfig({ apiUrl: newApiUrl, mentionedMobileList: newMentionedMobileList});
            alert('配置成功');
        }
    }

    // 注册菜单命令
    GM_registerMenuCommand('配置推送地址', showConfigDialog);

    // 使用配置
    const config = loadConfig();

    console.log('config', config)
    const fetchWechatPush = async (data)=>{
        if(!config.apiUrl) {
            showConfigDialog()
            return
        }
        await GM_xmlhttpRequest({
            method: 'POST',
            headers: {
                "Content-Type": 'application/json;charset=utf-8'
            },
            url: config.apiUrl,
            data: JSON.stringify(data)
        })
    }

    function loadScript(url, callback) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.onload = callback;
        document.head.appendChild(script);
    }
    function disabledButton(el) {
      el.classList.remove('weui-desktop-btn_disabled');
      el.classList.add('weui-desktop-btn_primary');
      el.style.cursor = 'not-allowed';
      el.disabled = true;
    }

    function enableButton(el) {
      el.classList.remove('weui-desktop-btn_disabled');
      el.classList.add('weui-desktop-btn_primary');
      el.style.cursor = 'pointer';
      el.disabled = false;
    }
    function addButton () {
        console.log('load...')
        const button = document.createElement('button');
        button.classList.add('weui-desktop-btn');
        button.classList.add('weui-desktop-btn_primary');
        button.textContent = '消息推送'
        button.style.background = '#fc5534';
        button.style.cursor = 'pointer';
        console.log(document.querySelector('.code_version_test .user_status'))
        const box = document.querySelector('.code_version_test .code_version_log_ft')
        if (!box) return
        box.appendChild(button);

        function captureDomElementAndCalculateMD5(element) {
            html2canvas(element).then(async (canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const imgBase64 = imgData.split(',')[1];
                const imgBuffer = Uint8Array.from(atob(imgBase64), c => c.charCodeAt(0));
                const md5Hash = SparkMD5.ArrayBuffer.hash(imgBuffer);
                await fetchWechatPush({
                    msgtype: "text",
                    text: {
                        content: `${document.querySelector('.user_name').title}小程序\n审核状态：${document.querySelector('.status_tag').innerText}\n详情如下`,
                        mentioned_mobile_list: config.mentionedMobileList.split(','),
                    }
                })
                await fetchWechatPush({
                    msgtype: "image",
                    image: {
                        base64: imgBase64,
                        md5: md5Hash,
                    }
                })
                enableButton(button)
            }).catch((error) => {
                console.error('Failed to capture DOM element:', error);
                enableButton(button)
            });
        }

        button.addEventListener('click', () => {
            disabledButton(button)
            // const selector = prompt('Enter the CSS selector of the element to capture:');
            const selector = '.code_version_test'
            if (selector) {
                const element = document.querySelector(selector);
                if (element) {
                    if (typeof window.html2canvas === 'undefined') {
                        loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', () => {
                            if (typeof window.SparkMD5 === 'undefined') {
                                loadScript('https://cdnjs.cloudflare.com/ajax/libs/spark-md5/3.0.0/spark-md5.min.js', () => {
                                    captureDomElementAndCalculateMD5(element);
                                });
                            } else {
                                captureDomElementAndCalculateMD5(element);
                            }
                        });
                    } else {
                        if (typeof window.SparkMD5 === 'undefined') {
                            loadScript('https://cdnjs.cloudflare.com/ajax/libs/spark-md5/3.0.0/spark-md5.min.js', () => {
                                captureDomElementAndCalculateMD5(element);
                            });
                        } else {
                            captureDomElementAndCalculateMD5(element);
                        }
                    }
                } else {
                    enableButton(button)
                    alert('Element not found!');
                }
            } else {
                enableButton(button)
            }
        });
    }

    function observeElement(selector) {
        const targetNode = document.querySelector(selector);
        if (targetNode) {
            addButton(targetNode);
        } else {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.matches && node.matches(selector)) {
                            addButton(node);
                            observer.disconnect();
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }
    window.addEventListener('load', () => {
         observeElement('.main_bd');
    });
})();
