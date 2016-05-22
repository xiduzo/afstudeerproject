<?php

    header("Access-Control-Allow-Origin: *");
    header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $worldUuid = $_GET['worldUuid'];

    if(!isset($worldUuid)) {
        echo json_encode(false);
        return;
    }

    $guilds = $database->select("Guild", "*", [
        "worldUuid" => $worldUuid
    ]);

    echo json_encode($guilds);

?>
