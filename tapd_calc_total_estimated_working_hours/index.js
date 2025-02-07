// ==UserScript==
// @name         Tapd计算当前页面预估总工时
// @namespace    http://tampermonkey.net/
// @version      2025-02-07
// @description  tapd计算当前页面预估总工时
// @author       wingsheep
// @match        https://www.tapd.cn/*/prong/tasks*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tapd.cn
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  function convertHoursToDays(hours) {
      let days = Math.floor(hours / 8);
      let remainingHours = hours % 8;
      return days > 0 ? remainingHours > 0 ? `${days}天多${remainingHours}小时` : `${days}天` : `${remainingHours}小时`;
  }

  function addButton () {
      const button = document.createElement('a');
      button.classList.add('font-public');
      button.classList.add('font-public-code-count');
      button.textContent = '当页预估总工时：'
      const box = document.querySelector('.tfl-new-filter__ft')
      if (!box) return
      box.appendChild(button);

      function calcTotal() {
         let total = 0;
          document.querySelectorAll('[data-editable="digits"] .editable-value').forEach(el => {
              total += parseFloat(el.textContent.trim()) || 0;
          });
          console.log("总和:", total);
          return total;
      }
      button.textContent = `当页预估总工时: ${convertHoursToDays(calcTotal())}`

      button.addEventListener('click', () => {
          alert(`当前页面预估总工时共计 ${calcTotal()} 个小时`)
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

          observer.observe(document.querySelector('.tfl-new-filter'), {
              childList: false,
              subtree: false
          });
      }
  }
  window.addEventListener('load', () => {
       observeElement('.tfl-new-filter');
  });
})();
