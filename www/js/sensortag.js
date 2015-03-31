var accelerom = {
    // accelerometer
    service: "F000AA10-0451-4000-B000-000000000000", //
    data: "F000AA11-0451-4000-B000-000000000000", // read/notify 3 bytes X : Y : Z
    configuration: "F000AA12-0451-4000-B000-000000000000", // read/write 1 byte
    period: "F000AA13-0451-4000-B000-000000000000" // read/write 1 byte Period = [Input*10]ms
};

var gyro = {
    service: "F000AA50-0451-4000-B000-000000000000", //
    data: "F000AA51-0451-4000-B000-000000000000", // read/notify 3 bytes X : Y : Z
    configuration: "F000AA52-0451-4000-B000-000000000000", // read/write 1 byte
    period: "F000AA13-0453-4000-B000-000000000000" // read/write 1 byte Period = [Input*10]ms
}

var button = {
    // service: "FFE0",
    // data: "FFE1", // Bit 2: side key, Bit 1- right key, Bit 0 –left key
    service: "FFE0",
    data: "FFE1"
};

var peripheralId = null;

function onPageLoad() {
    alert('page loaded!');

    document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
    ble.scan([], 5, scanSuccess, scanFailure);
    // alert('scanning')
}

function scanSuccess(peripheral) {
    // my sensortag id = 4CBB55B7-1EE6-B45F-2DB9-76D37B464325
    // console.log(peripheral.name + ' ' + peripheral.id);

    if (peripheral.id === '4CBB55B7-1EE6-B45F-2DB9-76D37B464325') {
    // if (String(peripheral.name).match(/sensor/i)) {
        // ble.stopScan(stopScanSuccess, stopScanFailure);
        console.log('id: ' + peripheral.id);
        console.log('name: ' + peripheral.name);

        // console.log("Connecting");
        ble.connect(peripheral.id, connectSuccess, connectFailure);
    }
}

function scanFailure(err) {
    console.log(err);
}

function stopScanSuccess() {
    console.log("Stop Scan Success");
}

function stopScanFailure() {
    console.log("Stop Scan Failure");
}

function connectSuccess(peripheral) {
    console.log("Connected");
    console.log(peripheral);
    
    peripheralId = peripheral.id;
    //console.log(foundPeripheral);

    // Turn it on
    var configData = new Uint8Array(1);
    configData[0] = 0x07; //7 to enable x y and z
    ble.write(peripheral.id, gyro.service, gyro.configuration, configData.buffer, 

        function() { console.log("Started gyro."); },function() { console.log("Start gyro error");}
    );

    // We want to be notified
    ble.startNotification(peripheral.id, gyro.service, gyro.data, gyroSuccess, notifyError);

    ble.startNotification(peripheral.id, button.service, button.data, onButtonData, notifyError);

}

function connectFailure() {
    console.log("Connection Failed");
}


// function accelSuccess(data) {
//     // console.log(data)
//     var a = new Uint8Array(data);

//     var message = "X: " + a[0]/64 + "<br/>" +
//               "Y: " + a[1]/64 + "<br/>" +
//               "Z: " + a[2]/64 * -1;
//     console.log(message);
//     tweakFilter(a[0]/64, a[1]/64, a[2]/64);
//     // document.body.innerHTML = message;
// }

function gyroSuccess(data) {
    var a = new Uint8Array(data);
    console.log(a);
    var message = "X: " + a[0]/64 + "<br/>" +
              "Y: " + a[2]/64 + "<br/>" +
              "Z: " + a[4]/64 * -1;
    // console.log(message);
    tweakFilter(a[0]/64, a[2]/64, a[4]/64);
    // document.body.innerHTML = message;
}

function notifyError(err) {
    console.log(err);
}

function onButtonData(data) {
    var message;
    var a = new Uint8Array(data);
    switch(a[0]) { // should really check the bits in case bit 3 is set too
    case 0:
        message = "No buttons are pressed";
        triggerNoiseRelease();
        triggerOscRelease();
        break;
    case 1:
        message = "Right button is pressed";
        triggerNoiseAttack();
        break;
    case 2:
        message = "Left button is pressed";
        triggerOscAttack();
        break;
    case 3:
        message = "Both buttons are pressed";
        break;
    default:
        message = "Error";
    }
    console.log(message);
}