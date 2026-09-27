#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 18234;

// Описания для скриптов проекта SteamGifts
const DESCRIPTIONS = {
    'steamgifts-chance-per-point.user.js': `### 🎯 About / О скрипте
**EN**: Calculates your **exact win probability per single entry point in basis points (‱)** and adds a dynamic filter to hide low-yield giveaways on SteamGifts.
**RU**: Рассчитывает **точный шанс на победу за одно затраченное очко в базисных пунктах (‱)** и позволяет скрывать невыгодные раздачи на странице участий SteamGifts.

---

### 🌟 Key Features / Возможности

* **🧮 Smart Calculation / Точный расчёт шанса**:
  * **Formula / Формула**: \`(Copies / (Entries * Points)) * 10,000‱\`
  * **Basis Points (‱)**: Instead of confusing numbers like \`0.0012%\`, values are shown as clean numbers like \`12.50‱\` or \`2.40‱\` (\`1‱ = 0.01% = 0.0001\`).
  * **Dedicated Column**: Adds a styled column \`Шанс/Очко (‱)\` / \`Chance/Pt (‱)\` to the entered giveaways table.
* **🔍 Dynamic Threshold Filter / Фильтр раздач**:
  * Input your threshold (e.g. \`1.00‱\`) and click **Filter** to instantly hide giveaways with lower winning chances.
  * **Reset** button restores all rows in 1 click.
  * Automatic observation via \`MutationObserver\` for continuous scrolling/pagination.
* **🌐 Bilingual UI / Двуязычный интерфейс**:
  * UI buttons, tooltips, and column headers automatically adapt to browser language (\`RU\` / \`EN\`).

---

### 💻 Source Code & Support
* **GitHub Repository**: [https://github.com/BasimovIF-AI/steamgifts-userscripts](https://github.com/BasimovIF-AI/steamgifts-userscripts)
* **License**: [MIT License](https://opensource.org/licenses/MIT)`,

    'steamgifts-group-stats-checker.user.js': `### 👥 About / О скрипте
**EN**: Displays interactive group statistics for the user on giveaway pages and automatically fills courteous creator thank-you comments.
**RU**: Отображает интерактивные кнопки статистики пользователя в группах раздачи и автоматически заполняет вежливую благодарность создателю раздачи.

---

### 🌟 Key Features / Возможности

* **📊 Group Stat Buttons / Проверка баланса в группах**:
  * Automatically detects all groups linked to the giveaway and places stat buttons next to group indicators.
  * Fetches gifts sent vs received and dollar value difference.
  * **Color Validation**: 🟢 Green for exact match with site data, 🔴 Red for discrepancies.
* **🔍 Clickable Math Breakdown / Раскрытие формулы по клику**:
  * **Collapsed**: Summary \`(+5; +$82.50)\`.
  * **Expanded (on click)**: Exact math formula \`(12-7=+5; $150-$67.5=+$82.50)\` and total \`Gifts Won\` count!
* **✍️ Creator Thank-You Autofill / Авто-комментарий автору**:
  * Automatically fills empty description field with: \`Thanks a lot [CreatorName]!\`.

---

### 💻 Source Code & Support
* **GitHub Repository**: [https://github.com/BasimovIF-AI/steamgifts-userscripts](https://github.com/BasimovIF-AI/steamgifts-userscripts)
* **License**: [MIT License](https://opensource.org/licenses/MIT)`,

    'steamgifts-region-auto-selector.user.js': `### 🌍 About / О скрипте
**EN**: Bypasses Cloudflare by opening SteamDB in a brief temporary tab and auto-selects restricted countries when creating SteamGifts giveaways.
**RU**: Обходит Cloudflare открытием временной вкладки SteamDB и автоматически отмечает региональные ограничения при создании раздачи на SteamGifts.

---

### 🌟 Key Features / Возможности

* **🛡️ Seamless Cloudflare Bypass / Обход Cloudflare**:
  * Opens a temporary tab to let the browser natively pass Cloudflare, parses package restrictions, and closes automatically.
* **⚡ 1-Click Import by SubID / Импорт по SubID в 1 клик**:
  * Enter Steam package SubID (e.g. \`828967\`) and click **Apply**. All restricted/allowed countries are selected automatically in the SteamGifts form!
* **⚠️ Discrepancy Warnings / Сверка стран**:
  * Warns you if any country codes from SteamDB are missing from SteamGifts database.

---

### 💻 Source Code & Support
* **GitHub Repository**: [https://github.com/BasimovIF-AI/steamgifts-userscripts](https://github.com/BasimovIF-AI/steamgifts-userscripts)
* **License**: [MIT License](https://opensource.org/licenses/MIT)`,

    'steamgifts-unlucky-7-winner-stats-copy.user.js': `### 🎲 About / О скрипте
**EN**: Displays interactive winner stats for the Unlucky-7 group on giveaway pages and allows 1-click formatted clipboard copying.
**RU**: Отображает интерактивную статистику победителей группы Unlucky-7 на страницах раздач и позволяет копировать отформатированные данные в буфер обмена.

---

### 🌟 Key Features / Возможности

* **🎯 Targeted Activation / Точечная активация**:
  * Runs exclusively on giveaway winner pages (\`.../giveaway/*/winners\`) for the \`Unlucky-7\` group.
* **📊 Interactive Winner Stats / Статистика победителя**:
  * Displays gift & value difference with clickable calculation breakdown.
  * Color-coded validation: 🟢 Green for match, 🔴 Red for discrepancy.
* **📋 1-Click Copy / Копирование для отчётности**:
  * Copies formatted string tailored for group accounting:
    * \`<= 8 wins\`: \`GA: <url>\\nWinner: <user> (Xth win)\`
    * \`> 8 wins\`: \`GA: <url>\\nWinner: <user> (Gifter, +X)\`

---

### 💻 Source Code & Support
* **GitHub Repository**: [https://github.com/BasimovIF-AI/steamgifts-userscripts](https://github.com/BasimovIF-AI/steamgifts-userscripts)
* **License**: [MIT License](https://opensource.org/licenses/MIT)`
};

