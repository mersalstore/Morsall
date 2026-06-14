<?php
/**
 * Internal mail proxy — called by Node.js via HTTP (localhost)
 * Place in: public_html/mail_proxy.php
 */

// Secret token to prevent public abuse
define('SECRET', 'morsall_mail_2026');

header('Content-Type: application/json');

// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);

// Validate secret
if (empty($body['secret']) || $body['secret'] !== SECRET) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

$to      = filter_var($body['to'] ?? '', FILTER_SANITIZE_EMAIL);
$subject = $body['subject'] ?? '';
$html    = $body['html'] ?? '';

if (!$to || !$subject || !$html) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing fields']);
    exit;
}

// --- Send via SMTP (Hostinger) using PHPMailer-style headers ---
// Use PHP's built-in mail with proper headers
$from_name    = 'مرسال';
$from_email   = 'support@morsall.com';
$smtp_host    = 'smtp.hostinger.com';
$smtp_port    = 465;
$smtp_user    = 'support@morsall.com';
$smtp_pass    = 'Morsall@1234';

// Use SMTP via stream socket (pure PHP, no library needed)
function send_smtp_mail($host, $port, $user, $pass, $from, $from_name, $to, $subject, $html) {
    $context = stream_context_create([
        'ssl' => [
            'verify_peer'       => false,
            'verify_peer_name'  => false,
            'allow_self_signed' => true,
        ]
    ]);

    $socket = @stream_socket_client(
        "ssl://{$host}:{$port}",
        $errno, $errstr, 15,
        STREAM_CLIENT_CONNECT,
        $context
    );

    if (!$socket) {
        return "Connection failed: $errstr ($errno)";
    }

    $read = fgets($socket, 512);

    // EHLO
    fputs($socket, "EHLO morsall.com\r\n");
    $ehlo = '';
    while ($line = fgets($socket, 512)) {
        $ehlo .= $line;
        if (substr($line, 3, 1) === ' ') break;
    }

    // AUTH LOGIN
    fputs($socket, "AUTH LOGIN\r\n");
    fgets($socket, 512);
    fputs($socket, base64_encode($user) . "\r\n");
    fgets($socket, 512);
    fputs($socket, base64_encode($pass) . "\r\n");
    $auth = fgets($socket, 512);
    if (strpos($auth, '235') === false) {
        fclose($socket);
        return "Auth failed: $auth";
    }

    // MAIL FROM
    fputs($socket, "MAIL FROM:<{$from}>\r\n");
    fgets($socket, 512);

    // RCPT TO
    fputs($socket, "RCPT TO:<{$to}>\r\n");
    fgets($socket, 512);

    // DATA
    fputs($socket, "DATA\r\n");
    fgets($socket, 512);

    $encoded_subject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $encoded_from    = '=?UTF-8?B?' . base64_encode($from_name) . '?=';

    $message  = "From: {$encoded_from} <{$from}>\r\n";
    $message .= "To: <{$to}>\r\n";
    $message .= "Subject: {$encoded_subject}\r\n";
    $message .= "MIME-Version: 1.0\r\n";
    $message .= "Content-Type: text/html; charset=UTF-8\r\n";
    $message .= "Content-Transfer-Encoding: base64\r\n";
    $message .= "\r\n";
    $message .= chunk_split(base64_encode($html));
    $message .= "\r\n.\r\n";

    fputs($socket, $message);
    $data_resp = fgets($socket, 512);

    fputs($socket, "QUIT\r\n");
    fclose($socket);

    if (strpos($data_resp, '250') !== false) {
        return true;
    }
    return "Send failed: $data_resp";
}

$result = send_smtp_mail($smtp_host, $smtp_port, $smtp_user, $smtp_pass, $from_email, $from_name, $to, $subject, $html);

if ($result === true) {
    echo json_encode(['success' => true]);
} else {
    // Fallback: try PHP mail()
    $headers  = "From: =?UTF-8?B?" . base64_encode("مرسال") . "?= <{$from_email}>\r\n";
    $headers .= "Reply-To: {$from_email}\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    $mail_ok = mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $html, $headers);

    if ($mail_ok) {
        echo json_encode(['success' => true, 'method' => 'phpmail']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => $result]);
    }
}
