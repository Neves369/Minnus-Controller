import React from "react";
import { StyleSheet, View } from "react-native";
import {
  BluetoothManager,
  connect,
  disconnect,
  doDeviceScan,
  stopScanning,
  useDevicesStore,
} from "../bluetooth/BluetoothManager";
import { DeviceList } from "../components/DeviceList";
import { Layout, Text, Button, Card } from "@ui-kitten/components";
import { isDeviceSupported } from "../bluetooth/BluetoothDevice";
import { RootTabScreenProps } from "../types";

export default function BluetoothScreen({
  navigation,
}: RootTabScreenProps<"BluetoothScreen">) {
  React.useEffect(() => {
    BluetoothManager.onStateChange((state: any) => {
      console.log("Outer state", state);
      const subscription = BluetoothManager.onStateChange((state: any) => {
        console.log("Inner state", state);
        if (state === "PoweredOn") {
          console.log("BT Power ON");
          doDeviceScan();
          subscription.remove();
        }
      }, true);
      return () => subscription.remove();
    });
  }, [BluetoothManager]);

  React.useEffect(() => {
    BluetoothManager.state().then((state: any) => {
      if (state === "PoweredOn") {
        doDeviceScan();
      }
    });

    return stopScanning;
  }, []);

  const store = useDevicesStore((state: any) => state);

  const [isSupported, setSupported] = React.useState(false);
  React.useEffect(() => {
    isDeviceSupported(store.connectedDevice).then(setSupported);
  }, [store.connectedDevice]);

  return (
    <Layout style={styles.container} level="2">
      <DeviceList
        devices={Object.values(store.devices)}
        isScanning={store.isScanning}
        onScanRefresh={doDeviceScan}
        onConnectClick={(id) => connect(store.devices[id])}
        connectedDeviceId={store.connectedDevice?.id ?? null}
      />

      <Card style={styles.card} header={CardHeader} footer={CardFooter}>
        <Text
          status={
            store.connectedDevice
              ? isSupported
                ? "successo"
                : "atenção"
              : "info"
          }
        >
          {store.connectedDevice
            ? `Este dispositivo ${
                isSupported ? "" : "não "
              } é sportado por este app`
            : "Conecte um dispositivo para mais informações"}
        </Text>
      </Card>
    </Layout>
  );
}

const CardHeader = (props: any) => {
  const dev = useDevicesStore((state: any) => state.connectedDevice);
  return (
    <View {...props}>
      <Text category="h6">{dev?.name || "Não conectado"}</Text>
      <Text category="s1">{dev?.id}</Text>
    </View>
  );
};

const CardFooter = (props: any) => {
  const dev = useDevicesStore((state: any) => state.connectedDevice);
  return (
    <View {...props} style={[props.style, styles.footerContainer]}>
      <Button
        style={styles.footerControl}
        size="small"
        disabled={dev == null}
        onPress={disconnect}
      >
        DESCONECTAR
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  card: {
    // flex: 1,
    margin: 5,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  footerControl: {
    marginHorizontal: 2,
  },
});
