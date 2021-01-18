var express = require('express');
var router = express.Router();
var api = require('../api/weather_api')

router.post('/weather', async (req, res) => {
    console.log(req.body.latitude)
    var latitude = req.body.latitude
    var longitude = req.body.longitude

    //if (data.status == 200) {
    //    res.send({'data' : data, 'Status' : '200'})
    //}
    var data = await api.getCurrent(latitude, longitude)
    
    res.status(200).send({'data': data})
    }
);

router.post('/wforecast', async (req, res) => {
    console.log(req.body.latitude)
    var latitude = req.body.latitude
    var longitude = req.body.longitude

    //if (data.status == 200) {
    //    res.send({'data' : data, 'Status' : '200'})
    //}
    var data = await api.getForecast(latitude, longitude)
    
    res.status(200).send({'data': data})
    }
);

module.exports = router;