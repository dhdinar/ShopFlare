import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ShopFlareColors } from '@/constants/theme';
import * as profileService from '@/services/profileService';
import { Address, AddressInput } from '@/services/profileService';

const LABEL_ICONS: Record<string, string> = {
  home: 'home-outline',
  work: 'briefcase-outline',
  other: 'location-outline',
};

const EMPTY_FORM: AddressInput = {
  label: 'home',
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  is_default: false,
};

export default function AddressesScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [form, setForm] = useState<AddressInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadAddresses = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const data = await profileService.getAddresses(accessToken);
      setAddresses(data);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const openAdd = () => {
    setEditingAddress(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (addr: Address) => {
    setEditingAddress(addr);
    setForm({
      label: addr.label,
      full_name: addr.full_name,
      phone: addr.phone || '',
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state || '',
      postal_code: addr.postal_code || '',
      country: addr.country,
      is_default: addr.is_default,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!accessToken) return;
    if (!form.full_name.trim() || !form.address_line1.trim() || !form.city.trim()) {
      Alert.alert('Validation', 'Full name, address line 1, and city are required');
      return;
    }
    setSaving(true);
    try {
      if (editingAddress) {
        const updated = await profileService.updateAddress(accessToken, editingAddress.id, form);
        setAddresses(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      } else {
        const created = await profileService.createAddress(accessToken, form);
        setAddresses(prev =>
          form.is_default
            ? [created, ...prev.map(a => ({ ...a, is_default: false }))]
            : [...prev, created]
        );
      }
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (addr: Address) => {
    Alert.alert('Delete Address', `Delete "${addr.address_line1}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!accessToken) return;
          try {
            await profileService.deleteAddress(accessToken, addr.id);
            setAddresses(prev => prev.filter(a => a.id !== addr.id));
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to delete address');
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (addr: Address) => {
    if (!accessToken || addr.is_default) return;
    try {
      await profileService.updateAddress(accessToken, addr.id, { is_default: true });
      setAddresses(prev =>
        prev.map(a => ({ ...a, is_default: a.id === addr.id }))
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to set default');
    }
  };

  const renderAddress = ({ item }: { item: Address }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.labelBadge}>
          <Ionicons name={LABEL_ICONS[item.label] as any} size={16} color={ShopFlareColors.primary} />
          <ThemedText style={styles.labelText}>{item.label.toUpperCase()}</ThemedText>
        </View>
        {item.is_default && (
          <View style={styles.defaultBadge}>
            <ThemedText style={styles.defaultBadgeText}>Default</ThemedText>
          </View>
        )}
      </View>
      <ThemedText style={styles.cardName}>{item.full_name}</ThemedText>
      <ThemedText style={styles.cardText}>{item.address_line1}</ThemedText>
      {item.address_line2 ? (
        <ThemedText style={styles.cardText}>{item.address_line2}</ThemedText>
      ) : null}
      <ThemedText style={styles.cardText}>
        {[item.city, item.state, item.postal_code].filter(Boolean).join(', ')}
      </ThemedText>
      <ThemedText style={styles.cardText}>{item.country}</ThemedText>
      {item.phone && <ThemedText style={styles.cardPhone}>{item.phone}</ThemedText>}

      <View style={styles.cardActions}>
        {!item.is_default && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleSetDefault(item)}
          >
            <Ionicons name="star-outline" size={16} color={ShopFlareColors.primary} />
            <ThemedText style={styles.actionBtnText}>Set Default</ThemedText>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
          <Ionicons name="pencil-outline" size={16} color={ShopFlareColors.primary} />
          <ThemedText style={styles.actionBtnText}>Edit</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={16} color="#F44336" />
          <ThemedText style={[styles.actionBtnText, { color: '#F44336' }]}>Delete</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={ShopFlareColors.primary} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>My Addresses</ThemedText>
        <TouchableOpacity onPress={openAdd} style={styles.addButton}>
          <Ionicons name="add" size={26} color={ShopFlareColors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={ShopFlareColors.primary} />
      ) : addresses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={64} color="#CCC" />
          <ThemedText style={styles.emptyTitle}>No Addresses Yet</ThemedText>
          <ThemedText style={styles.emptySubtitle}>Add a delivery address to get started</ThemedText>
          <TouchableOpacity style={styles.addFirstBtn} onPress={openAdd}>
            <ThemedText style={styles.addFirstBtnText}>Add Address</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={item => String(item.id)}
          renderItem={renderAddress}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {editingAddress ? 'Edit Address' : 'New Address'}
              </ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Label selector */}
              <ThemedText style={styles.label}>Label</ThemedText>
              <View style={styles.labelRow}>
                {(['home', 'work', 'other'] as const).map(l => (
                  <TouchableOpacity
                    key={l}
                    style={[styles.labelChip, form.label === l && styles.labelChipActive]}
                    onPress={() => setForm(f => ({ ...f, label: l }))}
                  >
                    <Ionicons name={LABEL_ICONS[l] as any} size={14} color={form.label === l ? '#FFF' : '#666'} />
                    <ThemedText style={[styles.labelChipText, form.label === l && styles.labelChipTextActive]}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              {[
                { key: 'full_name', label: 'Full Name *', placeholder: 'Recipient full name' },
                { key: 'phone', label: 'Phone', placeholder: 'Phone number' },
                { key: 'address_line1', label: 'Address Line 1 *', placeholder: 'Street address' },
                { key: 'address_line2', label: 'Address Line 2', placeholder: 'Apartment, suite, etc.' },
                { key: 'city', label: 'City *', placeholder: 'City' },
                { key: 'state', label: 'State / Province', placeholder: 'State' },
                { key: 'postal_code', label: 'Postal Code', placeholder: 'ZIP / Postal code' },
                { key: 'country', label: 'Country', placeholder: 'Country' },
              ].map(field => (
                <View key={field.key} style={styles.fieldGroup}>
                  <ThemedText style={styles.label}>{field.label}</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={(form as any)[field.key] || ''}
                    onChangeText={text => setForm(f => ({ ...f, [field.key]: text }))}
                    placeholder={field.placeholder}
                    placeholderTextColor="#999"
                  />
                </View>
              ))}

              {/* Default toggle */}
              <TouchableOpacity
                style={styles.defaultToggle}
                onPress={() => setForm(f => ({ ...f, is_default: !f.is_default }))}
              >
                <Ionicons
                  name={form.is_default ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={ShopFlareColors.primary}
                />
                <ThemedText style={styles.defaultToggleText}>Set as default address</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <ThemedText style={styles.saveButtonText}>
                    {editingAddress ? 'Save Changes' : 'Add Address'}
                  </ThemedText>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { padding: 8 },
  addButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  card: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  labelText: { fontSize: 11, fontWeight: '700', color: ShopFlareColors.primary },
  defaultBadge: {
    backgroundColor: ShopFlareColors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  defaultBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  cardName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  cardText: { fontSize: 14, color: '#555', lineHeight: 20 },
  cardPhone: { fontSize: 13, color: '#999', marginTop: 4 },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteBtn: {},
  actionBtnText: { fontSize: 13, color: ShopFlareColors.primary, fontWeight: '600' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 16, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#777', textAlign: 'center', marginBottom: 24 },
  addFirstBtn: {
    backgroundColor: ShopFlareColors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  addFirstBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 5 },
  input: {
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  labelRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  labelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
  },
  labelChipActive: { backgroundColor: ShopFlareColors.primary },
  labelChipText: { fontSize: 13, fontWeight: '600', color: '#666' },
  labelChipTextActive: { color: '#FFF' },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 12,
  },
  defaultToggleText: { fontSize: 14, fontWeight: '600' },
  saveButton: {
    backgroundColor: ShopFlareColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
