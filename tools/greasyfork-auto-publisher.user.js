// ==UserScript==
// @name         GreasyFork - Universal Publisher Bridge
// @name:ru      GreasyFork - Универсальный мост авто-публикации
// @namespace    https://greasyfork.org/users/1522624-basimovif-ai
// @version      2.1.0
// @description  Universal bridge for automated userscript publishing, updating, and Markdown description styling from local files or GitHub.
// @description:ru Универсальный мост для автоматической публикации, обновления и оформления описаний скриптов на GreasyFork из локальных файлов или GitHub.
// @author       basimovif-ai
// @license      MIT
// @homepageURL  https://github.com/BasimovIF-AI/steamgifts-userscripts
// @supportURL   https://github.com/BasimovIF-AI/steamgifts-userscripts/issues
// @match        https://greasyfork.org/*/script_versions/new*
// @match        https://greasyfork.org/*/scripts/*/versions/new*
// @match        https://greasyfork.org/*/scripts/*/admin*
// @match        https://greasyfork.org/*/scripts/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      127.0.0.1
// @connect      localhost
// @connect      raw.githubusercontent.com
// @connect      github.com
// @connect      *
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const params = new URLSearchParams(window.location.search);
    const bridgePort = params.get('bridge');
    const jobId = params.get('job');
    const codeUrl = params.get('auto_code_url');
    const descUrl = params.get('auto_desc_url');
    const directDesc = params.get('auto_desc');
    const directChangelog = params.get('changelog');

    // 0. Автоматическая цепочка: если скрипт только что создан, переходим в /admin для заполнения описания
    const pendingDesc = sessionStorage.getItem('gf_pending_desc');
    if (pendingDesc && window.location.pathname.match(/\/scripts\/\d+-[^\/]+$/)) {
        sessionStorage.removeItem('gf_pending_desc');
        const nextUrl = window.location.pathname + '/admin?' + (bridgePort ? `bridge=${bridgePort}&job=${jobId || ''}&auto_desc=pending` : `auto_desc=pending`);
        sessionStorage.setItem('gf_pending_desc_text', pendingDesc);
        window.location.href = nextUrl;
        return;
    }

    // Если нет параметров для автоматизации и нет сохранённого описания — ничего не делаем
    const savedDesc = sessionStorage.getItem('gf_pending_desc_text');
    if (!bridgePort && !jobId && !codeUrl && !descUrl && !directDesc && !savedDesc) {
        return;
    }

    if (savedDesc && directDesc === 'pending') {
        sessionStorage.removeItem('gf_pending_desc_text');
    }

    const isRu = (navigator.language || '').toLowerCase().startsWith('ru');
    const i18n = {
        title: '🤖 GreasyFork Universal Bridge v2.1.0',
        connecting: isRu ? 'Связь с агентом / загрузка данных...' : 'Connecting to bridge / fetching data...',
        ready: isRu ? 'Все поля (код, CodeMirror, Markdown, описание) заполнены!' : 'All fields populated!',
        submittingIn: (s) => isRu ? `Авто-отправка через: ${s} сек...` : `Auto-submitting in: ${s}s...`,
        submitting: isRu ? '🚀 Отправка формы на сервер GreasyFork...' : '🚀 Submitting to GreasyFork...',
        nowBtn: isRu ? '🚀 Отправить сейчас' : '🚀 Submit Now',
        pauseBtn: isRu ? '⏸️ Пауза / Проверить' : '⏸️ Pause',
        paused: isRu ? 'Авто-отправка на паузе. Вы можете проверить форму и отправить вручную.' : 'Paused. You can submit manually.',
        error: isRu ? 'Ошибка моста:' : 'Bridge Error:'
    };

    // Создание плавающего информационного баннера
    const banner = document.createElement('div');
    banner.id = 'gf-universal-bridge-banner';
    Object.assign(banner.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '9999999',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        padding: '16px 20px',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
        border: '2px solid #38bdf8',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: '420px',
        fontSize: '14px',
        lineHeight: '1.5'
    });

    banner.innerHTML = `
        <div style="font-weight: 700; color: #38bdf8; font-size: 15px; margin-bottom: 6px;">${i18n.title}</div>
        <div id="gf-ub-status" style="color: #cbd5e1; margin-bottom: 12px;">${i18n.connecting}</div>
        <div id="gf-ub-actions" style="display: none; gap: 8px;">
            <button id="gf-ub-submit-now" style="background: #2563eb; color: white; border: none; padding: 7px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">${i18n.nowBtn}</button>
            <button id="gf-ub-pause" style="background: #ef4444; color: white; border: none; padding: 7px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">${i18n.pauseBtn}</button>
        </div>
    `;
    document.body.appendChild(banner);

    const statusEl = document.getElementById('gf-ub-status');
    const actionsEl = document.getElementById('gf-ub-actions');
    const submitNowBtn = document.getElementById('gf-ub-submit-now');
    const pauseBtn = document.getElementById('gf-ub-pause');

    let countdownTimer = null;

    // Внедрение кода в нативный контекст страницы для взаимодействия с CodeMirror и формой
    function injectPageScript(fn, ...args) {
        const script = document.createElement('script');
        script.textContent = '(' + fn.toString() + ')(' + args.map(a => JSON.stringify(a)).join(',') + ');';
        document.documentElement.appendChild(script);
        script.remove();
    }

    // Исполняется в нативном контексте окна GreasyFork
    function pageContextFiller(code, desc, changelog, isEditDesc) {
        // 1. Код скрипта и редактор CodeMirror
        const codeArea = document.querySelector('textarea#script_version_code, textarea[name="script_version[code]"]');
        if (codeArea && code && !isEditDesc) {
            codeArea.value = code;
            codeArea.dispatchEvent(new Event('input', { bubbles: true }));
            codeArea.dispatchEvent(new Event('change', { bubbles: true }));

            const cmEls = document.querySelectorAll('.CodeMirror');
            cmEls.forEach(cmEl => {
                if (cmEl.CodeMirror) {
                    cmEl.CodeMirror.setValue(code);
                    cmEl.CodeMirror.save();
                }
            });
        }

        // 2. Переключение разметки на Markdown
        const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
        const mdRadio = radios.find(r => r.value === 'markdown' || (r.id && r.id.toLowerCase().includes('markdown')));
        if (mdRadio) {
            mdRadio.checked = true;
            mdRadio.click();
            mdRadio.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const selects = Array.from(document.querySelectorAll('select'));
        for (const sel of selects) {
            if (sel.name && sel.name.includes('markup')) {
                sel.value = 'markdown';
                sel.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        // 3. Поле описания / дополнительной информации
        const allTextareas = Array.from(document.querySelectorAll('textarea'));
        const descArea = allTextareas.find(t => t !== codeArea && (t.name?.includes('additional_info') || t.id?.includes('additional_info'))) ||
                         allTextareas.find(t => t !== codeArea);

        if (descArea && desc) {
            descArea.value = desc;
            descArea.dispatchEvent(new Event('input', { bubbles: true }));
            descArea.dispatchEvent(new Event('change', { bubbles: true }));

            const cmDesc = descArea.nextElementSibling;
            if (cmDesc && cmDesc.CodeMirror) {
                cmDesc.CodeMirror.setValue(desc);
                cmDesc.CodeMirror.save();
            }
        }

        // 4. Поле Changelog
        const clInput = document.querySelector('input[name*="changelog"], textarea[name*="changelog"], input#script_version_changelog');
        if (clInput && changelog) {
            clInput.value = changelog;
            clInput.dispatchEvent(new Event('input', { bubbles: true }));
            clInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // 5. Авто-отметка чекбокса дубликата кода
        const dupCheck = document.querySelector('input[type="checkbox"][name*="allow_code_previously_posted"], input[type="checkbox"][name*="previously_posted"], input[type="checkbox"][name*="allow_code"], input[type="checkbox"][name*="version_check_override"]');
        if (dupCheck && !dupCheck.checked) {
            dupCheck.checked = true;
            dupCheck.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    function pageContextSubmit(pendingDescToSave) {
        if (pendingDescToSave) {
            sessionStorage.setItem('gf_pending_desc', pendingDescToSave);
        }

        document.querySelectorAll('.CodeMirror').forEach(cm => {
            if (cm.CodeMirror) cm.CodeMirror.save();
        });

        const dupCheck = document.querySelector('input[type="checkbox"][name*="allow_code_previously_posted"], input[type="checkbox"][name*="previously_posted"], input[type="checkbox"][name*="allow_code"], input[type="checkbox"][name*="version_check_override"]');
        if (dupCheck && !dupCheck.checked) {
            dupCheck.checked = true;
            dupCheck.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const submitBtn = document.querySelector('input[type="submit"][name="commit"], input[type="submit"], button[type="submit"]');
        if (submitBtn) {
            submitBtn.click();
        } else {
            const form = document.querySelector('form');
            if (form) form.submit();
        }
    }

    function reportToBridge(port, jId, resultData) {
        if (!port) return;
        try {
            GM_xmlhttpRequest({
                method: 'POST',
                url: `http://127.0.0.1:${port}/report`,
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify({ jobId: jId, url: window.location.href, ...resultData }),
                onload: () => {},
                onerror: () => {}
            });
        } catch (e) {
            console.error('Bridge report error:', e);
        }
    }

    function doSubmit(pendingDescToSave) {
        if (countdownTimer) clearInterval(countdownTimer);
        statusEl.innerHTML = `<span style="color: #38bdf8;">${i18n.submitting}</span>`;
        actionsEl.style.display = 'none';

        reportToBridge(bridgePort, jobId, { status: 'submitting' });
        injectPageScript(pageContextSubmit, pendingDescToSave || '');
    }

    pauseBtn.addEventListener('click', () => {
        if (countdownTimer) clearInterval(countdownTimer);
        statusEl.innerHTML = `<span style="color: #fbbf24;">${i18n.paused}</span>`;
        pauseBtn.style.display = 'none';
        banner.style.borderColor = '#fbbf24';
        reportToBridge(bridgePort, jobId, { status: 'paused' });
    });

    submitNowBtn.addEventListener('click', () => {
        doSubmit(currentPendingDesc);
    });

    // Функция выполнения GET-запроса через GM_xmlhttpRequest
    function fetchUrl(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: (res) => {
                    if (res.status >= 200 && res.status < 300) {
                        resolve(res.responseText);
                    } else {
                        reject(new Error(`HTTP ${res.status}: ${res.statusText}`));
                    }
                },
                onerror: (err) => reject(err)
            });
        });
    }

    let currentPendingDesc = '';

    // Главная логика загрузки и заполнения данных
    async function init() {
        try {
            let code = '';
            let description = savedDesc || directDesc || '';
            let changelog = directChangelog || '';
            let autoSubmit = true;
            let countdownSeconds = 5;

            // 1. Получение задачи из локального моста CLI (если передан bridge)
            if (bridgePort) {
                const jobJson = await fetchUrl(`http://127.0.0.1:${bridgePort}/job?id=${encodeURIComponent(jobId || '')}`);
                const jobData = JSON.parse(jobJson);

                if (jobData.code) code = jobData.code;
                if (jobData.description) description = jobData.description;
                if (jobData.changelog) changelog = jobData.changelog;
                if (typeof jobData.autoSubmit === 'boolean') autoSubmit = jobData.autoSubmit;
                if (jobData.timeout) countdownSeconds = jobData.timeout;
            }

            // 2. Получение данных по внешним URL (GitHub или любые ссылки)
            if (!code && codeUrl) {
                code = await fetchUrl(codeUrl);
            }
            if (!description && descUrl) {
                description = await fetchUrl(descUrl);
            }

            const isEditDescPage = window.location.pathname.endsWith('/admin');
            const isNewScriptPage = window.location.pathname.endsWith('/script_versions/new');

            // Если создаётся новый скрипт и есть описание, запоминаем его для цепочки в /admin
            if (isNewScriptPage && description) {
                currentPendingDesc = description;
            }

            // Внедряем данные в страницу
            injectPageScript(pageContextFiller, code, description, changelog, isEditDescPage);

            statusEl.innerHTML = `<span style="color: #4ade80;">${i18n.ready}</span><br><b>${i18n.submittingIn(countdownSeconds)}</b>`;
            actionsEl.style.display = 'flex';
            banner.style.borderColor = '#4ade80';

            reportToBridge(bridgePort, jobId, { status: 'populated' });

            if (autoSubmit) {
                let sec = countdownSeconds;
                countdownTimer = setInterval(() => {
                    sec--;
                    if (sec > 0) {
                        statusEl.innerHTML = `<span style="color: #4ade80;">${i18n.ready}</span><br><b>${i18n.submittingIn(sec)}</b>`;
                    } else {
                        doSubmit(currentPendingDesc);
                    }
                }, 1000);
            }

        } catch (err) {
            console.error('Universal Publisher Bridge Error:', err);
            statusEl.innerHTML = `<span style="color: #f87171;">${i18n.error} ${err.message}</span>`;
            banner.style.borderColor = '#f87171';
            reportToBridge(bridgePort, jobId, { status: 'error', error: err.message });
        }
    }

    setTimeout(init, 500);

})();
