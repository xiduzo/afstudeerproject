<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $worldUuid = $_GET['worldUuid'];

    if(empty($worldUuid)) {
        echo json_encode(false);
        return;
    }

    // http://stackoverflow.com/a/2686266/4655177
    $users = $database->select("User", [
        "[>]UserInGuild" => ["uid" => "userUid"],
        "[>]Guild" => ["UserInGuild.guildUuid" => "uuid"]
    ], [
        "uid",
        "displayname",
        "surname",
        "email"
    ], [
        "AND" => [
            "OR" => [
                "worldUuid[!]" => [$worldUuid],
                "worldUuid" => null
            ],
            "access" => 1
        ]
    ]);

    echo json_encode($users);

?>
