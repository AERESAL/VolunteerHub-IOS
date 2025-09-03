import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList } from 'react-native';

const signatures = [
  { id: '1', name: 'Volunteer Agreement' },
  { id: '2', name: 'Parental Consent' },
  { id: '3', name: 'Event Waiver' },
];

export default function SignaturesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Signatures</Text>
        <FlatList
          data={signatures}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowText}>{item.name}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowText: { fontSize: 16 },
});
