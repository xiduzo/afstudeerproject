<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $userUid = $_GET['userUid'];
    $worldUuid = $_GET['worldUuid'];

    if(empty($userUid) || empty($worldUuid)) {
        echo json_encode(false);
        return;
    }

    $guilds = $database->select("Guild", [
        "[>]UserInWorld" => ["worldUuid" => "worldUuid"]
    ], [
        "uuid",
        "name"
    ], [
        "AND" => [
            "UserInWorld.worldUuid" => $worldUuid,
            "UserInWorld.userUid" => $userUid
        ]
    ]);

    echo json_encode($guilds);

?>
