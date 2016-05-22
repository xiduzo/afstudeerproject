<?php

    header("Access-Control-Allow-Origin: *");
    header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';
    require_once '../function/now.php';

    $uid = $_GET['uid'];

    if(!isset($uid)) {
        echo json_encode(false);
        return;
    }

    // Update the world name
    $database->update("User", [
        "lastLogin" => now()
    ], [
        "uid" => $uid
    ]);

    // Also make a login log
    // Maybe I can use this data someday
    $database->insert("UserLogin", [
        "userUid" => $uid
    ]);

    echo json_encode(true);

?>
