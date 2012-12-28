<?php

	$file = "{$_SERVER['QUERY_STRING']}.content";
	$file = filter_var($file, FILTER_SANITIZE_STRING, FILTER_FLAG_STRIP_LOW | FILTER_FLAG_STRIP_HIGH);
	
	if (file_exists($file)) {
		$arr = file($file, FILE_IGNORE_NEW_LINES);
		$response = array(
			'status' => true,
			'content' => $arr
		);
	} else
		$response = array(
			'status' => false
		);
	echo json_encode($response);
