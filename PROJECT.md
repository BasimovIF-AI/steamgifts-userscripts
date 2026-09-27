# PROJECT.md — Главный справочник архитектуры проекта

## 1. Карта файлов и назначение

| Файл | Тип | Точка входа / `@match` | Назначение |
| :--- | :---: | :--- | :--- |
| `steamgifts-chance-per-point.user.js` | Userscript | `https://www.steamgifts.com/giveaways/entered*` | Расчёт шанса на 1 очко в базисных пунктах (‱) и скрытие раздач с шансом выше лимита. |
| `steamgifts-group-stats-checker.user.js` | Userscript | `https://www.steamgifts.com/giveaway/*` | Запрос и сверка статистики пользователя в группах раздачи + авто-комментарий автору. |
| `steamgifts-region-auto-selector.user.js` | Userscript | `.../giveaways/new` & `steamdb.info/sub/*` | Автоматизация выбора регионов при создании раздачи через временную вкладку SteamDB. |
| `steamgifts-unlucky-7-winner-stats-copy.user.js` | Userscript | `.../giveaway/*/winners` | Проверка баланса участников группы Unlucky-7 и копирование форматированной строки. |
| `tools/greasyfork-auto-publisher.user.js` | Tool / Userscript | `greasyfork.org/*` | Универсальный мост авто-публикации (Universal Bridge v2.1.0) для работы с GreasyFork. |
| `tools/greasyfork-cli.js` | CLI Tool / Node.js | Console | Консольная утилита агента для автоматической публикации любых скриптов с ПК и GitHub. |
| `publish_to_greasyfork.html` | Tool / Hub | Local Browser | Центр управления публикацией и копирования кода / описаний в 1 клик. |
| `README.md` | Doc | — | Каталог скриптов, инструкции по установке (EN). |
| `README.ru.md` | Doc | — | Каталог скриптов, инструкции по установке (RU). |
| `CHANGELOG.md` | Doc | — | Журнал версий по стандарту Keep a Changelog. |
| `walkthrough.md` | Doc | — | Инструкция по синхронизации с GreasyFork и проверке скриптов. |

---

## 2. Архитектура компонентов и Data Flow

### 2.1. `steamgifts-chance-per-point.user.js`
- **Вход**: DOM таблицы `.table` на странице `giveaways/entered`.
- **Логика**:
  1. `processGiveaways()`: Извлекает `points` из названия (`(10P)`), `copies` (`(5 Copies)`), `entries` из числовой колонки.
  2. Формула: `chance = copies / (entries * points)`. Значение отображается в базисных пунктах: `(chance * 10000).toFixed(2) + '‱'`.
  3. `applyFilter()`: Скрывает строки (`display: none`), у которых `chance > maxChance`.
  4. `MutationObserver`: Следит за добавлением строк при бесконечной прокрутке / пагинации.
- **Права**: `@grant GM_addStyle`.

### 2.2. `steamgifts-group-stats-checker.user.js`
- **Вход**: Страница конкретной раздачи (`/giveaway/:code/:slug`).
- **Data Flow**:
  1. Читает имя текущего пользователя из `.nav__avatar-outer-wrap`.
  2. Находит ссылку на страницу групп раздачи: `a.featured__column--group`.
  3. Делает фоновый `fetch` на страницу групп, парсит список групп раздачи (`/group/:id/:slug`).
  4. Рядом с лейблом групп генерирует интерактивные кнопки под каждую группу.
  5. По клику параллельно запрашивает:
     - `fetch(`${origin}${groupPath}/users/search?q=${username}`)`
     - `fetch(`${origin}/user/${username}`)` (парсинг общего числа побед `Gifts Won`).
  6. Сверяет разницу (`sent - received`) с разницей на сайте (`Math.abs(...) < 0.05`).
  7. Зелёный цвет — точное совпадение, красный — расхождение.
  8. Заполняет пустое поле `textarea[name="description"]` приветствием: `Thanks a lot ${creatorName}!`.
- **Права**: `@grant none` (работает в нативном контексте страницы).

