# Renamer - Автоматическое переименование слоев

Плагин для автоматического переименования слоев в Figma на русском языке с учетом их содержимого и структуры.

## Возможности

- Автоматическое определение типа слоя и его содержимого
- Интеллектуальное переименование кнопок, форм, карточек и других UI элементов
- Сохранение оригинальных названий компонентов и иконок
- Поддержка вложенных структур и группировок
- Русскоязычные названия для удобства разработчиков

## Как использовать

1. Выделите слои, которые хотите переименовать
2. Запустите плагин через меню Plugins > Development > Renamer
3. Слои будут автоматически переименованы

## Примеры переименования

### Текстовые слои
- `Текст кнопки`
- `Заголовок формы`
- `Описание карточки`

### Кнопки
- `Кнопка - Отправить`
- `Кнопка - Сохранить`

### Контейнеры
- `Контейнер с двумя кнопками`
- `Форма ввода (3 полей)`
- `Сетка карточек (4)`
- `Список элементов (5)`

### UI элементы
- `Шапка`
- `Подвал`
- `Боковая панель`
- `Модальное окно`
- `Выпадающий список`
- `Подсказка`
- `Бейдж`
- `Аватар`

## Особенности

- Сохраняет названия компонентов и иконок
- Учитывает структуру вложенности
- Показывает количество элементов в группах
- Поддерживает все основные типы UI элементов
- Автоматически определяет тип элемента по его содержимому

## Требования

- Figma Desktop App
- Выделенные слои для переименования

## Автор

[Ваше имя]

## Лицензия

MIT

Below are the steps to get your plugin running. You can also find instructions at:

  https://www.figma.com/plugin-docs/plugin-quickstart-guide/

This plugin template uses Typescript and NPM, two standard tools in creating JavaScript applications.

First, download Node.js which comes with NPM. This will allow you to install TypeScript and other
libraries. You can find the download link here:

  https://nodejs.org/en/download/

Next, install TypeScript using the command:

  npm install -g typescript

Finally, in the directory of your plugin, get the latest type definitions for the plugin API by running:

  npm install --save-dev @figma/plugin-typings

If you are familiar with JavaScript, TypeScript will look very familiar. In fact, valid JavaScript code
is already valid Typescript code.

TypeScript adds type annotations to variables. This allows code editors such as Visual Studio Code
to provide information about the Figma API while you are writing code, as well as help catch bugs
you previously didn't notice.

For more information, visit https://www.typescriptlang.org/

Using TypeScript requires a compiler to convert TypeScript (code.ts) into JavaScript (code.js)
for the browser to run.

We recommend writing TypeScript code using Visual Studio code:

1. Download Visual Studio Code if you haven't already: https://code.visualstudio.com/.
2. Open this directory in Visual Studio Code.
3. Compile TypeScript to JavaScript: Run the "Terminal > Run Build Task..." menu item,
    then select "npm: watch". You will have to do this again every time
    you reopen Visual Studio Code.

That's it! Visual Studio Code will regenerate the JavaScript file every time you save.
