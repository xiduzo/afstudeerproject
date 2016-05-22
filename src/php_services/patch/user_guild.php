<?php

    header("Access-Control-Allow-Origin: *");
    header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $userUid = $_GET['userUid'];
    $guildUuid = $_GET['guildUuid'];
    $oldGuildUuid = $_GET['oldGuildUuid'];

    if(!isset($userUid) || !isset($guildUuid) || !isset($oldGuildUuid)) {
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
