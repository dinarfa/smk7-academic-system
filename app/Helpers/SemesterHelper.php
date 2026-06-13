<?php

namespace App\Helpers;

use App\Models\SchoolClass;
use Illuminate\Support\Carbon;

class SemesterHelper
{
    /**
     * Get available semesters derived from academic_year fields in school_classes.
     *
     * @return array<int, array{label: string, value: string, startDate: string, endDate: string}>
     */
    public static function getAvailableSemesters(): array
    {
        $academicYears = SchoolClass::query()
            ->whereNotNull('academic_year')
            ->distinct()
            ->pluck('academic_year')
            ->sort()
            ->values();

        $semesters = [];

        foreach ($academicYears as $academicYear) {
            $range = self::parseAcademicYear($academicYear);

            if ($range === null) {
                continue;
            }

            [$startYear] = $range;

            // Semester 1 (Ganjil): July – December
            $semesters[] = [
                'label' => "{$academicYear} - Semester 1 (Ganjil)",
                'value' => "{$academicYear}-1",
                'startDate' => Carbon::create($startYear, 7, 1)->toDateString(),
                'endDate' => Carbon::create($startYear, 12, 31)->toDateString(),
            ];

            // Semester 2 (Genap): January – June of next year
            $semesters[] = [
                'label' => "{$academicYear} - Semester 2 (Genap)",
                'value' => "{$academicYear}-2",
                'startDate' => Carbon::create($startYear + 1, 1, 1)->toDateString(),
                'endDate' => Carbon::create($startYear + 1, 6, 30)->toDateString(),
            ];
        }

        return $semesters;
    }

    /**
     * Convert a semester value (e.g. "2025/2026-1") to a date range.
     *
     * @return array{startDate: string, endDate: string}|null
     */
    public static function getDateRange(string $semesterValue): ?array
    {
        $parts = explode('-', $semesterValue);
        if (count($parts) !== 2) {
            return null;
        }

        $academicYear = $parts[0];
        $semesterNumber = (int) $parts[1];

        if (! in_array($semesterNumber, [1, 2], true)) {
            return null;
        }

        $range = self::parseAcademicYear($academicYear);

        if ($range === null) {
            return null;
        }

        [$startYear] = $range;

        if ($semesterNumber === 1) {
            return [
                'startDate' => Carbon::create($startYear, 7, 1)->toDateString(),
                'endDate' => Carbon::create($startYear, 12, 31)->toDateString(),
            ];
        }

        return [
            'startDate' => Carbon::create($startYear + 1, 1, 1)->toDateString(),
            'endDate' => Carbon::create($startYear + 1, 6, 30)->toDateString(),
        ];
    }

    /**
     * Parse academic year string (e.g. "2025/2026") into [startYear, endYear].
     *
     * @return array{int, int}|null
     */
    private static function parseAcademicYear(string $academicYear): ?array
    {
        $parts = explode('/', $academicYear);

        if (count($parts) !== 2) {
            return null;
        }

        $startYear = (int) $parts[0];
        $endYear = (int) $parts[1];

        if ($startYear < 2000 || $endYear < 2000) {
            return null;
        }

        return [$startYear, $endYear];
    }
}
