# OCPP-1.6-Chargebox-Simulator
OCPP: Open Charge Point Protocol
   
OCPP comes in 4 versions (1.2, 1.5, 1.6 and 2.0), two transport variants (SOAP/XML aka OCPP-S and WebSocket/JSON aka OCPP-J), and two roles ("Charge Point" and "Central System"). bản 1.5 trở lên thì hỗ trợ dùng JSON-over-WebSocket  và từ 2.0 thì k còn hỗ trợ SOAP/XML

https://www.ampcontrol.io/post/how-to-send-ev-charging-profiles-to-your-open-charge-point-protocol-ocpp-charging-station
https://medium.com/@yigitpirildak/an-overview-of-ocpp-open-charge-point-protocol-890bab8909e2

1. Core Profile
Core profile includes all the messages required to make use of the basic functionality of the OCPP. Core profile includes following messages:

- Authorize —CP → CS. Used to check the authorization status of an idTag. IdTag is basically a user identifier to start/stop charge sessions.
- BootNotification —CP → CS. Sent when the CP boots up, contains information about the charging station such as firmware version, IMSI/ICCID values, Vendor/Model/SerialNumber information etc.
- ChangeAvailability — CS → CP. Used to change the CP’s availability to OPERATIVE or INOPERATIVE.
- ChangeConfiguration —CS → CP. CP has a bunch of configuration items defined by the OCPP (They may also be extended by the vendor). This message is used to change these configurations if they’re not readonly.
- ClearCache — Initiated by the CS to clear Authorization Cache.
- DataTransfer — Allows custom messages to be sent. Vendor specific commands are usually implemented using this message. It’s the only two-way message in the protocol, which means it can be initiated by both sides.
- GetConfiguration — CS → CP. Just like ChangeConfigurations, this message is used to read the contents of the configuration items. If there are vendor-specific configurations, they may also be included in the response of this message.
- Heartbeat — CP → CS. It is used to inform that CP is still alive. It’s response contains the current time which means this message is used to sync time between Central Station and CP as well. Heartbeat is used as a custom ping-pong since - WebSocket’s ping pong is not implemented by some CP vendors.
- MeterValues —CP → CS. It informs the Central Station about the charging status. It may also be used to detect energy leaks between charge sessions. While this is a transactional message it can still be sent without a transaction (Can either be triggered or through ClockAligned Meter Values).
- RemoteStartTransaction — CS → CP. Used to start a transaction remotely.
- RemoteStopTransaction — CS → CP. Used to end a transaction remotely.
- Reset — CS → CP. Used to reboot the CP. It has two options, Soft and Hard reset.
- StartTransaction —CP → CS. This message is sent at the start of a transaction(charge session) to inform the Central Station. Response to this message includes a transaction id which is used with the rest of the transactional messages.
- StatusNotification —CP → CS. Informs the Central Station about the current status of the CP. Currently there are 9 Statuses: AVAILABLE, PREPARING, CHARGING, SUSPENDEDEV, SUSPENDEDEVSE, FINISHING, RESERVED, UNAVAILABLE, FAULTED.
- StopTransaction —CP → CS. This message is sent at the end of a transaction to inform the Central Station.
- UnlockConnector — CS → CP. It is used to unlock the connector of a CP remotely, ending the charge session in the process.

2. Firmware Management Profile
This profile is about updating the firmware of the CP and getting diagnostics logs when required. There are 4 messages related to Firmware Management:

- UpdateFirmware — CS → CP. This is the actual message to perform a software upgrade on CP. It contains a link to the firmware file’s location (Usually ftp, since it’s recommended by the specification but http/https may also be used) and a date to indicate when this upgrade package should be downloaded. It also contains some optional fields such as retry count in case download attempt fails for some reason, and a retryInterval to indicate how long the CP should wait between each download retry attempt.
- FirmwareStatusNotification — CP → CS. This message is useful for letting the Central Station know about the current update status. It can also be triggered by the Central Station with TriggerMessage.
- GetDiagnostics — CS → CP. Used to retrieve diagnostics logs of the CP. Its fields are similar to UpdateFirmware, the only difference is that this message contains two optional fields called startTime and stopTime to indicate which log interval should be uploaded by the CP. OCPP doesn’t define which logs should be kept, so it’s up to the CP to decide what kind of information is logged. Because of that, log format and contents are vendor-specific and as a result of that they may vary a lot.
- DiagnosticsStatusNotification — CP → CS. This message is basically the same as FirmwareStatusNotification. It indicates the current diagnostics upload status. Same as FirmwareStatusNotification, this message can also be triggered.

3. Local Auth List Management Profile
There are some configurations and features to reduce the message traffic between CS/CP and allow CP to operate when its network connection is lost. Local Authentication List is one of these feature as it’s used to send some of the authorization list from to CP so it can perform authorization without needing the CS. There are 2 messages related to this profile:

- SendLocalList — CS → CP. This message is used to send the authentication list to CP. This message may contain a full list or a partial list that updates the authentication list that is already on the CP. This message contains a version number to keep track of which local list version is installed on the CP.
- GetLocalListVersion — CS → CP. This message queries the local list version set by the SendLocalList.

4. Remote Trigger Profile
There is a single message under this profile called TriggerMessage that is used to trigger a specific message in case it’s needed. TriggerMessage is sent from CS to CP and may be used to trigger the following message:

- BootNotification
- DiagnosticsStatusNotification
- FirmwareStatusNotification
- Heartbeat
- MeterValues
- StatusNotification

Luồng hoạt động: 