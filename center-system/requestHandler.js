const { VALID_ACTIONS, MESSAGE_TYPE } = require('./ocpp');
const authorize = require('../ocpp/authorize');


const requestHandler = (
  messageFromUI,
  wsUI
) => {
  const [type, stationId, action, payloadFromStation] = messageFromUI;  // e.g. StartTransaction
  const messageType = MESSAGE_TYPE[type];  // client to server
  const payload = getPayload(messageFromUI);
  const req = [messageType, action, payload];
  console.log(req);
  const isValidAction = VALID_ACTIONS.includes(action);
  let isAuthorized = true;
  const isValidPayload = true; // TODO: add validator
  const isValidRequest = isValidAction && isValidPayload;

  if (action === 'Authorize') {
    const { idTag } = payloadFromStation;
    // check if `idTag` is valid in local authorization cache and list
    // ===== todo
    // isAuthorized = authorize({ idTag });
    if (isAuthorized && isValidAction) {
      console.log('Already authorized');
      wsUI.send(JSON.stringify([3, `${action}Conf`, isAuthorized]));
    } else if (!isAuthorized && isValidAction) {
      // need to contact server for authorization
    } else {
      console.log('Not authorized or invalid id tag');
    }
  } else {
    if (isValidRequest) {
      const res = [3, action, payload];
      sendMessage(wsUI, res, () => { });
    } else {
      console.log('Invalid action or payload');
    }
  }
};

/**
* Send message to the OCPP server
* 
* @param {object} wsClient websocket
* @param {array} req message to server
* @param {function} addToQueue add outbound message pending response to queue
* @param {function} addLog add request to log
* @param {function} cb callback after successful request
*/
function sendMessage(wsClient, req, cb) {
  // send to OCPP server
  wsClient.send(JSON.stringify(req), () => {
    console.log('Message sent: ' + JSON.stringify(req));
    cb();
  });
}

/**
* Prepare payload for OCPP message.
* For complete message definitions, see section 4, Operations Initiated
* by Charge Point, in the specs.
* 
* @param {number} stationId station id
* @param {array} param1 partial ocpp message
* @param {object} extras additional data needed for complete message
*/
function getPayload([type, stationId, action, payloadFromStation], extras) {
  let payload = {}, timestamp;
  switch (action) {
    case 'Authorize':
      payload = { ...payloadFromStation };
      break;
    case 'BootNotification':
      payload = { stationId, ...payloadFromStation };
      break;
    case 'DataTransfer':
      // mockup
      let vendorId = 'E8EAFB';
      let data = 'mock data';
      payload = { vendorId, data, ...payloadFromStation };
      break;
    case 'DiagnosticsStatusNotification':
      // mockup
      payload = { status: 'Idle' };
      break;
    case 'FirmwareStatusNotification':
      // mockup
      payload = { status: 'Idle' };
      break;
    case 'Heartbeat':
      payload = { status: true };
      break;
    case 'MeterValues': {
      // mockup
      let connectorId = 1;
      let meterValue = [{
        timestamp: new Date().toISOString(),
        sampledValue: [
          { value: '10', measurand: 'Energy.Active.Import.Register', unit: 'kWh' },
          //{ value: '18', measurand: 'Temperature', unit: 'Celcius' },
          { value: '356', measurand: 'Voltage', unit: 'V' }
        ]
      }];
      payload = { connectorId, meterValue };
    }
      break;
    case 'StartTransaction':
      timestamp = new Date().toISOString();
      // always set `meterStart` to 0 for simplicity
      payload = { meterStart: 0, timestamp, ...payloadFromStation };
      break;
    case 'StatusNotification': {
      timestamp = new Date().toISOString();      
      payload = {
        connectorId: payloadFromStation.connectorId,
        status: payloadFromStation.status,
        errorCode: payloadFromStation.errorCode,
        info: payloadFromStation.info,
        timestamp,
        vendorId: payloadFromStation.vendorId,
        vendorErrorCode: payloadFromStation.vendorErrorCode,
      };
    }
      break;
    case 'StopTransaction':
      timestamp = new Date().toISOString();
      payload = {
        meterStop: parseInt(payloadFromStation.meterStop),
        timestamp,
        transactionId: payloadFromStation.transactionId,
        idTag: payloadFromStation.idTag,
        reason: payloadFromStation.reason
      };
      break;
    default:
      console.log(`${action} not supported`);
  }

  // some info from the station, some from the ocpp client
  return payload;
}

module.exports = requestHandler;