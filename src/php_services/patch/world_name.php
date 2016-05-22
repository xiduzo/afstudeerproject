<?php

    header("Access-Control-Allow-Origin: *");
    header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $name = $_GET['name'];
    $uuid = $_GET['uuid'];

    if(!isset($name) || !isset($uuid)) {
        echo json_encode(false);
        return;
    }

    // Update the world name
    $database->update("World", [
        "name" => $name
    ], [
        "uuid" => $uuid
    ]);

    echo json_encode(true);

?>
