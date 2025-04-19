<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    /**
     * Получение списка комментариев для заявки
     *
     * @param Request $request
     * @param int $application_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request, $application_id)
    {
        $application = Application::findOrFail($application_id);
        
        $sort = $request->query('sort', 'newest');
        $perPage = $request->query('per_page', 15);
        
        $query = Comment::with('user')->where('application_id', $application_id);
        
        switch ($sort) {
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }
        
        $comments = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $comments,
        ]);
    }
    
    /**
     * Добавление нового комментария к заявке
     *
     * @param Request $request
     * @param int $application_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, $application_id)
    {
        $application = Application::findOrFail($application_id);
        
        $validator = Validator::make($request->all(), [
            'comment' => 'required|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $comment = Comment::create([
            'application_id' => $application_id,
            'user_id' => $request->user()->id,
            'comment' => $request->comment,
        ]);
        
        $comment->load('user');
        
        return response()->json([
            'success' => true,
            'message' => 'Comment added successfully',
            'data' => $comment,
        ], 201);
    }
    
    /**
     * Удаление комментария
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, $id)
    {
        $comment = Comment::findOrFail($id);
        
        if ($request->user()->id !== $comment->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this comment',
            ], 403);
        }
        
        $comment->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Comment deleted successfully',
        ]);
    }
}
