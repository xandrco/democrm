<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Модель заявки от пользователя
 */
class Application extends Model
{
    use HasFactory;

    /**
     * Статусы заявок
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    /**
     * Текстовые метки для статусов заявок на русском языке
     */
    public const STATUS_LABELS = [
        self::STATUS_PENDING => 'Новая',
        self::STATUS_IN_PROGRESS => 'В обработке',
        self::STATUS_APPROVED => 'Решена',
        self::STATUS_REJECTED => 'Отклонена'
    ];

    /**
     * Поля, доступные для массового заполнения
     * 
     * @var array
     */
    protected $fillable = [
        'name',
        'email',
        'message',
        'status',
        'reviewed_by',
        'reviewed_at',
        'metadata',
    ];

    /**
     * Преобразование типов атрибутов
     * 
     * @var array
     */
    protected $casts = [
        'metadata' => 'array',
        'reviewed_at' => 'datetime',
    ];

    /**
     * Отношение к пользователю, который обработал заявку
     * 
     * @return BelongsTo
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Отношение к комментариям, оставленным к заявке
     * 
     * @return HasMany
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Получение русскоязычной метки статуса заявки
     * 
     * @return string
     */
    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_LABELS[$this->status] ?? $this->status;
    }
}
