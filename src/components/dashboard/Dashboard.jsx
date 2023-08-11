import React from 'react';
import {
  Text,
  View,
  Button,
  NativeModules,
  StyleSheet,
  PermissionsAndroid,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    padding: '5%',
    paddingTop: '50%',
  },

  package: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: '10px',
  },

  sensorField: {
    fontSize: 30,
  },

  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
  },

  spacing: {
    padding: '10px',
  },
});

let askForPermissions = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: 'Bluetooth Scan Permission',
        message: 'App needs access to bluetooth scan',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the bluetooth scan');
    } else {
      console.log('Bluetooth scan permission denied');
    }
  } catch (err) {
    console.warn('Error with BLE Permissions = ', err);
  }
};

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      foundDeviceName: 'None',
      deviceBondLevel: 0,
      heartBeatRate: 0,
    };
    askForPermissions();
  }

  searchBluetoothDevices = () => {
    console.log('searchBluetoothDevices');
    console.log(NativeModules);
    console.log(NativeModules.DeviceConnector);
    NativeModules.DeviceConnector.discoverDevices((error, deviceBondLevel) => {
      console.log(deviceBondLevel);
      this.setState({deviceBondLevel: deviceBondLevel});
    });
    setInterval(this.getDeviceBondLevel, 2000);
  };

  getDeviceBondLevel = () => {
    NativeModules.DeviceConnector.getDeviceBondLevel(
      (error, deviceBondLevel) => {
        this.setState({deviceBondLevel: deviceBondLevel}, () => {
          this.getDeviceBondLevel;
        });
      },
    );
  };

  activateHeartRateCalculation = () => {
    NativeModules.HeartBeatMeasurer.startHrCalculation(
      (error, heartBeatRate) => {
        this.setState({heartBeatRate: heartBeatRate});
      },
    );
    setInterval(this.getHeartRate, 2000);
  };

  getHeartRate = () => {
    NativeModules.HeartBeatMeasurer.getHeartRate((error, heartBeatRate) => {
      this.setState({heartBeatRate: heartBeatRate});
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.package}>
          <Text style={styles.sensorField}>Heart Beat:</Text>
          <Text style={styles.sensorField}>
            {this.state.heartBeatRate + ' Bpm'}
          </Text>
        </View>

        <View style={styles.package}>
          <Text style={styles.sensorField}>Device BL:</Text>
          <Text style={styles.sensorField}>
            {this.state.deviceBondLevel.toString()}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={this.searchBluetoothDevices}
            title="Link With MiBand"
          />
          <View style={styles.spacing} />
          <Button
            onPress={this.activateHeartRateCalculation}
            title="Get Heart Rate"
          />
        </View>
      </View>
    );
  }
}
