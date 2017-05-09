var express = require('express'); // require Express
var router = express.Router(); // setup usage of the Express router engine
//var config = require('config');

var pg = require("pg"); // require Postgres module

// Setup connection
// connection string  with special character handling in user and password
/*conString = {
    user: config.dayplanner.dbConfig.username,
    password: config.dayplanner.dbConfig.password,
    database: config.d                                                                                                                                                                                                                                                                                                                        ayplanner.dbConfig.dbName,
    port: config.dayplanner.dbConfig.port,
    host: config.dayplanner.dbConfig.host,
    ssl: true
};*/
var conString = "postgres://postgres@postgres-dayplanner:pg%4012345@postgres-dayplanner.database.windows.net:5432/dayplanner";

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
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
        var str = "INSERT INTO engagements(loc_name, title, date, start_time, end_time, location) VALUES ('" + req.body.loc_name + "', '" + req.body.title + "', '" + req.body.meeting_date + "', '" + req.body.start_time + "', '" + req.body.end_time + "', point('" + req.body.lat + "', '" + req.body.long + "'))";
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
    const meeting_date = req.query.meeting_date;

    // Get a Postgres client from the connection pool
    pg.connect(conString, (err, client, done) => {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err });
        }

        // SQL Query > Select Data

        //verifying request data for sql injection
        if (meeting_date.indexOf("--") > -1 || meeting_date.indexOf("'") > -1 || meeting_date.indexOf(";") > -1 || meeting_date.indexOf("/*") > -1 || meeting_date.indexOf("xp_") > -1) {
            console.log("Bad request detected");
            res.redirect('/map');
            return;
        }
        //const query = client.query("select array_to_json(array_agg(row_to_json(t))) as meeting_data from (select loc_id, loc_name, subject, meeting_date, TO_CHAR(start_time, 'HH12:MI AM') start_time, TO_CHAR(end_time, 'HH12:MI AM') end_time, ST_AsGeoJSON(geog)::json As geometry from meeting_details where meeting_date = $1 ORDER BY TO_CHAR(start_time, 'HH12:MI AM') ASC ) as t;", [meeting_date]);
        //const query = client.query("select array_to_json(array_agg(row_to_json(t))) as meeting_data from (select loc_id, loc_name, subject, meeting_date, TO_CHAR(start_time, 'HH12:MI AM') start_time, TO_CHAR(end_time, 'HH12:MI AM') end_time, ST_AsGeoJSON(location)::json As geometry from meeting where meeting_date = $1 ORDER BY TO_CHAR(start_time, 'HH12:MI AM') ASC ) as t;", [meeting_date]);
        const query = client.query("select array_to_json(array_agg(row_to_json(t))) as meeting_data from (select loc_id, loc_name, title, date, to_char(start_time::time, 'HH12:MI AM') as start, to_char(end_time::time, 'HH12:MI AM') as end, location from engagements where date = $1 ORDER BY start_time ) as t;", [meeting_date]);

        // Stream results back one row at a time
        query.on('row', (row) => {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', () => {
            done();
            return res.json(results[0].meeting_data);
        });
    });
});

module.exports = router;