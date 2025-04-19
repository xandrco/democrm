<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ApplicationController extends Controller
{
    /**
     * Разрешенные поля для сортировки заявок
     * 
     * @var array
     */
    protected $allowedSortFields = [
        'created_at', 'reviewed_at', 'name', 'email', 'status'
    ];

    /**
     * Получение списка заявок с фильтрацией и сортировкой
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $search = $request->query('search');
        $perPage = $request->query('per_page', 15);

        $sortField = $request->query('sort_by', 'created_at');
        $sortDirection = strtolower($request->query('sort_direction', 'desc'));
        
        $sortField = in_array($sortField, $this->allowedSortFields) ? $sortField : 'created_at';
        $sortDirection = in_array($sortDirection, ['asc', 'desc']) ? $sortDirection : 'desc';
        
        $query = Application::with(['reviewer', 'comments.user'])
            ->select('applications.*')
            ->selectSub(
                Comment::selectRaw('COUNT(*)')
                    ->whereColumn('application_id', 'applications.id'),
                'comments_count'
            );
        
        if ($status) {
            $query->where('status', $status);
        }
        
        if ($request->has('search')) {
            $search = $request->query('search');
            
            if (!empty($search)) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }
        }
        
        if ($sortField === 'reviewed_at') {
            $query->orderBy($sortField, $sortDirection)
                  ->orderBy('created_at', 'desc');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }
        
        $applications = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $applications,
        ]);
    }

    /**
     * Создание новой заявки
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $metadata = [
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
            'referer' => $request->header('referer'),
        ];
        
        $application = Application::create([
            'name' => $request->name,
            'email' => $request->email,
            'message' => $request->message,
            'status' => $request->status ?? Application::STATUS_PENDING,
            'metadata' => $metadata,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Application created successfully',
            'data' => $application,
        ], 201);
    }

    /**
     * Просмотр детальной информации о заявке
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $application = Application::with(['reviewer', 'comments.user'])
            ->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $application,
        ]);
    }

    /**
     * Обновление данных заявки и изменение статуса
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $application = Application::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
            'message' => 'sometimes|required|string',
            'status' => 'sometimes|required|in:'.implode(',', [
                Application::STATUS_PENDING,
                Application::STATUS_IN_PROGRESS,
                Application::STATUS_APPROVED,
                Application::STATUS_REJECTED
            ]),
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        if ($request->has('status') && $request->status !== $application->status) {
            $application->status = $request->status;
            $application->reviewed_by = $request->user()->id;
            $application->reviewed_at = now();
        }
        
        $application->save();
        
        if ($request->has('comment') && !empty($request->comment)) {
            Comment::create([
                'application_id' => $application->id,
                'user_id' => $request->user()->id,
                'comment' => $request->comment,
            ]);
        }
        
        $application->load(['reviewer', 'comments.user']);
        
        return response()->json([
            'success' => true,
            'message' => 'Application updated successfully',
            'data' => $application,
        ]);
    }

    /**
     * Удаление заявки из системы
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $application = Application::findOrFail($id);
        $application->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Application deleted successfully with all related comments',
        ]);
    }

    /**
     * Экспорт заявок в CSV файл
     *
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function export(Request $request)
    {
        $status = $request->query('status');
        $search = $request->query('search');
        
        $sortField = $request->query('sort_by', 'created_at');
        $sortDirection = strtolower($request->query('sort_direction', 'desc'));
        
        $sortField = in_array($sortField, $this->allowedSortFields) ? $sortField : 'created_at';
        $sortDirection = in_array($sortDirection, ['asc', 'desc']) ? $sortDirection : 'desc';
        
        $query = Application::with(['reviewer', 'comments.user'])
            ->select('applications.*');
        
        if ($status) {
            $query->where('status', $status);
        }
        
        if ($request->has('search')) {
            $search = $request->query('search');
            
            if (!empty($search)) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }
        }
        
        if ($sortField === 'reviewed_at') {
            $query->orderBy($sortField, $sortDirection)
                  ->orderBy('created_at', 'desc');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }
        
        $applications = $query->get();
        
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="applications-' . date('Y-m-d') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];
        
        $callback = function() use ($applications) {
            $handle = fopen('php://output', 'w');
            
            fputs($handle, "\xEF\xBB\xBF");
            
            fputcsv($handle, [
                'ID',
                'Имя',
                'Email',
                'Сообщение',
                'Статус',
                'Дата создания',
                'Дата обработки',
                'Рецензент',
                'IP адрес',
                'Браузер'
            ]);
            
            foreach ($applications as $application) {
                $metadata = $application->metadata ?? [];
                
                fputcsv($handle, [
                    $application->id,
                    $application->name,
                    $application->email,
                    $application->message,
                    $application->status_label,
                    $application->created_at,
                    $application->reviewed_at,
                    $application->reviewer ? $application->reviewer->name : '',
                    $metadata['ip_address'] ?? '',
                    $metadata['user_agent'] ?? '',
                ]);
            }
            
            fclose($handle);
        };
        
        return response()->stream($callback, 200, $headers);
    }
}
