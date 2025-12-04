<?php
require __DIR__ . '/vendor/autoload.php';
use Minishlink\WebPush\VAPID;
echo json_encode(VAPID::createVapidKeys());
