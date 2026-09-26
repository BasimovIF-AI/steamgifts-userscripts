const { execSync } = require('child_process');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    const scripts = [
        {
            name: "1. SteamGifts - Chance Per Point (#597589) [Оформление описания]",
            url: "https://greasyfork.org/ru/scripts/597589-steamgifts-chance-per-point/admin?auto_desc=steamgifts-chance-per-point.user.js",
            waitMs: 14000
        },
        {
            name: "2. SteamGifts - Unlucky-7 (#580030) [Обновление до v1.4.1 + RU]",
            url: "https://greasyfork.org/ru/scripts/580030-steamgifts-unlucky-7-winner-stats-copy/versions/new?auto_update=steamgifts-unlucky-7-winner-stats-copy.user.js",
            waitMs: 15000
        },
        {
            name: "3. SteamGifts - Group Stats Checker (v1.7.0) [Публикация нового]",
            url: "https://greasyfork.org/ru/script_versions/new?auto_publish=steamgifts-group-stats-checker.user.js",
            waitMs: 18000
        },
        {
            name: "4. SteamGifts - Region Auto-Selector (v1.5.0) [Публикация нового]",
            url: "https://greasyfork.org/ru/script_versions/new?auto_publish=steamgifts-region-auto-selector.user.js",
            waitMs: 18000
        }
    ];

    console.log('=== ЗАПУСК ПОСЛЕДОВАТЕЛЬНОЙ АВТОПУБЛИКАЦИИ НА GREASYFORK ===');
    for (let i = 0; i < scripts.length; i++) {
        const s = scripts[i];
        console.log(`\n[${i + 1}/${scripts.length}] Запуск: ${s.name}`);
        console.log(`URL: ${s.url}`);
        execSync(`start "" "${s.url}"`, { shell: 'cmd.exe' });
        console.log(`Ожидание завершения авто-заполнения и отправки формы (${s.waitMs / 1000} сек)...`);
        await sleep(s.waitMs);
    }
    console.log('\n=== ВСЕ 4 СКРИПТА ОТПРАВЛЕНЫ! ===');
}

run();
