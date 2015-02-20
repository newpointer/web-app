# web-app

> Web application helper

`npm install newpointer/web-app.git`

# Сборщик веб-приложений [nullpointer](http://null-pointer.ru/)

## Окружение

* node.js 0.10.x+
* npm 1.3.x+
* grunt-cli `npm install grunt-cli -g`
* bower `npm install bower -g`


## Инициализация

Установка зависимостей проекта, зависимостей модуля

    npm install
    grunt init


## Проверка кода

    grunt jshint


## i18n

Сбор ключей перевода, формирование бандлов перевода

[nullpointer-i18n-bin/docs/build.md](https://github.com/newpointer/i18n-bin/blob/master/docs/build.md)

    grunt i18n


## Сборка

Установка зависимостей модуля, проверка кода, оптимизация, дистрибутивы

    grunt build


## Очистка

Удаление зависимостей проекта

    grunt clean:deps

Удаление сборки

    grunt clean:target

## Полная пересборка

Очистка, обновление зависимостей проекта, сборка

    grunt clean
    npm install
    grunt build
