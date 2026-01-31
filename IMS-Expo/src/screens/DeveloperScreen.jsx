import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const developer = {
  name: 'Nagabhushan Adiga',
  role: 'UI Developer',
  experience: '6 years',
  company: 'Clinisys',
  location: 'Bengaluru, Karnataka, India',
  email: 'nagbhushan.adiga@gmail.com',
  linkedin: 'https://www.linkedin.com/in/nagabhushan-adiga-36a564151/',
  portfolio: 'https://nagabhushanadiga.github.io/nagabhushanadiga/',
  bio: 'UI Developer with 6 years of experience specializing in ReactJS and modern web technologies.',
  skills: ['ReactJS', 'JavaScript', 'Material-UI', 'React Native', 'Redux', 'Git'],
};

export default function DeveloperScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>NA</Text>
        </View>
        <Text style={styles.name}>{developer.name}</Text>
        <Text style={styles.role}>{developer.role}</Text>
        <Text style={styles.exp}>{developer.experience} experience</Text>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.linkBtn} onPress={() => Linking.openURL(developer.linkedin)}>
            <Text style={styles.linkBtnText}>LinkedIn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkBtnOutlined} onPress={() => Linking.openURL(developer.portfolio)}>
            <Text style={styles.linkBtnOutlinedText}>Portfolio</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bio}>{developer.bio}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <Text style={styles.detail}>📍 {developer.location}</Text>
        <Text style={styles.detail}>💼 {developer.role} at {developer.company}</Text>
        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${developer.email}`)}>
          <Text style={[styles.detail, styles.link]}>✉️ {developer.email}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsRow}>
          {developer.skills.map((skill) => (
            <View key={skill} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      <LinearGradient colors={['#11998e', '#38ef7d']} style={styles.contactCard}>
        <Text style={styles.contactTitle}>Let's Connect!</Text>
        <View style={styles.contactBtns}>
          <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(developer.linkedin)}>
            <Text style={styles.contactBtnText}>LinkedIn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(developer.portfolio)}>
            <Text style={styles.contactBtnText}>Portfolio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(`mailto:${developer.email}`)}>
            <Text style={styles.contactBtnText}>Email</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  hero: { padding: 24, borderRadius: 12, marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  name: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  role: { fontSize: 16, color: 'rgba(255,255,255,0.95)', marginTop: 4 },
  exp: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  linkBtn: { backgroundColor: 'rgba(255,255,255,0.25)', padding: 12, borderRadius: 8 },
  linkBtnText: { color: 'white', fontWeight: '600' },
  linkBtnOutlined: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', padding: 12, borderRadius: 8 },
  linkBtnOutlinedText: { color: 'white', fontWeight: '600' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  bio: { color: '#666', lineHeight: 24 },
  detail: { marginBottom: 8, color: '#333' },
  link: { color: '#667eea' },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { backgroundColor: '#667eea', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  skillText: { color: 'white', fontWeight: '600' },
  contactCard: { padding: 24, borderRadius: 12, alignItems: 'center' },
  contactTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 16 },
  contactBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  contactBtn: { backgroundColor: 'rgba(255,255,255,0.25)', padding: 12, borderRadius: 8 },
  contactBtnText: { color: 'white', fontWeight: '600' },
});