// Хранилище активных задач
const jobs = new Map();

function createServer() {
    return http.createServer((req, res) => {
        const parsedUrl = new URL(req.url, `http://127.0.0.1:${PORT}`);

        // CORS заголовки
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        // Эндпоинт отдачи задачи в Tampermonkey
        if (parsedUrl.pathname === '/job') {
            const jId = parsedUrl.searchParams.get('id');
            const job = jobs.get(jId) || jobs.get('default');

            if (!job) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Job not found' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(job));
            return;
        }

        // Эндпоинт отчёта о статусе от Tampermonkey
        if (parsedUrl.pathname === '/report' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    console.log(`[Bridge Report] Статус: ${data.status} | URL: ${data.url}`);
                    const job = jobs.get(data.jobId) || jobs.get('default');
                    if (job && job.onReport) {
                        job.onReport(data);
                    }
                } catch (e) {}
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
            });
            return;
        }

        res.writeHead(404);
        res.end('Not found');
    });
}

function openUrl(url) {
    console.log(`[Browser] Открытие: ${url}`);
    execSync(`powershell.exe -NoProfile -Command "Start-Process '${url}'"`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runJob(server, job) {
    const jobId = 'job_' + Date.now();
    job.jobId = jobId;

    return new Promise(async (resolve) => {
        let isDone = false;

        job.onReport = (data) => {
            if (data.status === 'submitting') {
                console.log(`[Job ${jobId}] Форма успешно отправлена в GreasyFork!`);
            }
        };

        jobs.set(jobId, job);
        jobs.set('default', job);

        let targetUrl = '';
        const slug = job.scriptSlug || job.scriptId;
        if (job.action === 'publish') {
            targetUrl = `https://greasyfork.org/ru/script_versions/new?bridge=${PORT}&job=${jobId}`;
        } else if (job.action === 'update') {
            targetUrl = `https://greasyfork.org/ru/scripts/${slug}/versions/new?bridge=${PORT}&job=${jobId}`;
        } else if (job.action === 'edit_desc') {
            targetUrl = `https://greasyfork.org/ru/scripts/${slug}/admin?bridge=${PORT}&job=${jobId}`;
        }

        openUrl(targetUrl);

        const waitTime = job.waitMs || 15000;
        console.log(`[Job ${jobId}] Ожидание выполнения авто-заполнения и отправки (${waitTime / 1000} сек)...`);
        await sleep(waitTime);

        jobs.delete(jobId);
        resolve();
    });
}

async function main() {
    const args = process.argv.slice(2);
    const isAll = args.includes('--all') || args.includes('-a') || args.length === 0;

    const server = createServer();
    server.listen(PORT, '127.0.0.1', async () => {
        console.log(`=== GREASYFORK UNIVERSAL CLI BRIDGE ЗАПУЩЕН НА ПОРТУ ${PORT} ===\n`);

        try {
            if (isAll) {
                console.log('--- ПАКЕТНЫЙ РЕЖИМ: ПУБЛИКАЦИЯ И ОБНОВЛЕНИЕ ВСЕХ 4 СКРИПТОВ STEAMGIFTS ---\n');

                const rootDir = path.resolve(__dirname, '..');

                const batchJobs = [
                    {
                        name: '1. SteamGifts - Chance Per Point (ID: 597589)',
                        action: 'edit_desc',
                        scriptId: '597589',
                        scriptSlug: '597589-steamgifts-chance-per-point',
                        code: fs.readFileSync(path.join(rootDir, 'steamgifts-chance-per-point.user.js'), 'utf8'),
                        description: DESCRIPTIONS['steamgifts-chance-per-point.user.js'],
                        autoSubmit: true,
                        waitMs: 14000
                    },
                    {
                        name: '2. SteamGifts - Unlucky-7 (ID: 580030, v1.4.1)',
                        action: 'update',
                        scriptId: '580030',
                        scriptSlug: '580030-steamgifts-unlucky-7-winner-stats-copy',
                        code: fs.readFileSync(path.join(rootDir, 'steamgifts-unlucky-7-winner-stats-copy.user.js'), 'utf8'),
                        description: DESCRIPTIONS['steamgifts-unlucky-7-winner-stats-copy.user.js'],
                        changelog: 'v1.4.1: Added Russian localization (@name:ru, @description:ru) for GreasyFork catalog',
                        autoSubmit: true,
                        waitMs: 15000
                    },
                    {
                        name: '3. SteamGifts - Group Stats Checker (v1.7.0, Новый)',
                        action: 'publish',
                        code: fs.readFileSync(path.join(rootDir, 'steamgifts-group-stats-checker.user.js'), 'utf8'),
                        description: DESCRIPTIONS['steamgifts-group-stats-checker.user.js'],
                        autoSubmit: true,
                        waitMs: 18000
                    },
                    {
                        name: '4. SteamGifts - Region Auto-Selector (v1.5.0, Новый)',
                        action: 'publish',
                        code: fs.readFileSync(path.join(rootDir, 'steamgifts-region-auto-selector.user.js'), 'utf8'),
                        description: DESCRIPTIONS['steamgifts-region-auto-selector.user.js'],
                        autoSubmit: true,
                        waitMs: 18000
                    }
                ];

                for (let i = 0; i < batchJobs.length; i++) {
                    const j = batchJobs[i];
                    console.log(`\n======================================================`);
                    console.log(`[${i + 1}/${batchJobs.length}] ${j.name}`);
                    console.log(`======================================================`);
                    await runJob(server, j);
                }

                console.log('\n=== ВСЕ 4 СКРИПТА УСПЕШНО ОБРАБОТАНЫ И ОПУБЛИКОВАНЫ! ===');

            } else {
                // Одиночный режим через аргументы командной строки
                let filePath = '';
                let descPath = '';
                let scriptId = '';
                let changelog = '';
                let action = 'publish';

                for (let i = 0; i < args.length; i++) {
                    if (args[i] === '--file' && args[i + 1]) filePath = args[++i];
                    if (args[i] === '--desc' && args[i + 1]) descPath = args[++i];
                    if (args[i] === '--id' && args[i + 1]) scriptId = args[++i];
                    if (args[i] === '--changelog' && args[i + 1]) changelog = args[++i];
                    if (args[i] === '--action' && args[i + 1]) action = args[++i];
                }

                let code = '';
                if (filePath && fs.existsSync(filePath)) {
                    code = fs.readFileSync(filePath, 'utf8');
                }

                let description = '';
                if (descPath) {
                    if (fs.existsSync(descPath)) {
                        description = fs.readFileSync(descPath, 'utf8');
                    } else {
                        description = descPath;
                    }
                }

                const singleJob = {
                    action: action,
                    scriptId: scriptId,
                    code: code,
                    description: description,
                    changelog: changelog,
                    autoSubmit: true,
                    waitMs: 16000
                };

                await runJob(server, singleJob);
                console.log('\n=== ЗАДАЧА УСПЕШНО ВЫПОЛНЕНА! ===');
            }

        } finally {
            server.close(() => {
                console.log('\n[Bridge] Сервер завершил работу.');
                process.exit(0);
            });
        }
    });
}

main();
