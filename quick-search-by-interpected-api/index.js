// ==UserScript==
// @name         拦截接口快捷搜索支持拼音
// @namespace    http://tampermonkey.net/
// @version      2024-11-21
// @description  try to take over the world!
// @author       wingsheep
// @match        http://*/unified-web/home
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hgj.net
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const targetUrlPattern = /\/workbench\/appRecords/;
  let searchIndex = [];
  let selectedIndex = -1;
  const interceptedData = []; // 用于存储拦截的数据

  // 加载 pinyin
  const loadPinyinLibrary = () => {
      if (window.pinyinPro) {
          console.log('Pinyin library already loaded.');
          return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/pinyin-pro@3.18.2/dist/index.js';
          script.onload = () => {
              console.log('Pinyin library loaded');
              resolve();
          };
          script.onerror = () => {
              console.error('Failed to load pinyin library');
              reject(new Error('Failed to load pinyin library'));
          };
          document.body.appendChild(script);
      });
  };

  // 重写 XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
      this._url = url;

      // 如果 URL 匹配目标接口，添加拦截逻辑
      if (targetUrlPattern.test(url)) {
          this.addEventListener('readystatechange', function () {
              if (this.readyState === 4) { // 请求完成
                  try {
                      const response = JSON.parse(this.responseText);
                      if (response.data) {
                          interceptedData.push(...response.data.dataList);
                          console.log('拦截到数据:', interceptedData);

                          // 如果 pinyin.js 已加载，立即处理
                          if (window.pinyinPro) {
                              processAppData();
                          }
                      }
                  } catch (err) {
                      console.error('解析数据失败:', err);
                  }
              }
          });
      }

      originalXHROpen.apply(this, arguments);
  };

  // 拼音库加载后处理已拦截数据
  loadPinyinLibrary().then(() => {
      if (interceptedData.length > 0) {
          processAppData();
      }
  }).catch(err => console.error(err));

  // 构建拼音搜索索引
  function buildSearchIndex() {
      searchIndex = interceptedData.map(item => {
          const appName = item.appName;
          const pinyinFull = window.pinyinPro.pinyin(appName, { toneType: 'none' });
          const pinyinFullNoSpace = window.pinyinPro.pinyin(appName, { toneType: 'none', type: 'array' }).join('');
          const pinyinInitials = window.pinyinPro.pinyin(appName, {toneType: 'none', pattern: 'initial', type: 'array' }).join(''); // 首字母

          return {
              appName,
              appUrl: item.appIndex,
              appIcon: item.picUrl,
              pinyinFull,
              pinyinFullNoSpace,
              pinyinInitials
          };
      });
      console.log('拼音索引构建完成:', searchIndex);
  }

  // 数据处理函数
  function processAppData() {
      buildSearchIndex();
  }

  // 创建搜索弹窗
  function createSearchPopup() {
      const popup = document.createElement('div');
      popup.id = 'app-search-popup';
      popup.style.position = 'fixed';
      popup.style.top = '20%';
      popup.style.left = '50%';
      popup.style.transform = 'translate(-50%, -20%)';
      popup.style.zIndex = 9999;
      popup.style.padding = '20px';
      popup.style.backgroundColor = '#fff';
      popup.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
      popup.style.borderRadius = '8px';
      popup.style.width = '400px';
      popup.style.display = 'none';

      // 搜索框
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = '搜索应用（支持拼音）';
      input.style.width = '100%';
      input.style.padding = '10px';
      input.style.marginBottom = '10px';
      input.style.fontSize = '16px';
      input.style.boxSizing = 'border-box';

      // 列表容器
      const list = document.createElement('ul');
      list.style.listStyle = 'none';
      list.style.padding = '0';
      list.style.margin = '0';
      list.style.maxHeight = '300px';
      list.style.overflowY = 'auto';

      popup.appendChild(input);
      popup.appendChild(list);
      document.body.appendChild(popup);

      // 输入框搜索
      input.addEventListener('input', () => {
          const query = input.value.toLowerCase();
          const filteredData = searchIndex.filter(item =>
              item.appName.toLowerCase().includes(query) || // 原始名称
              item.pinyinFull.includes(query) || // 拼音全拼
              item.pinyinFullNoSpace.includes(query) || // 拼音全拼无空格
              item.pinyinInitials.includes(query) // 拼音首字母无空格
          );
          renderList(filteredData, list);

      });

      // 渲染列表
      function renderList(data, container) {
          container.innerHTML = '';
          data.forEach((item, index) => {
              const li = document.createElement('li');
              li.style.padding = '8px';
              li.style.cursor = 'pointer';
              li.style.display = 'flex';
              li.style.alignItems = 'center';
              li.style.justifyCcontent = 'flex-start';
              li.style.gap = '10px';
              li.style.borderBottom = '1px solid #ddd';
              li.dataset.index = index;

              const imgWrap = document.createElement('div')
              imgWrap.style.width = '20px';
              imgWrap.style.height = '20px';
              imgWrap.style.lineHeight = '20px';
              imgWrap.style.borderRadius = '50%';
              imgWrap.style.background = '#525ddf'
              imgWrap.style.overflow = 'hidden'
              imgWrap.style.color = '#fff'
              imgWrap.style.fontSize = '12px'
              imgWrap.style.fontWeight = '700'
              imgWrap.style.textAlign = 'center'

              if(item.appIcon) {
                  const img = document.createElement('img')
                  img.src = item.appIcon
                  img.style.width = '20px';
                  img.style.height = '20px';
                  img.style.borderRadius = '50%';
                  img.style.background = '#525ddf'
                  imgWrap.appendChild(img)
              } else {
                  imgWrap.textContent = item.appName.substring(0,1)
              }

              li.appendChild(imgWrap)

              const span = document.createElement('span')

              span.textContent = item.appName;
              li.appendChild(span)

              li.addEventListener('click', () => {
                  window.open(item.appUrl, '_blank');
                  hidePopup();
              });
              li.addEventListener('mouseover', () => {
                  setSelectedIndex(index);
              });

              container.appendChild(li);
          });
          selectedIndex = data.length ? 0 : -1; // 重置选中状态
          setSelectedIndex(selectedIndex)
      }

      // 设置选中状态
      function setSelectedIndex(index) {
          const items = list.querySelectorAll('li');
          items.forEach((item, i) => {
              item.style.backgroundColor = i === index ? '#f0f0f0' : '';
          });
          selectedIndex = index;
          autoScrollList(index, list); // 每次更新选中项后滚动列表
      }

      function autoScrollList(index, container) {
          const items = container.querySelectorAll('li');
          const selectedItem = items[index];
          if (!selectedItem) return;

          const containerHeight = container.offsetHeight;
          const itemTop = selectedItem.offsetTop;
          const itemHeight = selectedItem.offsetHeight;

          if (itemTop < container.scrollTop) {
              // 如果选中的项在视口上方，滚动到该项
              container.scrollTop = itemTop;
          } else if (itemTop + itemHeight > container.scrollTop + containerHeight) {
              // 如果选中的项在视口下方，滚动到该项
              container.scrollTop = itemTop + itemHeight - containerHeight;
          }
      }

      // 显示弹窗
      function showPopup() {
          input.value = '';
          renderList(searchIndex, list);
          popup.style.display = 'block';
          input.focus();
      }

      // 隐藏弹窗
      function hidePopup() {
          popup.style.display = 'none';
      }

      // 监听快捷键
      document.addEventListener('keydown', (e) => {
          if (e.metaKey && e.key.toLowerCase() === 'j') {
              if (popup.style.display === 'none') {
                  showPopup();
              } else {
                  hidePopup();
              }
          }

          if (popup.style.display === 'block') {
              const items = list.querySelectorAll('li');
              if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setSelectedIndex((selectedIndex + 1) % items.length);
              } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setSelectedIndex(
                      (selectedIndex - 1 + items.length) % items.length
                  );
              } else if (e.key === 'Enter' && selectedIndex !== -1) {
                  e.preventDefault();
                  const selectedItem = items[selectedIndex];
                  if (selectedItem) {
                      const item = searchIndex[selectedItem.dataset.index];
                      window.open(item.appUrl, '_blank');
                      hidePopup();
                  }
              } else if (e.key === 'Escape') {
                  hidePopup();
              }
          }
      });
  }

  // 确保 pinyin.js 加载后初始化弹窗
  loadPinyinLibrary().then(createSearchPopup).catch(err => console.error(err));
})();
