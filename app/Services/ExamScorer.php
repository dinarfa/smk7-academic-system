<?php

namespace App\Services;

use App\Models\ExamAttempt;
use App\Models\ExamResponse;

/**
 * Service responsible for auto-scoring objective questions on an attempt.
 */
class ExamScorer
{
    /**
     * Score the provided exam attempt.
     *
     * This will:
     * - Re-evaluate objective responses (those with `answer_option_id`) and
     *   set `is_correct` and `points_awarded` on each `ExamResponse`.
     * - Sum all awarded points and store the total in `$attempt->score`.
     *
     * @return ExamAttempt The updated attempt with persisted score
     */
    public function scoreAttempt(ExamAttempt $attempt): ExamAttempt
    {
        $attempt->loadMissing(['responses.question', 'responses.answerOption']);

        $total = 0.0;

        /** @var ExamResponse $response */
        foreach ($attempt->responses as $response) {
            $question = $response->question;

            // Only auto-grade objective responses that reference an answer option
            if ($response->answer_option_id) {
                $option = $response->answerOption;
                $isCorrect = (bool) ($option->is_correct ?? false);
                $points = $isCorrect ? (float) ($question->points ?? 0) : 0.0;

                $response->is_correct = $isCorrect;
                $response->points_awarded = $points;
                $response->save();

                $total += (float) $points;
            }
        }

        $attempt->score = $total;
        $attempt->save();

        return $attempt;
    }
}
