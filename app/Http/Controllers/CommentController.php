<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
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
            'user_id' => Auth::id(),
            'comment' => $request->comment,
        ]);
        
        $comment->load('user');
        
        return response()->json([
            'success' => true,
            'message' => 'Comment added successfully',
            'data' => $comment,
        ], 201);
    }
    
    public function destroy($id)
    {
        $comment = Comment::findOrFail($id);
        
        if (Auth::id() !== $comment->user_id && !Auth::user()->isAdmin()) {
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
