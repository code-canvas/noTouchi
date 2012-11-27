<?php 

session_start();

/*

The validation can be anything you want. Default validation is as follows:
	
	-take the first number
	-multiply the last number by 100

	for instance if the support code was 2708 the key should be 2800

	-2 is the first number
	-8 x 100 = 800

*/

//how long to allow for access without re-validating
//default value is 300 (5 minutes)
$session_time = 10;

//set authentication to false
$good = false;

//check to see if this user has a valid session
if ( isset($_SESSION['noTouchi_cookie_timestamp']) ) {
	
	//we have a session
	//check when the last user activity was recorded
	$noTouchi_cookie_timestamp_now = date_create();
	$noTouchi_cookie_timestamp_now =  date_timestamp_get($noTouchi_cookie_timestamp_now);

	//look at last session timestamp
	$noTouchi_cookie_timestamp = $_SESSION['noTouchi_cookie_timestamp'];

	//get the last time there was activity on this session
	$lastActivity = $noTouchi_cookie_timestamp_now - $noTouchi_cookie_timestamp;

	//if last activity on this session is more than 300 seconds OR 5 minutes ago... we'll need to validate the request
	if (   $lastActivity > $session_time   ) {
		
		//the user needs to validate another code/key

		//remove the session
		unset($_SESSION['noTouchi_cookie_timestamp']);

		$good = false;

	} else {

		$good = true;
	}

} else {

	//no valid session
	//validate code/key

	$good = false;

}

//do we need to validate?
if ( $good == false ) {
	
	$supportKey = trim( $_POST['supportKey'] );
	$supportCode = trim( $_POST['supportCode'] );

	if ( !is_numeric($supportKey) ) {
		die('{"noTouchi_error" : "true", "response" : "That is incorrect"}');
	}

	if ( !is_numeric($supportCode) ) {
		die('{"noTouchi_error" : "true", "response" : "No code received"}');
	}

	//test for a valid key
	$f = substr($supportCode, 0, 1);
	$l = substr($supportCode, -1);
  	
	//get the last number
	$l = intval($l) * 100;

	// zero support
	if ($l == 0) {
		$l = "000";
	}

	//build the key to validate
	$key = $f . $l;

	if ($supportKey == $key) {
		$good = true;
	}
}

//check to see if we have a validation
if ( $good == true ) {
	
	//create the inital timestamp
	$touchi_cookie_timestamp = date_create();
	$_SESSION['noTouchi_cookie_timestamp'] =  date_timestamp_get($touchi_cookie_timestamp);

} else {

	die('{"noTouchi_error" : "true", "response" : "That was incorrect."}');
}

?>