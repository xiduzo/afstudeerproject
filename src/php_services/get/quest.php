<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $questUuid = $_GET['questUuid'];

    if(!isset($questUuid)) {
        echo json_encode(false);
        return;
    }

    $quest = $database->get("Quest", "*", [
        "uuid" => $questUuid
    ]);

    echo json_encode($quest);

?>
