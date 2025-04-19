<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Модель пользователя системы
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Поля, доступные для массового заполнения
     * 
     * @var array
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * Скрытые атрибуты, которые не должны отображаться при сериализации
     * 
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Преобразование типов атрибутов
     * 
     * @return array
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Отношение к заявкам, которые были обработаны пользователем
     * 
     * @return HasMany
     */
    public function reviewedApplications(): HasMany
    {
        return $this->hasMany(Application::class, 'reviewed_by');
    }

    /**
     * Отношение к комментариям, оставленным пользователем
     * 
     * @return HasMany
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
