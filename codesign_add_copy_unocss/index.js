// ==UserScript==
// @name         Convert Inline Styles to UnoCSS
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  将所有内联 style 自动转换为 UnoCSS 类名（使用 transform-to-unocss-core）
// @author       You
// @match        https://codesign.qq.com/app/design/*/board
// @grant        none
// ==/UserScript==

(async function () {
    'use strict'

    const { transformStyleToUnocss, toUnocssClass } = await import('https://esm.sh/transform-to-unocss-core')

    const SELECTORS = {
        inspector: '.screen-inspector.inspector',
        codeItem: '.css-node__code--item',
        codeTab: '.css-node__code',
        codeTabNavs: '.css-node__codes--navs',
        codeTabContent: '.css-node__codes',
        copyButton: '.css-node__copy',
        unoCssTabId: 'unocss_code',
        copyTip: '.copy-tip',
    }

    let initialized = false
    let contentObserver = null

    /** 将 styleText 转换为 UnoCSS 类名 */
    function convertElementStyleToUnoCSS(styleText) {
        if (!styleText) return ''
        try {
            const uno = toUnocssClass(styleText)
            return uno?.[0] || ''
        } catch (err) {
            console.warn('[UnoCSS Error]', err)
            return ''
        }
    }

    /** 从 DOM 提取 style 并转换为 UnoCSS */
    function getUnoCssFromDom(dom) {
        return convertElementStyleToUnoCSS(dom?.textContent?.trim())
    }

    /** 定位并显示复制提示 */
    function positionCopyTipRelativeTo(targetDom) {
        const copyTipDom = document.querySelector(SELECTORS.copyTip)
        if (!copyTipDom || !targetDom) return

        const rect = targetDom.getBoundingClientRect()
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft

        const tipWidth = copyTipDom.offsetWidth
        const tipHeight = copyTipDom.offsetHeight

        const top = rect.top + scrollTop - tipHeight - 8
        const left = rect.left + scrollLeft + rect.width / 2 - tipWidth / 2

        copyTipDom.style.top = `${top - 20}px`
        copyTipDom.style.left = `${left}px`
        copyTipDom.style.display = 'unset'
    }

    /** 执行复制并显示提示 */
    function copyDomContent(element) {
        const range = document.createRange()
        const selection = window.getSelection()
        selection.removeAllRanges()
        range.selectNodeContents(element)
        selection.addRange(range)

        try {
            const success = document.execCommand('copy')
            if (success) {
                positionCopyTipRelativeTo(element)
                console.log('复制成功 ✅')
            } else {
                console.error('复制失败 ❌')
            }
        } catch (err) {
            console.error('复制失败 ❌', err)
        }

        setTimeout(() => {
            const tip = document.querySelector(SELECTORS.copyTip)
            if (tip) tip.style.display = 'none'
        }, 1000)
    }

    /** 更新 UnoCSS 内容 */
    function updateUnoCssText() {
        const unoTarget = document.querySelectorAll(SELECTORS.codeItem)
        const unoContent = unoTarget[unoTarget.length - 1]
        if (unoContent) {
            unoContent.textContent = getUnoCssFromDom(document.querySelector(SELECTORS.codeItem))
        }
    }

    /** 创建自定义 UnoCSS tab 和内容 */
    function createElement() {
        const navsContentDom = document.querySelector(SELECTORS.codeTabContent)
        const navsDom = document.querySelector(SELECTORS.codeTabNavs)
        const originalCopyDom = document.querySelector(SELECTORS.copyButton)

        if (!navsDom || !navsContentDom || !originalCopyDom || document.getElementById(SELECTORS.unoCssTabId)) return

        const copyDom = originalCopyDom.cloneNode(true)
        copyDom.style.display = 'none'
        originalCopyDom.parentNode.insertBefore(copyDom, originalCopyDom.nextSibling)

        const span = document.createElement('span')
        span.classList.add('css-node__code')
        span.id = SELECTORS.unoCssTabId
        span.textContent = ' UnoCss '
        navsDom.appendChild(span)

        const unoCssText = getUnoCssFromDom(document.querySelector(SELECTORS.codeItem))
        const content = document.createElement('div')
        content.classList.add('css-node__code--item')
        content.style.display = 'none'
        content.textContent = unoCssText
        navsContentDom.appendChild(content)

        const codeTabs = document.querySelectorAll(SELECTORS.codeTab)
        const codeItems = document.querySelectorAll(SELECTORS.codeItem)

        codeTabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                codeTabs.forEach(t => t.classList.remove('css-node__code--active'))
                codeItems.forEach(ci => { ci.style.display = 'none' })

                const isUno = index === codeTabs.length - 1
                originalCopyDom.style.display = isUno ? 'none' : 'block'
                copyDom.style.display = isUno ? 'block' : 'none'

                tab.classList.add('css-node__code--active')
                if (codeItems[index]) codeItems[index].style.display = ''
            })
        })

        copyDom.addEventListener('click', () => {
            const dom = codeItems[codeItems.length - 1]
            if (dom) copyDomContent(dom)
        })
    }

    /** 等待 DOM 元素出现再执行 */
    function waitForElement(selector, callback) {
        const target = document.querySelector(selector)
        if (target) return callback(target)

        const observer = new MutationObserver(() => {
            const target = document.querySelector(selector)
            if (target) {
                observer.disconnect()
                callback(target)
            }
        })

        observer.observe(document.body, {
            childList: true,
            subtree: true
        })
    }

    /** 监听 class 变化（如 expanded） */
    function observeClassChange(targetElement, className, callback) {
        const observer = new MutationObserver(() => {
            callback(targetElement.classList.contains(className))
        })

        observer.observe(targetElement, {
            attributes: true,
            attributeFilter: ['class'],
        })

        return observer
    }

    /** 监听 DOM 内容变化 */
    function observeContentChange(targetElement, callback) {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    callback()
                    break
                }
            }
        })

        observer.observe(targetElement, {
            childList: true,
            characterData: true,
            subtree: true
        })

        return observer
    }

    /** 主逻辑入口 */
    waitForElement(SELECTORS.inspector, (el) => {
        observeClassChange(el, 'expanded', (isExpanded) => {
            if (isExpanded && !initialized) {
                initialized = true
                console.log('🔼 expanded 展开')
                createElement()

                const codeDom = document.querySelector(SELECTORS.codeItem)
                if (codeDom) {
                    contentObserver = observeContentChange(codeDom, updateUnoCssText)
                }
            } else if (!isExpanded) {
                console.log('🔽 expanded 收起')
                if (contentObserver) {
                    contentObserver.disconnect()
                    contentObserver = null
                }
                initialized = false
            }
        })
    })
})()
