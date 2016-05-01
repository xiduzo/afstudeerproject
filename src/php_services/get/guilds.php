<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $guilds = $database->select("Guild", "*");

    echo json_encode($guilds);

?>
