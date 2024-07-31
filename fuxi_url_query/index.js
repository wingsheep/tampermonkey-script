// ==UserScript==
// @name         伏羲平台打开指定job&env
// @namespace    http://tampermonkey.net/
// @version      2024-07-30
// @description  *?jobName=vehicle-new-web&env=beta jobName -> 任务名称 env -> 环境
// @author       wingsheep
// @match        http://next-manage.hgj.net/hgj-ops-admin/deployDash*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hgj.net
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  const queryString = window.location.search
  const params = new URLSearchParams(queryString);
  let jobName = params.get('jobName');
  const env = params.get('env');
  const regex = /.*\/mixmicro-ops-api\/v1\/([^\/]+)\/service-configs.*/;
  let inputEl = null
  let resetEl = null

   window.addEventListener('load', () => {
      // inputEl = document.querySelector('#app > div > main > div.app-layout > div.content > div > div.el-card.operator-area.is-always-shadow > div > form > div:nth-child(1) > div > div > input')
      // resetEl = document.querySelector('#app > div > main > div.app-layout > div.content > div > div.el-card.operator-area.is-always-shadow > div > form > div:nth-child(3) > div > div > button:nth-child(2)')
      // resetEl?.addEventListener('click', () => {
      //   jobName = ''
      // })
      // inputEl ? inputEl.value = jobName : ''
      jobName = ''
  });
  const configEnv = env || 'dev'
  const sessionEnv = JSON.parse(sessionStorage.getItem('environment_info'))?.name || 'dev'
  log('configEnv', configEnv)
  log('sessionEnv', sessionEnv)

  // Debugging utility
  function log(...args) {
      console.log('[Tampermonkey Script]', ...args);
  }
  if (!jobName) return
   // 标志变量，标识是否已经拦截过请求
  let hasIntercepted = false;
  // 拦截XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      this._url = url
      if(sessionEnv !== configEnv) {
          if (url.includes('/mixmicro-ops-api/v1/envs')){
            return originalOpen.apply(this, arguments);
          }
          return false
      }

      // 仅拦截GET请求并且URL包含目标端点
      if (method === 'GET' && regex.test(url)) {
          log('Target API endpoint detected in GET request:', url);
          const match = regex.exec(url);
          const variablePart = match[1];
          // 修改URL中的路径部分
          // url = url.replace(variablePart, configEnv);

          // 创建URL对象以便修改参数
          let urlObj = new URL(url, window.location.origin);
          // 修改查询参数
          jobName ? urlObj.searchParams.set('configName', jobName) : '';

          log('Modified URL:', urlObj.toString());

          // 更新URL
          arguments[1] = urlObj.toString();
          hasIntercepted = true
      }

      return originalOpen.apply(this, arguments);
  };

  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(body) {
       this.addEventListener('readystatechange', function() {
          if (this.readyState === 4 && this.status === 200 && this._url.includes('/mixmicro-ops-api/v1/envs')) {
              try {
                  const responseText = this.responseText;
                  const responseData = JSON.parse(responseText);

                  const environment_info = responseData.find(item => item.name === configEnv) || responseData[0]
                  sessionStorage.setItem('environment_info', JSON.stringify(environment_info))
                  if(sessionEnv !== configEnv) {
                      window.location.reload()
                   }
              } catch (e) {
                  log('Error parsing XMLHttpRequest response:', e);
              }
          }
      });

      return originalSend.call(this, body);
  };


})();
