#!/opt/node-v16.17.1/bin/node
require('dotenv').config();
const moment = require('moment');
const { BoappaApi } = require('./lib/api');

const DEBUG = process.env.DEBUG;

function log(...params) {
  if (DEBUG) console.log(...params);
}

function write(...params) {
  console.log(...params);
}

const args = process.argv.slice(2);
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const API = process.env.API;
const FACILITY_ID = args[0] || process.env.FACILITY_ID;

log('api: ', API);
log('email: ', EMAIL);
log('FACILITY_ID: ', FACILITY_ID);

if (!FACILITY_ID) {
  write("Invalid FACILITY_ID: ", FACILITY_ID);
  return;
}

async function run() {
  const api = new BoappaApi(EMAIL, PASSWORD, API);

  await api.login();
  log('Logged in successfully');

  let facility = await api.getFacility(FACILITY_ID);
  let endDate = facility.bookingAvailability.find(x => x.endDate !== undefined).endDate;
  log('Current endDate', endDate);

  const newDate = moment().add(1, 'year').format();
  await api.patchFacility(FACILITY_ID, { "bookingAvailability": { "startDate": null, "endDate": newDate } });

  facility = await api.getFacility(FACILITY_ID);
  endDate = facility.bookingAvailability.find(x => x.endDate !== undefined).endDate;
  log('Updated endDate', endDate);

  write(endDate);
  write('');
}

run().catch(console.error);