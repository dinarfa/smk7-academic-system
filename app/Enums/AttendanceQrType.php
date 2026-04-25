<?php

namespace App\Enums;

enum AttendanceQrType: string
{
    case Morning = 'morning';
    case Subject = 'subject';
    case Dismissal = 'dismissal';
}
