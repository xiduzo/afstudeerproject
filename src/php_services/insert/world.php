<?php

    header("Access-Control-Allow-Origin: *");
    header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';
    require_once '../function/now.php';
    require_once '../function/uuid.php';

    $name = $_GET['name'];

    if(!isset($name)) {
        echo json_encode(false);
        return;
    }

    $uuid = uuid();

    // Insert the house to the database
    $database->insert("World", [
        "uuid" => $uuid,
        "name" => $name
    ]);

    $world = $database->get("World", "*", [
        "uuid" => $uuid
    ]);

    echo json_encode($world);

?>
