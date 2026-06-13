<?php

namespace App\Enums;

enum AttendanceQrType: string
{
    case Morning = 'morning';
    case ClassPhase = 'class';
    case Subject = 'subject';
    case Dismissal = 'dismissal';

    public function toRecordPhase(): self
    {
        return match ($this) {
            self::Subject => self::ClassPhase,
            default => $this,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Morning => 'Pagi',
            self::ClassPhase => 'Jam Pelajaran',
            self::Subject => 'Mata Pelajaran',
            self::Dismissal => 'Pulang',
        };
    }
}
