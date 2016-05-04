<?php

    // http://php.net/manual/en/function.uniqid.php#80419
    function uuid() {
        $t = explode(" ",microtime());

        return sprintf(
            '%08s-%08s-%04s-%04x%04x',
            clientIPToHex(),
            substr("00000000".dechex($t[1]),-8),   // get 8HEX of unixtime
            substr("0000".dechex(round($t[0]*65536)),-4), // get 4HEX of microtime
            mt_rand(0,0xffff),
            mt_rand(0,0xffff)
        );
    }

    // Decode an uuid
    function uuidDecode($uuid) {
        $rez = Array();
        $u   = explode("-", $uuid);

        if(is_array($u) && count($u) == 4) {
            $rez = Array(
                // 'ID'       => $u[0],
                'ip'       => clientIPFromHex($u[0]),
                'unixtime' => hexdec($u[1]),
                'micro'    => (hexdec($u[2])/65536)
            );
        }

        return $rez;
    }

    // Convert the clients ip adress to an hex string
    function clientIPToHex($ip = "") {
        $hex = "";

        if($ip == "") {
            $ip = getEnv("REMOTE_ADDR");
        }

        $part = explode('.', $ip);

        for($i = 0; $i <= count($part) - 1; $i++) {
            $hex .= substr("0".dechex($part[$i]),-2);
        }

        return $hex;
    }

    // Get the clients ip based on a hex string
    function clientIPFromHex($hex) {
        $ip = "";

        if(strlen($hex) == 8) {
            $ip .= hexdec(substr($hex,0,2)).".";
            $ip .= hexdec(substr($hex,2,2)).".";
            $ip .= hexdec(substr($hex,4,2)).".";
            $ip .= hexdec(substr($hex,6,2));
        }

        return $ip;
    }

?>
