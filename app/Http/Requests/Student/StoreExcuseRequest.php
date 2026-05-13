<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExcuseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->isStudent();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in('sick', 'permission', 'other')],
            'reason' => ['required', 'string', 'max:500'],
            'excused_date' => ['required', 'date', 'before_or_equal:today'],
            'attendance_record_id' => ['nullable', 'integer', 'exists:attendance_records,id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'type.required' => 'Jenis izin harus dipilih.',
            'reason.required' => 'Alasan harus diisi.',
            'reason.max' => 'Alasan maksimal 500 karakter.',
            'excused_date.required' => 'Tanggal izin harus diisi.',
            'excused_date.before_or_equal' => 'Tanggal izin tidak boleh di masa depan.',
        ];
    }
}
