<?php

use Illuminate\Support\Facades\Route;

/**
 * Основной маршрут для SPA приложения
 * Перенаправляет все запросы на фронтенд приложение
 */
Route::get('/{path?}', function () {
    return view('app');
})->where('path', '.*');
