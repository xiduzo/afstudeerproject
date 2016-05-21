<?php

    header("Access-Control-Allow-Origin: *");
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
