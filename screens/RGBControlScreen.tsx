import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { Layout, Text, Button, Input } from "@ui-kitten/components";
import shallow from "zustand/shallow";
import { useDevicesStore } from "../bluetooth/BluetoothManager";
import { isDeviceSupported, sendCommandTo } from "../bluetooth/BluetoothDevice";
import ColorPicker from "../components/picker";

export default function RGBControlScreen() {
  const [isConnected, device] = useDevicesStore(
    (state) => [state.connectedDevice != null, state.connectedDevice],
    shallow
  );

  const [command, setCommand] = useState("");

  const sendCommand = async () => {
    if (await isDeviceSupported(device)) {
      await sendCommandTo(device, command);
    }

    setCommand("");
  };

  const sendRgb = async ({ rgb: any }) => {
    if (isConnected && (await isDeviceSupported(device))) {
      const { r, g, b } = rgb;
      await sendCommandTo(device, `RGB ${r} ${g} ${b}`);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Layout style={styles.container} level="2">
        {isConnected ? (
          <Text status="success" category="s2">
            Connected to {device.name ?? "[sem nome]"}
          </Text>
        ) : (
          <Text status="danger" category="s2">
            Conecte um dispositivo bluetooth para continuar!
          </Text>
        )}
        <ColorPicker onColorChange={sendRgb} />

        <Layout level="3" style={styles.formGroup}>
          <Input
            style={styles.input}
            placeholder="Insira o comando"
            // value={command}
            onChangeText={setCommand}
            onSubmitEditing={sendCommand}
            disabled={!isConnected}
          />
          <Button
            size="small"
            style={{ margin: 3 }}
            onPress={sendCommand}
            disabled={!isConnected}
          >
            Enviar
          </Button>
        </Layout>
      </Layout>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "column",
  },
  formGroup: {
    flexDirection: "row",
  },
  input: {
    flex: 1,
    margin: 2,
  },
});
