var http = require("http");
const fetch = require('node-fetch');
const { response } = require('express');

async function getCurrent(latitude, longitude) {
    var options = {
        'method': 'POST',
        'headers': {
        },
    };
    let res = await fetch('http://api.weatherapi.com/v1/current.json?key=b65e5b6c07f842c9be7131702202311&q=' + latitude + ',' + longitude, options)
    let json = await res.json()
    return (json)
  }

async function getForecast(latitude, longitude) {
    var options = {
        'method': 'POST',
        'headers': {
        },
    };
    let res = await fetch('http://api.weatherapi.com/v1/forecast.json?key=b65e5b6c07f842c9be7131702202311&q=' + latitude + ',' + longitude, options)
    let json = await res.json()
    return (json.forecast)
  }

exports.getCurrent = getCurrent
exports.getForecast = getForecast
