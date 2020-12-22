<?php
$a = 123;
echo file_put_contents("error.log", "a is : " . $a . PHP_EOL, FILE_APPEND);
?>
