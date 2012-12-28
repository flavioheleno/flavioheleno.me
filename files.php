<?php

	$response = array(
		'status' => true,
		'files' => array(
			'home',
			'experience',
			'work',
			'contact',
			'about'
		)
	);
	echo json_encode($response);
