<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $userUid = $_GET['userUid'];
    $guildUuid = $_GET['guildUuid'];
    $oldGuildUuid = $_GET['oldGuildUuid'];

    if(empty($userUid) || empty($guildUuid) || empty($oldGuildUuid)) {
        echo json_encode(false);
        return;
    }

    // Insert the house to the database
    $database->update("UserInGuild", [
        "guildUuid" => $guildUuid
    ], [
        "AND" => [
            "guildUuid" => $oldGuildUuid,
            "userUid" => $userUid
        ]
    ]);

    echo json_encode(true);

?>
