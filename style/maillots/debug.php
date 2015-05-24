<html>
<body style="background:#ffcccc;">

-------------

<?php 

//include_once '../../maillot.php';


$colors = array("FFFFFF", "000000", "FF0000", "00FF00", "0000FF", "FFFF00", "FF00FF", "00FFFF", "888888", "FF5000");
for($i=1; $i<53; ++$i)
{
	$col1 = "FFFFFF"; //$colors[rand(0, count($colors)-1)];
	$col2 = "46A0EC"; //$colors[rand(0, count($colors)-1)];
	$col3 = "FFFFFF"; //$colors[rand(0, count($colors)-1)];

	print $i . ": <img src='../../maillot.php?template=$i&col1=$col1&col2=$col2&col3=$col3&rtl=true' width='100px' /> ------------- ";
}

/*
$imageFile = "21.png"; 
$myImage = ImageCreateFromPNG($imageFile);

print_r(rgb2tsl(0,255,31));
print_r(rgb2tsl(0,103,255));

print "<table>";
for($i=0; $i<255; ++$i) 
{ 
	$col = tsl2rgb($i/255, 1, 0.5);
	print "<tr><td style='background:RGB(" . $col["red"] . "," . $col["green"] . "," . $col["blue"] . ")'>";
	print_r($col);
	print_r(rgb2tsl($col['red'], $col['green'], $col['blue']));
	print "</td></tr>";
}
      print "</table>";
      

print "<table>";
for($i=0;$i<imagecolorstotal($myImage);++$i) 
{ 
	$col = ImageColorsForIndex($myImage,$i); 
	
	print "<tr><td style='background:RGB(" . $col["red"] . "," . $col["green"] . "," . $col["blue"] . ")'>";
	print_r($col);
	print_r(rgb2tsl($col['red'], $col['green'], $col['blue']));
	print "</td></tr>";
}
      print "</table>";
      */
      
?>



</body>
</html>