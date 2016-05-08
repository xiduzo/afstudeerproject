<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $userUid = $_GET['userUid'];

    if(empty($userUid)) {
        echo json_encode(false);
        return;
    }

    $guilds = $database->select("Guild", [
        "[>]UserInGuild" => ["uuid" => "guildUuid"]
    ], [
        "uuid",
        "name"
    ], [
        "userUid" => $userUid
    ]);

    echo json_encode($guilds);

?>
