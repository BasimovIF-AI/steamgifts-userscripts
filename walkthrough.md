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

### Способ Б. Публикация через локальный Hub (`publish_to_greasyfork.html`) и скрипт-помощник
1. Откройте файл `publish_to_greasyfork.html` в браузере.
2. Скопируйте и установите вспомогательный юзерскрипт `tools/greasyfork-auto-publisher.user.js` (v1.3.0) в Tampermonkey.
3. Нажимайте на ссылки в карточках:
   - **Chance Per Point (#597589)**: ссылка `/admin` автоматически откроет настройки описания, заполнит Markdown и подготовит к сохранению.
   - **Unlucky-7 (#580030)**: ссылка `/versions/new` автоматически загрузит код `v1.4.1`, чейнджлог и Markdown.
   - **Group Stats Checker**: ссылка `/script_versions/new` заполнит форму нового скрипта.
   - **Region Auto-Selector**: ссылка `/script_versions/new` заполнит форму нового скрипта.
4. Помощник отображает плавающий баннер с 6-секундным таймером и кнопкой **Пауза / Проверить**, позволяя вручную посмотреть предпросмотр перед отправкой.
