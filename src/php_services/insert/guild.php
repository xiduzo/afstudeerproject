<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';
    require_once '../function/now.php';
    require_once '../function/uuid.php';

    $name = $_GET['name'];
    $worldUuid = $_GET['worldUuid'];

    if(empty($name) || empty($worldUuid)) {
        echo json_encode(false);
        return;
    }

    $uuid = uuid();

    // Insert the house to the database
    $database->insert("Guild", [
        "uuid" => $uuid,
        "name" => $name,
        "worldUuid" => $worldUuid
    ]);

    $guild = $database->get("Guild", "*", [
        "uuid" => $uuid
    ]);

    echo json_encode($guild);

?>
