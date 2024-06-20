// ==UserScript==
// @name         TAPD文本录入任务
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  TAPD文本录入任务，支持数学表达式计算任务工时
// @author       ChatGPT
// @match        https://www.tapd.cn/*/prong/stories/view/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
  'use strict';

  let title = ''
  let storyId = ''
  let workId = ''
  let user = ''

GM_addStyle(`

/* 遮罩层样式 */
      #overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          flex-direction: column;
          justify-content: center;
          z-index: 9999;
          visibility: hidden;
      }
      #progress-main,#progress-title {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: 600;
        font-size: 18px;
      }

      /* 进度条容器样式 */
      #progress-container {
          width: 80%;
          max-width: 600px;
          background-color: #f3f3f3;
          border-radius: 5px;
          overflow: hidden;
      }

      /* 进度条样式 */
      #progress-bar {
          width: 0;
          height: 30px;
          background-color: #4caf50;
          transition: width 0.3s;
      }

      /* 文本样式 */
      #progress-text {
          text-align: center;
          padding: 10px;
          color: #fff;
          font-weight: 600;
          font-size: 18px;
      }
`)

  function addMask() {
      const mask = document.createElement('div')
      mask.innerHTML = `
        <div id="overlay">
          <div id="progress-title">录入进度：<span class="content"></span>(<span class="count"></span>)</div>
          <div id="progress-main">
            <div id="progress-container">
              <div id="progress-bar"></div>
            </div>
          <div id="progress-text">0%</div>
          </div>
       </div>
      `
      document.body.appendChild(mask)
  }

  async function callApiSequentially(list, allCount) {
      const overlay = document.getElementById('overlay');
      const total = list.length;
      // 显示遮罩层
      overlay.style.visibility = 'visible';

      for (let i = 0; i < total; i++) {
          const item = list[i]
          try {
              await addTask(item);
          } catch (error) {
              console.error('Error calling API:', error);
          }
          updateProgressBar(i + 1, total, item);
      }

      updateProgressBar(total, total, {text: '录入完成', number: allCount});
      setTimeout(() => {
          alert('录入完成，刷新页面！！！')
          overlay.style.visibility = 'hidden';
          window.location.reload()
      }, 500);

  }

  function updateProgressBar(completed, total, item) {
      const percentage = Math.round((completed / total) * 100);
      const progressBar = document.getElementById('progress-bar');
      const progressText = document.getElementById('progress-text');
      const progressCount = document.querySelector('#progress-title .count');
      const progressContent = document.querySelector('#progress-title .content');
      progressBar.style.width = `${percentage}%`;
      progressText.textContent = `${percentage}%`;
      progressCount.textContent = `${completed}/${total}`;
      progressContent.textContent = `${item.text}_${item.number}`;
  }

  // 计算数学表达式的函数
  function parseInput(input) {
      const lines = input.split('\n');
      const content = lines.map(line => {
          const parts = line.split(/(\d+\s*[\+\-\*\/]\s*\d+|\d+)/); // 分离文字和数字表达式
          const text = parts[0].trim();
          const expression = parts.slice(1).join('').trim();
          try {
            const number = math.evaluate(expression);
            return { text, number };
          } catch (error) {
            console.log(error)
            alert(`检查数字表达式:${text} ${expression}，标题结尾不要有数字`)
          }
      });
      const total = content.filter(item => typeof item.number === 'number' && item.number > 0).reduce((sum, item) => sum + item.number, 0);
      return { content, total };
  };
  // 提取标题
  function extractFields() {
      const inputString = document.querySelector('#title-copy-btn-new').dataset.clipboardText
      const titleMatch = inputString.match(/【([^【】]+)】/);
      const title = titleMatch ? titleMatch[1] : null;
      // 提取 storyId 和 workId
      const urlMatch = inputString.match(/https:\/\/www\.tapd\.cn\/(\d+)\/prong\/stories\/view\/(\d+)/);
      const workId = urlMatch ? urlMatch[1] : null;
      const storyId = urlMatch ? urlMatch[2] : null;

      return {
          title,
          storyId,
          workId
      };
  }
  // 提取 user
  function extractUser() {
      const inputString = document.querySelector('#svn_keyword_new').dataset.clipboardText
      const userMatch = inputString.match(/--user=([^\s]+)/);
      const user = userMatch ? userMatch[1] : null;

      return user + ';'
  }
  function jsonToQueryString(json) {
      // 创建一个数组来存储每个键值对
      const queryString = [];

      // 递归处理嵌套的对象
      function buildQuery(obj, prefix) {
          for (const key in obj) {
              if (obj.hasOwnProperty(key)) {
                  const value = obj[key];
                  const prefixedKey = prefix ? `${prefix}[${key}]` : key;

                  if (value !== null && typeof value === 'object') {
                      buildQuery(value, prefixedKey);
                  } else {
                      queryString.push(`${encodeURIComponent(prefixedKey)}=${encodeURIComponent(value)}`);
                  }
              }
          }
      }

      // 开始构建查询字符串
      buildQuery(json, '');

      // 将数组中的键值对连接成字符串
      return queryString.join('&');
  }

  async function addTask(item) {
      const json = {
          data: {
              Task: {
                  name: item.text,
                  effort: item.number,
                  owner: user,
                  begin: "",
                  due: ""
              }
          }
      };
      const queryString = jsonToQueryString(json);

      const res = await fetch(`https://www.tapd.cn/${workId}/prong/tasks/quick_add_task/${storyId}?is_from_story_view=true`, {
          "headers": {
              "accept": "text/plain, */*; q=0.01",
              "accept-language": "zh-CN,zh;q=0.9",
              "cache-control": "no-cache",
              "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
              "dsc-token": "TLhP4Ec1Do9SUy6t",
              "pragma": "no-cache",
              "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": "\"macOS\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-requested-with": "XMLHttpRequest"
          },
          "referrer": `https://www.tapd.cn/${workId}/prong/stories/view/${storyId}?only_content=true`,
          "referrerPolicy": "strict-origin-when-cross-origin",
          "body": queryString,
          "method": "POST",
          "mode": "cors",
          "credentials": "include"
      });
  }



  function addButton(node) {
      const fields = extractFields()
      title = fields.title
      storyId = fields.storyId
      workId = fields.workId
      user = extractUser()

      console.log({title, storyId, workId, user})
       // 在页面上插入一个按钮
      const button = document.createElement('a');
      button.textContent = '文本快速录入';

      node.querySelector('.task-quick-aciton-bar').appendChild(button);

      // 按钮点击事件
      button.addEventListener('click', () => {
          if (typeof window.math === 'undefined') {
              loadScript('https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.4.2/math.min.js', () => {
                  parseText();
              });
          } else {
              parseText();

          }

      });
  }

  function parseText() {
      const input = prompt("请粘贴录入文本", `${title}  2`);
      if (input === null) {
          return false;
      }
      // 解析文本并输出结果
      const result = parseInput(input);
      if(typeof result.total === 'number' && result.total > 0 && result.content.length > 0 ) {
          const confirmText = `\n处理人：${user} \n总工时: ${result.total}\n\n详情如下:\n${result.content.map(item => `${item.text}: ${item.number}`).join('\n')}`

          const res = confirm(`确认录入以下内容吗？\n ${confirmText}`);
          // 根据用户的选择进行不同的操作
          if (res) {
            callApiSequentially(result.content, result.total)
          }
      } else {
          alert('内容格式有误，工时不能为0，请重新输入')
          parseText()
      }
  }

  function loadScript(url, callback) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.onload = callback;
      document.head.appendChild(script);
  }


  function observeElement(selector) {
      const targetNode = document.querySelector(selector);
      if (targetNode) {
          addButton(targetNode);
          addMask()
      } else {
          const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                  mutation.addedNodes.forEach((node) => {
                      if (node.matches && node.matches(selector)) {
                          addButton(node);
                          addMask()
                          observer.disconnect();
                      }
                  });
              });
          });

          observer.observe(document.querySelector('#Tasks_div'), {
              childList: true,
              subtree: true
          });
      }
  }
  window.addEventListener('load', () => {
       observeElement('#div_task_list');
       addMask()
  });
})();
