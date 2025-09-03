import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  const handleSignOut = () => {
    // TODO: clear auth tokens and user state
    router.replace('/welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Change password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Manage connected accounts</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Privacy</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowText: { fontSize: 16, color: '#333' },
  signOut: { marginTop: 30, backgroundColor: '#ff4d4f', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  signOutText: { color: '#fff', fontWeight: '600' },
});
