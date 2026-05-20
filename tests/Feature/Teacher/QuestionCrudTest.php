<?php

use App\Models\Exam;
use App\Models\Question;
use App\Models\Subject;
use App\Models\User;

beforeEach(function () {
    $this->teacher = User::factory()->create(['role' => 'teacher']);
    $this->otherTeacher = User::factory()->create(['role' => 'teacher']);
    $this->subject = Subject::factory()->create();
    $this->exam = Exam::factory()->create([
        'subject_id' => $this->subject->id,
        'created_by' => $this->teacher->id,
    ]);
});

describe('Teacher Question CRUD', function () {
    test('teacher can view questions for their exam', function () {
        $question = Question::factory()->create([
            'exam_id' => $this->exam->id,
            'prompt' => 'What is Laravel?',
            'type' => 'multiple_choice',
            'points' => 5,
        ]);

        // Create answer options
        $question->answerOptions()->create([
            'option_text' => 'A PHP framework',
            'is_correct' => true,
            'sort_order' => 0,
        ]);

        // Verify questions are queryable
        $questions = $this->exam->questions()->with('answerOptions')->get();
        expect($questions)->toHaveCount(1);
        expect($questions[0]->prompt)->toBe('What is Laravel?');
        expect($questions[0]->answerOptions)->toHaveCount(1);
    });

    test('teacher can create a question with answer options', function () {
        $response = $this->actingAs($this->teacher)->post(
            route('teacher.exams.questions.store', $this->exam),
            [
                'prompt' => 'What is the capital of France?',
                'type' => 'multiple_choice',
                'points' => 10,
                'sort_order' => 1,
                'explanation' => 'Paris is the capital.',
                'answer_options' => [
                    ['option_text' => 'Paris', 'is_correct' => true],
                    ['option_text' => 'London', 'is_correct' => false],
                    ['option_text' => 'Berlin', 'is_correct' => false],
                    ['option_text' => 'Madrid', 'is_correct' => false],
                ],
            ]
        );

        $response->assertRedirect(route('teacher.exams.questions.index', $this->exam));

        $this->assertDatabaseHas('questions', [
            'exam_id' => $this->exam->id,
            'prompt' => 'What is the capital of France?',
            'type' => 'multiple_choice',
            'points' => 10,
        ]);

        $this->assertDatabaseCount('answer_options', 4);
    });

    test('question must have at least 2 answer options', function () {
        $response = $this->actingAs($this->teacher)->post(
            route('teacher.exams.questions.store', $this->exam),
            [
                'prompt' => 'What is 2 + 2?',
                'type' => 'multiple_choice',
                'points' => 5,
                'answer_options' => [
                    ['option_text' => '4', 'is_correct' => true],
                ],
            ]
        );

        $response->assertSessionHasErrors('answer_options');
    });

    test('question must have exactly one correct answer', function () {
        $response = $this->actingAs($this->teacher)->post(
            route('teacher.exams.questions.store', $this->exam),
            [
                'prompt' => 'What is 2 + 2?',
                'type' => 'multiple_choice',
                'points' => 5,
                'answer_options' => [
                    ['option_text' => '4', 'is_correct' => false],
                    ['option_text' => '5', 'is_correct' => false],
                ],
            ]
        );

        $response->assertSessionHasErrors('answer_options');
    });

    test('teacher can edit a question', function () {
        $question = Question::factory()->create([
            'exam_id' => $this->exam->id,
            'prompt' => 'Original question',
        ]);

        $question->answerOptions()->create([
            'option_text' => 'Old answer',
            'is_correct' => true,
            'sort_order' => 0,
        ]);

        $response = $this->actingAs($this->teacher)->put(
            route('teacher.exams.questions.update', [$this->exam, $question]),
            [
                'prompt' => 'Updated question',
                'type' => 'multiple_choice',
                'points' => 15,
                'answer_options' => [
                    ['option_text' => 'New answer 1', 'is_correct' => true],
                    ['option_text' => 'New answer 2', 'is_correct' => false],
                ],
            ]
        );

        $response->assertRedirect(route('teacher.exams.questions.index', $this->exam));

        $this->assertDatabaseHas('questions', [
            'id' => $question->id,
            'prompt' => 'Updated question',
            'points' => 15,
        ]);

        $this->assertDatabaseHas('answer_options', [
            'question_id' => $question->id,
            'option_text' => 'New answer 1',
        ]);
    });

    test('teacher can create an essay question without answer options', function () {
        $response = $this->actingAs($this->teacher)->post(
            route('teacher.exams.questions.store', $this->exam),
            [
                'prompt' => 'Describe the Laravel lifecycle.',
                'type' => 'essay',
                'points' => 20,
            ]
        );

        $response->assertRedirect(route('teacher.exams.questions.index', $this->exam));

        $this->assertDatabaseHas('questions', [
            'exam_id' => $this->exam->id,
            'prompt' => 'Describe the Laravel lifecycle.',
            'type' => 'essay',
            'points' => 20,
        ]);
    });

    test('teacher can delete a question', function () {
        $question = Question::factory()->create([
            'exam_id' => $this->exam->id,
        ]);

        $response = $this->actingAs($this->teacher)->delete(
            route('teacher.exams.questions.destroy', [$this->exam, $question])
        );

        $response->assertRedirect(route('teacher.exams.questions.index', $this->exam));

        $this->assertModelMissing($question);
        $this->assertDatabaseCount('answer_options', 0);
    });

    test('other teacher cannot modify questions from another exam', function () {
        $question = Question::factory()->create([
            'exam_id' => $this->exam->id,
        ]);

        $response = $this->actingAs($this->otherTeacher)->put(
            route('teacher.exams.questions.update', [$this->exam, $question]),
            ['prompt' => 'Hacked!']
        );

        $response->assertForbidden();
    });

    test('other teacher cannot delete questions from another exam', function () {
        $question = Question::factory()->create([
            'exam_id' => $this->exam->id,
        ]);

        $response = $this->actingAs($this->otherTeacher)->delete(
            route('teacher.exams.questions.destroy', [$this->exam, $question])
        );

        $response->assertForbidden();
    });
});
