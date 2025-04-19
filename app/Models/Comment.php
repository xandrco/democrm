<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Модель комментария к заявке
 */
class Comment extends Model
{
    use HasFactory;

    /**
     * Поля, доступные для массового заполнения
     * 
     * @var array
     */
    protected $fillable = [
        'application_id',
        'user_id',
        'comment',
    ];

    /**
     * Отношение к заявке, к которой относится комментарий
     * 
     * @return BelongsTo
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    /**
     * Отношение к пользователю, оставившему комментарий
     * 
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
