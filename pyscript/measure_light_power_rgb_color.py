import psycopg2


@service
def measure_power_consumption_rgb(delay_time_secs=25, entity_id=None, powermeter=None, manufacturer=None, bulb=None):
    for bri in range(1, 256, 10):
        for hue in range(0, 361, 10):
            for sat in range(0, 101, 10):
                # 1.Set specified Bulb to current bri,r,g,b values
                light.turn_on(
                    entity_id=entity_id,
                    brightness=bri, hs_color=[hue, sat],
                )
                # 2.Wait 30 Seconds to get correct power values
                task.sleep(delay_time_secs)
                # 3.Read power values
                w = float(state.get(powermeter))
                log.info(
                    f'The power consumption for brightness {bri}, hue {hue} and saturation {sat} is {w} watt',
                )
                # 4.Write power values with bri and m values to csv
                try:
                    connection = psycopg2.connect(
                        user='simon', password='cmonmpw1', host='192.168.178.3', port='5442', database='ha_sensordata',
                    )
                    cursor = connection.cursor()
                    # YOU HAVE TO CREATE THE TABLE MANUALLY BEFORE YOU TRY TO INSERT SOME VALUES!
                    # CREATE TABLE bulb_powermeasures (manufacturer CHAR, bulb CHAR, bri INTEGER, r INTEGER, g INTEGER, b INTEGER);
                    postgres_insert_query = """ INSERT INTO bulb_powermeasures (manufacturer, bulb, bri, r, g, b, mired, watt, hue, sat) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
                    record_to_insert = (
                        manufacturer, bulb, bri, None, None, None, None, w, hue, sat,
                    )
                    cursor.execute(postgres_insert_query, record_to_insert)

                    connection.commit()
                    count = cursor.rowcount
                    log.info(
                        f'{count} Record(s) inserted successfully into bulb_powermeasures table',
                    )

                except (Exception, psycopg2.Error) as error:
                    log.info(
                        f'Failed to insert record into bulb_powermeasures table: {error}',
                    )

                finally:
                    # closing database connection.
                    if connection:
                        cursor.close()
                        connection.close()
                        log.info('PostgreSQL connection is closed')
