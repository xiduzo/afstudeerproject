<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $uuid = $_GET['uuid'];

    if(empty($uuid)) {
        echo json_encode(false);
        return;
    }

    // Insert the house to the database
    $database->delete("World", [
        "uuid" => $uuid
    ]);

    // Also delete all connections of this world in the DB
    $database->delete("UserInWorld", [
        "worldUuid" => $uuid
    ]);

    $database->delete("Quest", [
        "worldUuid" => $uuid
    ]);

    echo json_encode(true);

?>
