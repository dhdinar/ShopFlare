import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ShopFlareColors } from '@/constants/theme';

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    q: 'How do I track my order?',
    a: 'Go to the Orders tab to see the status of your orders. You will also receive notifications for every status update.',
  },
  {
    q: 'How do I cancel an order?',
    a: 'You can request a cancellation from the Orders tab within 1 hour of placing the order. After that, contact our support team.',
  },
  {
    q: 'Can I return a product?',
    a: 'Yes, we have a 30-day return policy. The item must be unused and in original packaging. Contact support to initiate a return.',
  },
  {
    q: 'How do I change my delivery address?',
    a: 'Go to Profile → My Addresses to manage your delivery addresses. You can update before an order is dispatched.',
  },
  {
    q: 'Why is my payment failing?',
    a: "Check that your card details are correct and your bank hasn't blocked the transaction. Try a different payment method or contact your bank.",
  },
  {
    q: 'How do I contact a brand/seller?',
    a: 'Open any product and tap the Chat icon to send a message directly to the brand.',
  },
  {
    q: 'How do I write a review?',
    a: "Open a product you've purchased and scroll to the Reviews section. Tap 'Write a Review' to rate and comment.",
  },
  {
    q: 'Are my payment details secure?',
    a: 'Yes, all transactions are encrypted. We never store your full card details on our servers.',
  },
];

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setOpen(!open)}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <ThemedText style={styles.faqQuestion}>{faq.q}</ThemedText>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#999" />
      </View>
      {open && <ThemedText style={styles.faqAnswer}>{faq.a}</ThemedText>}
    </TouchableOpacity>
  );
}

export default function HelpSupportScreen() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Validation', 'Please fill in both subject and message');
      return;
    }
    setSending(true);
    await new Promise(r => setTimeout(r, 1200)); // Simulate API call
    setSending(false);
    Alert.alert('Message Sent', "We've received your message and will get back to you within 24 hours.");
    setSubject('');
    setMessage('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={ShopFlareColors.primary} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Help & Support</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => Linking.openURL('mailto:support@shopflare.com')}
          >
            <View style={styles.quickIcon}>
              <Ionicons name="mail-outline" size={22} color={ShopFlareColors.primary} />
            </View>
            <ThemedText style={styles.quickLabel}>Email Us</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => Linking.openURL('tel:+10000000000')}
          >
            <View style={styles.quickIcon}>
              <Ionicons name="call-outline" size={22} color={ShopFlareColors.primary} />
            </View>
            <ThemedText style={styles.quickLabel}>Call Us</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => Linking.openURL('https://shopflare.com/chat')}
          >
            <View style={styles.quickIcon}>
              <Ionicons name="chatbubble-outline" size={22} color={ShopFlareColors.primary} />
            </View>
            <ThemedText style={styles.quickLabel}>Live Chat</ThemedText>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <ThemedText style={styles.sectionLabel}>Frequently Asked Questions</ThemedText>
        <View style={styles.faqList}>
          {FAQS.map((faq, i) => (
            <React.Fragment key={i}>
              <FAQItem faq={faq} />
              {i < FAQS.length - 1 && <View style={styles.faqDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Contact Form */}
        <ThemedText style={styles.sectionLabel}>Send Us a Message</ThemedText>
        <View style={styles.contactCard}>
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Subject</ThemedText>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="What is your issue about?"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Message</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Describe your issue in detail..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={5}
            />
          </View>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <ThemedText style={styles.sendButtonText}>Send Message</ThemedText>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Ionicons name="time-outline" size={16} color="#888" />
          <ThemedText style={styles.footerText}>
            Support hours: Mon–Fri, 9 AM – 6 PM (EST)
          </ThemedText>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 60 },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: ShopFlareColors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { fontSize: 12, fontWeight: '700', color: ShopFlareColors.primary },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  faqList: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 24,
  },
  faqItem: { padding: 16 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: '600' },
  faqAnswer: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginTop: 10,
  },
  faqDivider: { height: 1, backgroundColor: '#F0F0F0' },
  contactCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 16,
  },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
  sendButton: {
    backgroundColor: ShopFlareColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  sendButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  footerText: { fontSize: 13, color: '#888' },
});
