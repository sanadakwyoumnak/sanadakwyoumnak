<?php
// save.php — يحفظ data.json على الاستضافة
// برمجة: الفريق المعتمد التقني

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ─── مصادقة بسيطة ───────────────────────────────────────
define('SECRET_KEY', 'sw_2024_secret');

$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if ($auth !== 'Bearer ' . SECRET_KEY) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// ─── استقبال وحفظ البيانات ───────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
if (!$raw) {
    http_response_code(400);
    echo json_encode(['error' => 'No data received']);
    exit;
}

// تأكد إن البيانات JSON صحيحة
$data = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$dataFile = __DIR__ . '/data.json';

// بيك-أب قبل الحفظ
if (file_exists($dataFile)) {
    copy($dataFile, $dataFile . '.bak');
}

$written = file_put_contents(
    $dataFile,
    json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
);

if ($written === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to write file']);
    exit;
}

echo json_encode(['success' => true, 'bytes' => $written]);
