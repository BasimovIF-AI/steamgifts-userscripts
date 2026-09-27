# Walkthrough — Обзор изменений и публикация на GreasyFork

В данном документе зафиксированы результаты рефакторинга 4 юзерскриптов для SteamGifts, подготовка единого GitHub-репозитория и руководство по синхронизации с платформой GreasyFork.

---

## 1. Что было реализовано

1. **Создан единый репозиторий на GitHub**:
   - URL: `https://github.com/BasimovIF-AI/steamgifts-userscripts`
   - Настроена ветка `main`, подготовлен `.gitignore` и лицензия MIT.

2. **Стандартизированы и переименованы 4 скрипта**:
   - `steamgifts-chance-per-point.user.js` (`v7.0.0`)
   - `steamgifts-group-stats-checker.user.js` (`v1.7.0`)
   - `steamgifts-region-auto-selector.user.js` (`v1.5.0`)
   - `steamgifts-unlucky-7-winner-stats-copy.user.js` (`v1.4.1`)

3. **Внедрена международная локализация (RU / EN)**:
   - В каждом скрипте заголовок содержит теги `@name` / `@name:ru`, `@description` / `@description:ru`.
   - Внутри скриптов интерфейс (лейблы, кнопки, статусы, подсказки и ошибки) автоматически адаптируется под язык браузера пользователя (`navigator.language`).

4. **Метаданные для GreasyFork**:
   - Указан `@author basimovif-ai`.
   - Лицензия `@license MIT`.
   - Ссылки на репозиторий в `@homepageURL` и `@supportURL`.
   - Строгий формат версий SemVer (`X.Y.Z`).

5. **Сформирована документация**:
   - `README.md` — каталог с прямыми ссылками на установку скриптов и бейджами.
   - `PROJECT.md` — полный справочник архитектуры, DOM-селекторов и межвкладочного транспорта.
   - `CHANGELOG.md` — история версий по стандарту Keep a Changelog.

---

## 2. Руководство по публикации и обновлению на GreasyFork

У вас есть два простых способа разместить скрипты на GreasyFork:

### Способ А. Автоматическая синхронизация через GitHub (Рекомендуется)
Этот способ позволяет обновлять скрипты на GreasyFork простым `git push` в репозиторий:

1. Откройте [GreasyFork Webhook Settings](https://greasyfork.org/en/users/webhook-info).
2. Скопируйте предоставленный GreasyFork Webhook URL.
3. Перейдите в ваш репозиторий на GitHub: `https://github.com/BasimovIF-AI/steamgifts-userscripts/settings/hooks`.
4. Нажмите **Add webhook**:
   - **Payload URL**: вставьте ссылку от GreasyFork.
   - **Content type**: `application/json`.
   - **Which events**: `Just the push event`.
5. Нажмите **Add webhook**.
6. Теперь при создании или редактировании скрипта на GreasyFork выберите **Sync with external URL** и укажите прямую ссылку на сырой файл с GitHub:
   - `https://raw.githubusercontent.com/BasimovIF-AI/steamgifts-userscripts/main/steamgifts-chance-per-point.user.js`
   - `https://raw.githubusercontent.com/BasimovIF-AI/steamgifts-userscripts/main/steamgifts-group-stats-checker.user.js`
   - `https://raw.githubusercontent.com/BasimovIF-AI/steamgifts-userscripts/main/steamgifts-region-auto-selector.user.js`
   - `https://raw.githubusercontent.com/BasimovIF-AI/steamgifts-userscripts/main/steamgifts-unlucky-7-winner-stats-copy.user.js`
7. Для уже созданного скрипта [Unlucky-7 (#580030)](https://greasyfork.org/ru/scripts/580030-steamgifts-unlucky-7-winner-stats-copy):
   - Перейдите на страницу скрипта -> вкладка **Код** / **Редактировать**.
   - Вставьте обновленный код версии `1.4.1` (или настройте синхронизацию по ссылке выше).

---

### Способ Б. Публикация через локальный Hub (`publish_to_greasyfork.html`) и Universal Bridge v2.1.0
1. Откройте файл `publish_to_greasyfork.html` в браузере Firefox (на рабочем столе).
2. Скопируйте и сохраните в Tampermonkey код универсального моста `tools/greasyfork-auto-publisher.user.js` (кнопка в хабе копирует код в буфер обмена).
3. Нажмите кнопку **«🚀 ЗАПУСТИТЬ ВСЕ 4 СКРИПТА АВТОМАТИЧЕСКИ»** (или используйте индивидуальные кнопки в карточках каждого скрипта):
   - **Chance Per Point (#597589)**: открывает `/admin`, мост выставляет разметку Markdown, заполняет подробное оформление и сохраняет форму.
   - **Unlucky-7 (#580030)**: открывает форму обновления `/versions/new`, мост вставляет код v1.4.1 (с русской локализацией), чейнджлог, отмечает чекбокс повторного кода, отправляет форму, после чего автоматически переходит в `/admin` и сохраняет красивое Markdown-описание.
   - **Group Stats Checker**: открывает `/script_versions/new`, мост вставляет код v1.7.0, отправляет форму создания нового скрипта, после чего автоматически переходит в `/admin` и заполняет Markdown-описание.
   - **Region Auto-Selector**: открывает `/script_versions/new`, мост вставляет код v1.5.0, отправляет форму, после чего автоматически переходит в `/admin` и сохраняет Markdown-описание.
4. Мост отображает плавающий баннер с 5-секундным таймером, кнопкой немедленной отправки и кнопкой **Пауза / Проверить**, если требуется проконтролировать заполненные поля.
5. После завершения проверьте профиль GreasyFork: все 4 скрипта имеют корректные версии, локализацию и подробные витрины.
