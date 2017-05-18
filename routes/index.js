var express = require('express'); // require Express
var router = express.Router(); // setup usage of the Express router engine
//var config = require('config');

var pg = require("pg"); // require Postgres module

// Setup connection
// connection string  with special character handling in user and password

var conString = process.env.POSTGRESQLCONNSTR_DefaultConnection;


/* GET home page. */
router.get('/', function (req, res) {
    res.render('dayplanner', { title: 'Express' });
});

router.put('/insert_data', (req, res, next) => {
    const results = [];
    // Get a Postgres client from the connection pool
    pg.connect(conString, (err, client, done) => {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err });
        }
        var str = "INSERT INTO engagements(loc_name, title, date, start_time, end_time, location) VALUES ('" + req.body.loc_name + "', '" + req.body.title + "', '" + req.body.meeting_date + "', '" + req.body.start_time + "', '" + req.body.end_time + "', ST_GeographyFromText('point(" + req.body.long + " " + req.body.lat + ")'));";
        var query = client.query(str);
        // Stream results back one row at a time
        console.log(results);
        query.on('row', (row) => {
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', () => {
            done();
            return res.json(results);
        });
    });

});


router.get('/api/v1/GetMeetingData', (req, res, next) => {
    const results = [];
    const table_result = [];
    const meeting_date = req.query.meeting_date;

    // Get a Postgres client from the connection pool
    pg.connect(conString, (err, client, done) => {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err });
        }


        //verifying request data for sql injection
        if (meeting_date.indexOf("--") > -1 || meeting_date.indexOf("'") > -1 || meeting_date.indexOf(";") > -1 || meeting_date.indexOf("/*") > -1 || meeting_date.indexOf("xp_") > -1) {
            console.log("Bad request detected");
            return res.status(500).json({ success: false, data: "Bad request detected" });
        }

        //query to check if table does not exist, so that a table with sample data can be created
        const tableExistsQuery = client.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'engagements');");

        // Stream results back one row at a time
        tableExistsQuery.on('row', (row) => {
            table_result.push(row);
        });

        // After all data is returned, close connection and return results
        tableExistsQuery.on('end', () => {
            //done();

            //verifying if table exists to retrieve data directly for meeting date
            if (table_result[0].exists == true) {
                const meetingDataQuery = client.query("select array_to_json(array_agg(row_to_json(t))) as meeting_data from (select loc_id, loc_name, title, date, to_char(start_time::time, 'HH12:MI AM') as start, to_char(end_time::time, 'HH12:MI AM') as end, ST_AsGeoJSON(location)::json As geometry from engagements where date = $1 ORDER BY start_time ) as t;", [meeting_date]);

                meetingDataQuery.on('row', (row) => {
                    results.push(row);
                });

                meetingDataQuery.on('end', (row) => {
                    done();
                    return res.json(results[0].meeting_data);
                });

            }
            else {
                createTableAndSampleData(res, client, done, meeting_date);
            }

        });
    });
});


function createTableAndSampleData(res, client, done, meeting_date) {
    const results = [];
    const query = "CREATE EXTENSION postgis SCHEMA public VERSION '2.3.2';\
                   CREATE TABLE engagements ( \
                            loc_id integer NOT NULL, \
                            loc_name character varying(255), \
                            title character varying(255), \
                            date date, \
                            start_time time without time zone, \
                            end_time time without time zone, \
                            location geography(Point)); \
                            ALTER TABLE public.engagements OWNER TO postgres; \
                            CREATE SEQUENCE engagements_loc_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1; \
                            ALTER TABLE public.engagements_loc_id_seq OWNER TO postgres; \
                            ALTER SEQUENCE engagements_loc_id_seq OWNED BY engagements.loc_id; \
                            ALTER TABLE ONLY engagements ALTER COLUMN loc_id SET DEFAULT nextval('engagements_loc_id_seq'::regclass); \
                            ALTER TABLE ONLY engagements ADD CONSTRAINT engagements_pkey PRIMARY KEY (loc_id); \
                            INSERT INTO engagements(loc_name, title, date, start_time, end_time, location) VALUES\
                            ('Redmond, WA, USA', 'First Engagement', CURRENT_DATE, '10:00 AM', '11:00 AM', ST_GeographyFromText('point(-122.095741 47.676295)')),\
                            ('Seattle, WA, USA', 'Second Engagement', CURRENT_DATE, '1:00 PM', '2:00 PM', ST_GeographyFromText('point(-122.329064 47.592306)')),\
                            ('Bellevue, WA, USA', 'Third Engagement', CURRENT_DATE, '3:00 PM', '4:00 PM', ST_GeographyFromText('point(-122.201489 47.610139)')),\
                            ('Renton, WA, USA', 'Fourth Engagement', CURRENT_DATE, '5:30 PM', '6:00 PM', ST_GeographyFromText('point(-122.218031 47.471115)')),\
                            ('Tacoma, WA, USA', 'Last Engagement', CURRENT_DATE, '7:00 PM', '8:00 PM', ST_GeographyFromText('point(-122.457853 47.233862)'));";

    const createTableQuery = client.query(query);

    /*queryaction.on('row', (row) => {
        results.push(row);
    });*/

    createTableQuery.on('end', (row) => {

        const meetingDataquery = client.query("select array_to_json(array_agg(row_to_json(t))) as meeting_data from (select loc_id, loc_name, title, date, to_char(start_time::time, 'HH12:MI AM') as start, to_char(end_time::time, 'HH12:MI AM') as end, ST_AsGeoJSON(location)::json As geometry from engagements where date = $1 ORDER BY start_time ) as t;", [meeting_date]);

        meetingDataquery.on('row', (row) => {
            results.push(row);
        });

        meetingDataquery.on('end', (row) => {

            done();
            return res.json(results[0].meeting_data);

        });

    });

}

module.exports = router;