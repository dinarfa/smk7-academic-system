<?php

use App\Enums\UserRole;
use App\Models\AnswerOption;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\Question;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('student can start an exam and see the question runner', function () {
    $class = SchoolClass::factory()->create();
    $student = User::factory()->create([
        'role' => UserRole::Student,
        'school_class_id' => $class->id,
    ]);
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);

    $subject = Subject::factory()->create([
        'school_class_id' => $class->id,
        'teacher_id' => $teacher->id,
    ]);

    $exam = Exam::query()->create([
        'title' => 'Ujian Runner',
        'subject_id' => $subject->id,
        'class_id' => $class->id,
        'created_by' => $teacher->id,
        'duration_minutes' => 45,
        'status' => 'active',
    ]);

    $question = Question::query()->create([
        'exam_id' => $exam->id,
        'prompt' => 'Apa ibu kota Indonesia?',
        'type' => 'multiple_choice',
        'points' => 5,
        'sort_order' => 1,
        'explanation' => 'Jakarta adalah ibu kota Indonesia.',
    ]);

    $correctOption = AnswerOption::query()->create([
        'question_id' => $question->id,
        'option_text' => 'Jakarta',
        'is_correct' => true,
        'sort_order' => 1,
    ]);

    AnswerOption::query()->create([
        'question_id' => $question->id,
        'option_text' => 'Bandung',
        'is_correct' => false,
        'sort_order' => 2,
    ]);

    $response = $this->actingAs($student)->post("/student/exams/{$exam->id}/attempts");

    $attempt = ExamAttempt::query()
        ->where('exam_id', $exam->id)
        ->where('student_id', $student->id)
        ->firstOrFail();

    $response->assertRedirect(route('student.exams.attempts.show', [
        'exam' => $exam,
        'attempt' => $attempt,
    ]));

    $this->actingAs($student)
        ->get(route('student.exams.attempts.show', [
            'exam' => $exam,
            'attempt' => $attempt,
        ]))
        ->assertStatus(200)
        ->assertSee($exam->title)
        ->assertSee($question->prompt)
        ->assertSee($correctOption->option_text)
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/exams/show')
            ->has('questions', 1)
            ->where('questions.0.prompt', $question->prompt));
});

test('student must provide valid access code if exam requires it', function () {
    $class = SchoolClass::factory()->create();
    $student = User::factory()->create([
        'role' => UserRole::Student,
        'school_class_id' => $class->id,
    ]);

    $exam = Exam::query()->create([
        'title' => 'Ujian Rahasia',
        'subject_id' => Subject::factory()->create()->id,
        'class_id' => $class->id,
        'created_by' => User::factory()->create(['role' => UserRole::Teacher])->id,
        'duration_minutes' => 45,
        'status' => 'active',
        'access_code' => 'RAHASIA123',
    ]);

    // Missing access code
    $this->actingAs($student)->post("/student/exams/{$exam->id}/attempts")
        ->assertSessionHasErrors(['access_code']);

    // Invalid access code
    $this->actingAs($student)->post("/student/exams/{$exam->id}/attempts", ['access_code' => 'SALAH'])
        ->assertSessionHasErrors(['access_code']);

    // Valid access code
    $this->actingAs($student)->post("/student/exams/{$exam->id}/attempts", ['access_code' => 'RAHASIA123'])
        ->assertRedirect();
});

test('submitting exam calculates score correctly', function () {
    $class = SchoolClass::factory()->create();
    $student = User::factory()->create([
        'role' => UserRole::Student,
        'school_class_id' => $class->id,
    ]);

    $exam = Exam::query()->create([
        'title' => 'Ujian Nilai',
        'subject_id' => Subject::factory()->create()->id,
        'class_id' => $class->id,
        'created_by' => User::factory()->create(['role' => UserRole::Teacher])->id,
        'duration_minutes' => 45,
        'status' => 'active',
    ]);

    $question1 = Question::query()->create([
        'exam_id' => $exam->id,
        'prompt' => 'Q1',
        'type' => 'multiple_choice',
        'points' => 10,
        'sort_order' => 1,
    ]);
    $opt1Correct = AnswerOption::query()->create(['question_id' => $question1->id, 'option_text' => 'A', 'is_correct' => true, 'sort_order' => 1]);
    $opt1Wrong = AnswerOption::query()->create(['question_id' => $question1->id, 'option_text' => 'B', 'is_correct' => false, 'sort_order' => 2]);

    $question2 = Question::query()->create([
        'exam_id' => $exam->id,
        'prompt' => 'Q2',
        'type' => 'multiple_choice',
        'points' => 10,
        'sort_order' => 2,
    ]);
    $opt2Correct = AnswerOption::query()->create(['question_id' => $question2->id, 'option_text' => 'A', 'is_correct' => true, 'sort_order' => 1]);
    $opt2Wrong = AnswerOption::query()->create(['question_id' => $question2->id, 'option_text' => 'B', 'is_correct' => false, 'sort_order' => 2]);

    $attempt = ExamAttempt::query()->create([
        'exam_id' => $exam->id,
        'student_id' => $student->id,
        'status' => 'in_progress',
        'started_at' => now(),
    ]);

    // Answer Q1 correctly
    $this->actingAs($student)->post("/student/exams/{$exam->id}/attempts/{$attempt->id}/responses", [
        'question_id' => $question1->id,
        'answer_option_id' => $opt1Correct->id,
    ])->assertRedirect();

    // Answer Q2 wrongly
    $this->actingAs($student)->post("/student/exams/{$exam->id}/attempts/{$attempt->id}/responses", [
        'question_id' => $question2->id,
        'answer_option_id' => $opt2Wrong->id,
    ])->assertRedirect();

    // Submit
    $this->actingAs($student)->post("/student/exams/{$exam->id}/attempts/{$attempt->id}/submit")
        ->assertRedirect();

    $attempt->refresh();
    expect($attempt->status)->toBe('submitted');
    expect((float)$attempt->score)->toEqual(50.0); // 10/20 * 100
});
