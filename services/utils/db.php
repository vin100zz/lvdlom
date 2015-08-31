<?php

class DBAccessor extends SQLite3
{
	private static $_file = "../om.db3";

	function __construct()  {
    $this->open(self::$_file);
  }

  function getDbFile()  {
    return self::$_file;
  }
}

class DBAccess
{  
    // singleton
    private static $_dbAccessor = null;

//=========================================================================     
    private static function getDbAccessor()
    {
    	if(self::$_dbAccessor == null)
    		self::$_dbAccessor = new DBAccessor();
    		
    	return self::$_dbAccessor;
    }
//=========================================================================     
	public static function getDbFile()
	{
		return self::getDbAccessor()->getDbFile();
	}
//=========================================================================
	public static function getLastInsertedLastRow()
	{
		return self::getDbAccessor()->lastInsertRowID();
	}
//=========================================================================
	public static function exec($sqlQuery)
	{
		return self::getDbAccessor()->exec($sqlQuery);
	}
//=========================================================================
	public static function query($sqlQuery)
	{
		$dbResult = self::getDbAccessor()->query($sqlQuery);
		if(!$dbResult) return null;
		
		$result = array();
		while($row = $dbResult->fetchArray(SQLITE3_ASSOC))
		{
			$utf8row = array();
			foreach($row as $key => $val)
			{
				$utf8row[$key] = utf8_encode($val);
			}
			$result[] = $utf8row;
		}
		return $result;
	}
//=========================================================================
	public static function singleRow($sqlQuery)
	{
		$row = self::getDbAccessor()->querySingle($sqlQuery, true);
		$utf8row = array();
		foreach($row as $key => $val)
		{
			$utf8row[$key] = utf8_encode($val);
		}
		return $utf8row;
	}
//=========================================================================
	public static function singleColumn($sqlQuery)
	{
		$dbResult = self::getDbAccessor()->query($sqlQuery);
		if(!$dbResult) return null;
		
		$aReturn = array();
		while($dbRow = $dbResult->fetchArray(SQLITE3_NUM))
		{
			$aReturn[] = utf8_encode($dbRow[0]);
		}
		return $aReturn;
	}
//=========================================================================
	public static function singleValue($sqlQuery)
	{
		return utf8_encode(self::getDbAccessor()->querySingle($sqlQuery, false));
	}
//=========================================================================
	public static function keyVal($sqlQuery)
	{
		$dbResult = self::getDbAccessor()->query($sqlQuery);
		if(!$dbResult) return null;
		
		$aReturn = array();
		while($dbRow = $dbResult->fetchArray(SQLITE3_NUM))
		{
			$aReturn[$dbRow[0]] = utf8_encode($dbRow[1]);
		}
		return $aReturn;
	}
}

?>