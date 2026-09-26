# SteamGifts Userscripts Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Repository](https://img.shields.io/badge/GitHub-BasimovIF--AI%2Fsteamgifts--userscripts-181717?logo=github)](https://github.com/BasimovIF-AI/steamgifts-userscripts)
[![GreasyFork Profile](https://img.shields.io/badge/GreasyFork-BasimovIF--AI-red.svg)](https://greasyfork.org/en/users/1522624-basimovif-ai)

A curated collection of lightweight, high-performance Tampermonkey / Violentmonkey userscripts for [SteamGifts](https://www.steamgifts.com).

*Коллекция легковесных и быстрых скриптов Tampermonkey / Violentmonkey для улучшения работы с сайтом [SteamGifts](https://www.steamgifts.com).*

---

## 📦 Scripts Overview / Обзор скриптов

| Script / Скрипт | Version | GreasyFork | Direct Install / Прямая установка | Description / Описание |
| :--- | :---: | :---: | :---: | :--- |
| **Chance Per Point (‱)** | `7.0.0` | [Open](https://greasyfork.org/en/scripts/by-site/steamgifts.com) | [Install](https://raw.githubusercontent.com/BasimovIF-AI/steamgifts-userscripts/main/steamgifts-chance-per-point.user.js) | Adds win chance per point in basis points (‱) & filter panel on entered giveaways. / *Расчёт шанса на победу в базисных пунктах (‱) и фильтр на странице участий.* |
| **Group Stats Checker** | `1.7.0` | [Open](https://greasyfork.org/en/scripts/by-site/steamgifts.com) | [Install](https://raw.githubusercontent.com/BasimovIF-AI/steamgifts-userscripts/main/steamgifts-group-stats-checker.user.js) | Interactive giveaway group stats checker & creator comment autofill. / *Интерактивная статистика в группах раздачи и авто-комментарий.* |
| **Region Auto-Selector** | `1.5.0` | [Open](https://greasyfork.org/en/scripts/by-site/steamgifts.com) | [Install](https://raw.githubusercontent.com/BasimovIF-AI/steamgifts-userscripts/main/steamgifts-region-auto-selector.user.js) | Cloudflare bypass via SteamDB tab to auto-select restricted countries on giveaway creation. / *Автовыбор стран через вкладку SteamDB при создании раздачи.* |
| **Unlucky-7 Winner Stats & Copy** | `1.4.1` | [GreasyFork #580030](https://greasyfork.org/en/scripts/580030-steamgifts-unlucky-7-winner-stats-copy) | [Install](https://raw.githubusercontent.com/BasimovIF-AI/steamgifts-userscripts/main/steamgifts-unlucky-7-winner-stats-copy.user.js) | Detailed stats for Unlucky-7 group winners with 1-click clipboard copy. / *Статистика победителей группы Unlucky-7 и копирование в буфер в 1 клик.* |

---

## 🚀 Features & Details / Возможности скриптов

### 1. SteamGifts - Chance Per Point (‱) (`v7.0.0`)
- **Target URL**: `https://www.steamgifts.com/giveaways/entered*`
- **EN**:
  - Calculates win chance per point: `(Copies / (Entries * Points)) * 10,000‱`.
  - Injects a new column into the entered giveaways table.
  - Adds a dynamic filtering bar at the top allowing you to hide giveaways with a chance above your specified value.
  - Fully bilingual interface (English / Russian) automatically adapting to browser language.
- **RU**:
  - Рассчитывает шанс на победу за одно очко в базисных пунктах: `(Копии / (Участники * Очки)) * 10 000‱`.
  - Добавляет столбец в таблицу активных участий.
  - Предоставляет панель фильтрации сверху для скрытия раздач с шансом выше заданного порога.
  - Автоматически переключается между RU/EN в зависимости от языка браузера.

---

### 2. SteamGifts - Group Stats Checker (Universal) (`v1.7.0`)
- **Target URL**: `https://www.steamgifts.com/giveaway/*`
- **EN**:
  - Discovers all groups associated with the giveaway and generates interactive stat buttons.
  - Fetches and verifies sent vs received gifts and dollar value difference (`sent - received`).
  - Interactive clickable formula: click to expand exact difference calculation and total `Gifts Won`.
  - Color-coded validation: green for mathematical match, red for discrepancy.
  - Autofills polite creator thank-you comment in description textarea if empty.
- **RU**:
  - Определяет группы раздачи и добавляет компактные кнопки для проверки вашей статистики.
  - Сверяет подаренные и полученные подарки, а также разницу стоимости в долларах.
  - Интерактивный кликабельный просмотр: по клику разворачивается формула и общее число побед (`Gifts Won`).
  - Цветовая индикация: зелёный цвет при совпадении с сайтом, красный при расхождении.
  - Автозаполнение комментария автору раздачи (`Thanks a lot ...`), если поле пустое.

---

### 3. SteamGifts - Region Auto-Selector via SteamDB Tab (`v1.5.0`)
- **Target URL**: `https://www.steamgifts.com/giveaways/new`, `https://steamdb.info/sub/*`
- **EN**:
  - Eliminates manual country selection when creating region-locked giveaways.
  - Simply enter the Steam package SubID (e.g. `828967`) and click **Apply**.
  - Opens a temporary SteamDB tab to retrieve restriction data (bypassing Cloudflare protection seamlessly) and closes it automatically.
  - Automatically checks all restricted countries on SteamGifts and warns about unmatched country codes.
- **RU**:
  - Избавляет от ручного прокликивания десятков стран при создании раздачи с региональными ограничениями.
  - Достаточно ввести SubID пакета из SteamDB (например `828967`) и нажать **Применить**.
  - Открывает временную вкладку SteamDB для парсинга (беспрепятственный обход Cloudflare) и сама закрывает её.
  - Автоматически выставляет галочки стран на SteamGifts и выводит предупреждения о несовпадающих кодах.

---

### 4. SteamGifts - Unlucky-7 Winner Stats & Copy (`v1.4.1`)
- **Target URL**: `https://www.steamgifts.com/giveaway/*/winners`
- **EN**:
  - Runs on giveaway winners page if the giveaway is hosted for the `Unlucky-7` group.
  - Displays winner gift difference and value difference with expandable mathematical breakdown.
  - 1-click clipboard copy button formatted specifically for group accounting:
    - `<= 8 wins`: `GA: <url>\nWinner: <user> (Xth win)`
    - `> 8 wins`: `GA: <url>\nWinner: <user> (Gifter, +X)`
- **RU**:
  - Активируется на странице победителей раздач для группы `Unlucky-7`.
  - Отображает баланс подарков и суммы победителя с раскрытием детальной формулы по клику.
  - Кнопка копирования в буфер обмена в 1 клик для ведения отчетности в группе.

---

## 🛠️ Installation / Установка

1. Install a userscript manager extension:
   - [Tampermonkey](https://www.tampermonkey.net/) (Recommended / Рекомендуется)
   - [Violentmonkey](https://violentmonkey.github.io/)
2. Click on the **Install** link in the table above or install directly from [GreasyFork](https://greasyfork.org/en/users/1522624-basimovif-ai).
3. Confirm the script installation in your userscript manager.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
