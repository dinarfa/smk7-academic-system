<?php

namespace App\Http\Requests\Student;

use App\Models\ExamAttempt;
use Illuminate\Foundation\Http\FormRequest;

class SubmitExamAttemptRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (! $user || ! method_exists($user, 'isStudent') || ! $user->isStudent()) {
            return false;
        }

        $attempt = $this->route('attempt');
        if (! $attempt instanceof ExamAttempt) {
            return false;
        }

        // Only the attempt owner can submit and only when in progress
        if ($attempt->student_id !== $user->id) {
            return false;
        }

        if ($attempt->status !== 'in_progress') {
            return false;
        }

        return true;
    }

    public function rules(): array
    {
        return [];
    }
}