### 2.3. `steamgifts-region-auto-selector.user.js`
- **Двухдоменная архитектура** с межвкладочным транспортом через `GM_setValue` / `GM_getValue`:
  ```
  [SteamGifts: /giveaways/new]
         │ (Ввод SubID -> клик "Применить")
         ├──> GM_setValue('requested_sub', subId)
         ├──> window.open('https://steamdb.info/sub/XXXX/?sg_sync=1')
         │
         │                              [SteamDB: /sub/XXXX/?sg_sync=1]
         │                                     │
         │                                     ├──> Парсинг ограничений (.panel-error, флаги)
         │                                     ├──> GM_setValue('parsed_sub_data', data)
         │                                     └──> window.close()
         │ (Поллинг GM_getValue каждые 500мс)
         <─── Чтение parsed_sub_data
         │
         └──> Клик по чекбоксам .form_list_item на SteamGifts
  ```
- **Подводный камень и решение**: Cloudflare на SteamDB блокирует автоматические `fetch`/`GM_xmlhttpRequest`. Решение — реальное открытие вкладки (`window.open`), где браузер нативно проходит проверку Cloudflare, парсит DOM и сразу закрывает вкладку через `window.close()`.

### 2.4. `steamgifts-unlucky-7-winner-stats-copy.user.js`
- **Вход**: Страница `giveaway/*/winners`.
- **Логика**:
  1. Проверяет наличие группы `Unlucky-7` на странице раздачи. Если нет — выходит.
  2. Для каждой строки победителя параллельно запрашивает поиск в группе и профиль пользователя.
  3. Сравнивает формулы sent/received подарков и долларов.
  4. Форматирует данные для отчёта в группе и копирует в буфер через `navigator.clipboard.writeText`:
     - До 8 побед: `GA: <url>\nWinner: <user> (Xth win)`
     - Более 8 побед: `GA: <url>\nWinner: <user> (Gifter, +X)`

---

## 3. Нетривиальные решения и особенности реализации

1. **Базисные пункты (‱) вместо процентов (%)**:
   - Шансы в раздачах SteamGifts крайне малы (часто `0.0012%`). В процентах такие числа неинтуитивны. Базисные пункты (1‱ = 0.01% = 0.0001) дают удобные целые или двузначные числа (например `12.50‱`).
2. **Сравнение чисел с плавающей точкой**:
   - Используется порог эпсилон `Math.abs(calculatedDiff - siteDiff) < 0.05` для исключения ошибок округления цен в центах.
3. **Автоопределение языка (i18n)**:
   - Все 4 скрипта используют `(navigator.language || '').toLowerCase().startsWith('ru')`, обеспечивая бесшовный английский интерфейс для мировой аудитории GreasyFork и русский для русскоязычных пользователей.
4. **Регламент публикации и маппинг в GreasyFork**:
   - `SteamGifts - Chance Per Point`: ID **597589** (опубликован; для обновления оформления используется `/admin`).
   - `SteamGifts - Unlucky-7 Winner Stats & Copy`: ID **580030** (опубликован; обновляется через `/versions/new` для загрузки v1.4.1 с русскими тегами).
   - `SteamGifts - Group Stats Checker`: Новый скрипт (создается через `/script_versions/new`).
   - `SteamGifts - Region Auto-Selector`: Новый скрипт (создается через `/script_versions/new`).
   - При публикации одинакового кода GreasyFork требует подтверждения чекбоксом `allow_code_previously_posted`, который скрипт-помощник отмечает автоматически.
5. **Windows Session Isolation и Hash Transport**:
   - При выполнении команд агента из фоновой системной службы Windows (Session 1) вызов GUI браузера пользователя (Session 2) блокируется архитектурой безопасности Windows.
   - Архитектурное решение: запуск через интерактивный локальный хаб `publish_to_greasyfork.html` на рабочем столе пользователя. Хаб передает полезную нагрузку через хэш URL (`#auto_code_url=...&auto_desc=...`), что снимает ограничения длины URL и исключает необходимость локального веб-сервера.
   - Скрипт-мост Tampermonkey парсит хэш-параметры, встраивает код в CodeMirror нативного контекста страницы, автоматически переходит в `/admin` и публикует Markdown-описание.
