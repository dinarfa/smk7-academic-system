<?php

use App\Enums\UserRole;
use App\Models\Exam;
use App\Models\Question;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;

use function Pest\Laravel\actingAs;

it('teacher can attach questions to an exam in order', function (): void {
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);
    $class = SchoolClass::factory()->create();
    $subject = Subject::factory()->create([
        'school_class_id' => $class->id,
        'teacher_id' => $teacher->id,
    ]);

    $exam = Exam::factory()->create([
        'created_by' => $teacher->id,
        'subject_id' => $subject->id,
        'class_id' => $class->id,
    ]);

    $bankExam = Exam::factory()->create([
        'created_by' => $teacher->id,
        'subject_id' => $subject->id,
        'class_id' => $class->id,
    ]);

    $firstQuestion = Question::factory()->create([
        'exam_id' => $bankExam->id,
        'prompt' => 'First question?',
        'sort_order' => 0,
    ]);

    $secondQuestion = Question::factory()->create([
        'exam_id' => $bankExam->id,
        'prompt' => 'Second question?',
        'sort_order' => 1,
    ]);

    actingAs($teacher)
        ->post(route('teacher.exams.questions.attach', $exam), [
            'question_ids' => [$secondQuestion->id, $firstQuestion->id],
        ])
        ->assertRedirect(route('teacher.exams.questions.index', $exam));

    expect($exam->fresh()->attachedQuestions->pluck('id')->all())->toBe([
        $secondQuestion->id,
        $firstQuestion->id,
    ]);

    $this->assertDatabaseHas('exam_question', [
        'exam_id' => $exam->id,
        'question_id' => $secondQuestion->id,
        'sort_order' => 0,
    ]);

    $this->assertDatabaseHas('exam_question', [
        'exam_id' => $exam->id,
        'question_id' => $firstQuestion->id,
        'sort_order' => 1,
    ]);
});

it('teacher cannot attach another teachers questions', function (): void {
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);
    $otherTeacher = User::factory()->create(['role' => UserRole::Teacher]);
    $class = SchoolClass::factory()->create();
    $subject = Subject::factory()->create([
        'school_class_id' => $class->id,
        'teacher_id' => $teacher->id,
    ]);

    $exam = Exam::factory()->create([
        'created_by' => $teacher->id,
        'subject_id' => $subject->id,
        'class_id' => $class->id,
    ]);

    $otherExam = Exam::factory()->create([
        'created_by' => $otherTeacher->id,
        'subject_id' => $subject->id,
        'class_id' => $class->id,
    ]);

    $otherQuestion = Question::factory()->create([
        'exam_id' => $otherExam->id,
        'prompt' => 'Not available question?',
    ]);

    actingAs($teacher)
        ->post(route('teacher.exams.questions.attach', $exam), [
            'question_ids' => [$otherQuestion->id],
        ])
        ->assertSessionHasErrors('question_ids');
});

it('only teachers can attach questions to exams', function (): void {
    $student = User::factory()->create(['role' => UserRole::Student]);
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);
    $class = SchoolClass::factory()->create();
    $subject = Subject::factory()->create([
        'school_class_id' => $class->id,
        'teacher_id' => $teacher->id,
    ]);

    $exam = Exam::factory()->create([
        'created_by' => $teacher->id,
        'subject_id' => $subject->id,
        'class_id' => $class->id,
    ]);

    $question = Question::factory()->create([
        'exam_id' => $exam->id,
    ]);

    actingAs($student)
        ->post(route('teacher.exams.questions.attach', $exam), [
            'question_ids' => [$question->id],
        ])
        ->assertForbidden();
});
