<?php
/**
 * 4jawaly SMS API integration
 * Docs: https://api-sms.4jawaly.com
 */

function sendSMS($phone, $message) {
    $apiKey = getenv('SMS_API_KEY') ?: 'ltO6o19GrWxaRMZF7EehTzfplPA6UPBLjU0scnD6';
    $apiSecret = getenv('SMS_API_SECRET') ?: 'lS4wV9edqMR6jzt1qpC3rcDap6i3zXe3GhPxx3wKMy2PZx9OphBdHu1Unzfo6OKuIF7Yu8niP76qf8dHXcRojB2FoJBNHLg4unvk';
    $sender = getenv('SMS_SENDER') ?: 'WillEDU';

    if (!$apiKey || !$apiSecret) {
        error_log('SMS: missing API credentials');
        return ['success' => false, 'error' => 'SMS not configured'];
    }

    // Normalize phone to international format (966xxxxxxxxx)
    $phone = preg_replace('/[^0-9]/', '', $phone);
    if (strpos($phone, '0') === 0) {
        $phone = '966' . substr($phone, 1);
    } elseif (strpos($phone, '966') !== 0) {
        $phone = '966' . $phone;
    }

    $payload = [
        'messages' => [
            [
                'text' => $message,
                'numbers' => [$phone],
                'sender' => $sender,
            ],
        ],
        'globalSendingStatus' => 1,
        'globalTimeZoneAlignment' => 0,
    ];

    $ch = curl_init('https://api-sms.4jawaly.com/api/v1/account/area/sms/send');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERPWD => "$apiKey:$apiSecret",
        CURLOPT_HTTPAUTH => CURLAUTH_BASIC,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        error_log("SMS curl error: $curlError");
        return ['success' => false, 'error' => 'SMS gateway unreachable'];
    }

    $data = json_decode($response, true);

    if ($httpCode >= 200 && $httpCode < 300) {
        return ['success' => true, 'data' => $data];
    }

    error_log("SMS API error ($httpCode): " . $response);
    return ['success' => false, 'error' => 'SMS send failed', 'details' => $data];
}

function generateOTP() {
    return str_pad((string)random_int(0, 9999), 4, '0', STR_PAD_LEFT);
}

function sendOTP($phone, $otp) {
    $message = "رمز التحقق الخاص بك في النخبة هو: $otp\nصالح لمدة 5 دقائق.";
    return sendSMS($phone, $message);
}

function normalizePhone($phone) {
    $phone = preg_replace('/[^0-9]/', '', $phone);
    if (strpos($phone, '0') === 0) {
        $phone = '966' . substr($phone, 1);
    } elseif (strpos($phone, '966') !== 0) {
        $phone = '966' . $phone;
    }
    return $phone;
}
