# web-app

> Сборщик веб-приложений [nullpointer](http://null-pointer.ru/)

## Окружение

* node.js
* npm
* grunt-cli `npm install grunt-cli -g`
* bower `npm install bower -g`

## Конфигурация проекта

#### package.json

```
{
    ...

    "devDependencies": {
        ...

        "grunt": "*",
        "grunt-contrib-clean": "*",
        "grunt-contrib-jshint": "*",
        "grunt-contrib-copy": "*",
        "grunt-bower-task": "*",

        "lodash": "*", // опционально
        "lodash-deep": "*", // опционально
        "nullpointer-web-app": "newpointer/web-app.git"
    }
}
```

#### Gruntfile.js

```javascript
// Пример настройки сборщика для приложения nkb-app проекта rsearch
//
var _       = require("lodash"), // опционально
    _d      = require("lodash-deep"), // опционально
    path    = require('path'), // опционально
    webapp  = require('nullpointer-web-app');

_.mixin(_d);

//
module.exports = function(grunt) {
    // инициализация приложения
    webapp.setBuildMeta({
        appId: 'rsearch',
        APP_BUILD_TYPE: 'production',
        cwd: __dirname,
        name: 'nkb-app',
        rootpath: '/rsearch/'
    });

    // инициализация Grunt по умолчанию, если не используется расширение сборщика
    // webapp.initGrunt(grunt);

    // расширение сборщика, опционально
    //
    var gruntConfig = webapp.getDefaultGruntConfig(),
        buildMeta   = webapp.getBuildMeta();

    // расширение copy, опционально
    _.deepGet(gruntConfig, 'copy.dist.src').push('src/nkb-app/opensearch.xml');

    // расширение i18n, опционально
    _.deepSet(gruntConfig, 'i18n.ui_keys.options', {
        mode:           'simple',
        pattern:        '**/*.txt',
        inputDir:       path.resolve(__dirname, 'i18n/ui_keys/src'),
        inputRootPath:  path.resolve(__dirname, ''),
        outputDir:      path.resolve(__dirname, 'i18n/ui_keys'),
        bundleDir:      path.resolve(__dirname, 'src/l10n/ui_keys'),
        baseLang:       buildMeta.langs[0],
        langs:          buildMeta.langs
    });

    // инициализация Grunt
    webapp.initGrunt(grunt, gruntConfig);

    // ваш код для Grunt
    // ...
};
```

```
npm install
```

## Команды по умолчанию

### Инициализация

Установка зависимостей: `bower`, ...

    grunt init


### i18n

Сбор ключей перевода, формирование бандлов перевода

[nullpointer-i18n-bin/docs/build.md](https://github.com/newpointer/i18n-bin/blob/master/docs/build.md)

    grunt i18n


### Проверка кода

    grunt jshint


### Сборка

Установка зависимостей, проверка кода, оптимизация, дистрибутив

    grunt build


## Очистка

Удаление зависимостей, сборки

    grunt cleanup
