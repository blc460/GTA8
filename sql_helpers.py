def read_sql(sql, dbname, port, user, password, host ):
    """execute sql query on database and return results"""
    """aufrufen mit data = read_sql(sql_string, **db_credentials)"""

    conn = psycopg2.connect(dbname=dbname, port=port, user=user, password=password, host=host)
    cur = conn.cursor()
    
    cur.execute(sql)
    conn.commit()

    #get results and clean up
    results = cur.fetchall()
    conn.close()
    return results

def write_sql(sql, dbname, port, user, password, host ):
    ###
    return 0

db_credentials = {"dbname": 'gta',
                  "port": 5432,
                  "user": 'gta_p8',
                  "password": 'r7sdkfdq',
                  "host": 'ikgpgis.ethz.ch'}
