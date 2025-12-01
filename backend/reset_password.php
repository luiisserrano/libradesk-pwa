<?php
$u = App\Models\User::where('email', 'testuser12345@example.com')->first();
if ($u) {
    $u->password = Hash::make('123456');
    $u->save();
    echo "Password reset successful for " . $u->email . "\n";
} else {
    echo "User not found\n";
}
