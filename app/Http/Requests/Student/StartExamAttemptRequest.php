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

        if ($exam->status !== 'active') {
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
        $exam = $this->route('exam');
        $rules = [];

        if ($exam && $exam->access_code) {
            $rules['access_code'] = ['required', 'string'];
        }

        return $rules;
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $exam = $this->route('exam');

            if ($exam && $exam->access_code) {
                if ($this->input('access_code') !== $exam->access_code) {
                    $validator->errors()->add('access_code', 'Kode akses ujian tidak valid.');
                }
            }
        });
    }
}
