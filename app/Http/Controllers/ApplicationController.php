<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ApplicationController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status');
        $search = $request->query('search');
        $perPage = $request->query('per_page', 15);
        $sort = $request->query('sort', 'created_desc');
        
        $query = Application::with('reviewer')
            ->select('applications.*')
            ->selectSub(
                Comment::selectRaw('COUNT(*)')
                    ->whereColumn('application_id', 'applications.id'),
                'comments_count'
            );
        
        if ($status) {
            $query->where('status', $status);
        }
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }
        
        switch ($sort) {
            case 'created_asc':
                $query->orderBy('created_at', 'asc');
                break;
            case 'reviewed_desc':
                $query->orderBy('reviewed_at', 'desc')
                      ->orderBy('created_at', 'desc');
                break;
            case 'reviewed_asc':
                $query->orderBy('reviewed_at', 'asc')
                      ->orderBy('created_at', 'desc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }
        
        $applications = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $applications,
        ]);
    }

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
            'status' => 'pending',
            'metadata' => $metadata,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Application created successfully',
            'data' => $application,
        ], 201);
    }

    public function show($id)
    {
        $application = Application::with(['reviewer'])
            ->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $application,
        ]);
    }

    public function update(Request $request, $id)
    {
        $application = Application::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
            'message' => 'sometimes|required|string',
            'status' => 'sometimes|required|in:pending,approved,rejected',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        if ($request->has('status') && $request->status !== $application->status) {
            $application->status = $request->status;
            
            if ($request->status !== 'pending') {
                $application->reviewed_by = Auth::id();
                $application->reviewed_at = now();
            }
        }
        
        $application->save();
        
        if ($request->has('comment') && !empty($request->comment)) {
            Comment::create([
                'application_id' => $application->id,
                'user_id' => Auth::id(),
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

    public function destroy($id)
    {
        $application = Application::findOrFail($id);
        $application->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Application deleted successfully with all related comments',
        ]);
    }
}
