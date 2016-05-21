<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $uuid = $_GET['uuid'];

    if(!isset($uuid)) {
        echo json_encode(false);
        return;
    }

    $world = $database->get("World", "*", [
        "uuid" => $uuid
    ]);

    echo json_encode($world);

?>
