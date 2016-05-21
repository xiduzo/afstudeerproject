<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $uuid = $_GET['uuid'];

    if(!isset($uuid)) {
        echo json_encode(false);
        return;
    }

    // Insert the house to the database
    $database->delete("Guild", [
        "uuid" => $uuid
    ]);

    // Also delete all the connection this guild had in the DB
    $database->delete("UserInGuild", [
        "guildUuid" => $uuid
    ]);

    echo json_encode(true);

?>
