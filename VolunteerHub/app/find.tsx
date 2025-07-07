import { Text, View, StyleSheet, useColorScheme } from "react-native";

export default function FindScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>Find Opportunities</Text>
      <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>Discover volunteer opportunities near you</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  containerDark: {
    backgroundColor: "#1C1C1E",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  titleDark: {
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  subtitleDark: {
    color: "#A1A1A6",
  },
});
