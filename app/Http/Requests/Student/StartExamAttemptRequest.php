<?php

namespace App\Http\Requests\Student;

use App\Models\Exam;
use Illuminate\Foundation\Http\FormRequest;

class StartExamAttemptRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        if (! $user || ! method_exists($user, 'isStudent') || ! $user->isStudent()) {
            return false;
        }

        $exam = $this->route('exam');
        if (! $exam instanceof Exam) {
            return false;
        }

        // Ensure student belongs to the exam's class (if exam is assigned to a class)
        if ($exam->class_id && $exam->class_id !== $user->school_class_id) {
            return false;
        }

        // Ensure exam is currently open
        $now = now();
        if ($exam->starts_at && $now->lt($exam->starts_at)) {
            return false;
        }
        if ($exam->ends_at && $now->gt($exam->ends_at)) {
            return false;
        }

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     * No body payload is required to start an attempt.
     */
    public function rules(): array
    {
        return [];
    }
}
