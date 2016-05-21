<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $questUuid = $_GET['questUuid'];
    $worldUuid = $_GET['worldUuid'];

    if(!isset($questUuid) || !isset($worldUuid)) {
        echo json_encode(false);
        return;
    }

    // Insert the house to the database
    $database->delete("Quest", [
        "AND" => [
            "uuid" => $questUuid,
            "worldUuid" => $worldUuid
        ]
    ]);

    echo json_encode(true);

?>
