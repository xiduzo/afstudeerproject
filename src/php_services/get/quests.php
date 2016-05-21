<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $worldUuid = $_GET['worldUuid'];

    if(!isset($worldUuid)) {
        echo json_encode(false);
        return;
    }

    $quests = $database->select("Quest", "*", [
        "worldUuid" => $worldUuid
    ]);

    echo json_encode($quests);

?>
