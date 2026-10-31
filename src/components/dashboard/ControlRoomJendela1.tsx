import React, { useState } from 'react';
import { 
  UserAccount, 
  OrgMember, 
  UserRole, 
  SchoolIdentityConfig, 
  OSIS_SEKBID_LIST, 
  SekbidDefinition,
  PresensiRecord,
  TransaksiKas 
} from '../../types/erp';
import { VOCATIONAL_IMAGE_PRESETS } from '../../data/imagePresets';
import { INITIAL_SCHOOL_IDENTITY } from '../../data/schoolIdentityPresets';
import { DAFTAR_KELAS } from '../../data/classList';
import { SchoolLogoManager } from './SchoolLogoManager';
import { DashboardAnalyticsRecharts } from './DashboardAnalyticsRecharts';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Key, 
  Lock, 
  CheckCircle, 
  Edit3, 
  Trash2, 
  GitBranch, 
  Sparkles,
  ExternalLink,
  UploadCloud,
  Camera,
  Building,
  Plus,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  Award,
  Search,
  Crown,
  Phone,
  Briefcase,
  FolderPlus,
  Settings,
  AlertCircle,
  Copy,
  Check,
  Printer,
  QrCode,
  Cloud,
  FileText,
  FileSpreadsheet,
  Download,
  CreditCard,
  BarChart3,
  GraduationCap,
  BookOpen,
  FileDown
} from 'lucide-react';
import { BulkExcelImportModal } from './BulkExcelImportModal';
import { KartuTandaAnggotaModal } from './KartuTandaAnggotaModal';
import { downloadExcelTemplate } from '../../utils/excelTemplateGenerator';

interface ControlRoomJendela1Props {
  currentUser: UserAccount;
  accounts: UserAccount[];
  orgMembers: OrgMember[];
  presensiList?: PresensiRecord[];
  transaksiList?: TransaksiKas[];
  sekbidList?: SekbidDefinition[];
  onAddSekbid?: (sekbid: SekbidDefinition) => void;
  onUpdateSekbid?: (sekbid: SekbidDefinition, oldNomor?: number) => void;
  onDeleteSekbid?: (nomor: number) => void;
  currentIdentity?: SchoolIdentityConfig;
  onSaveIdentity?: (newIdentity: SchoolIdentityConfig) => void;
  onAddAccount: (account: Omit<UserAccount, 'id' | 'createdAt'>) => void;
  onUpdateAccount: (account: UserAccount) => void;
  onDeleteAccount: (id: string) => void;
  onAddOrgMember: (member: Omit<OrgMember, 'id'>) => void;
  onUpdateOrgMember: (member: OrgMember) => void;
  onDeleteOrgMember: (id: string) => void;
  onViewPublicPortal: () => void;
  onOpenVercelGuide?: () => void;
  onOpenBlueprint?: () => void;
  onBulkAddMembers?: (
    newAccounts: Omit<UserAccount, 'id' | 'createdAt'>[],
    newOrgMembers: Omit<OrgMember, 'id'>[]
  ) => void;
}

export const ControlRoomJendela1: React.FC<ControlRoomJendela1Props> = ({
  currentUser,
  accounts,
  orgMembers,
  presensiList = [],
  transaksiList = [],
  sekbidList,
  onAddSekbid,
  onUpdateSekbid,
  onDeleteSekbid,
  currentIdentity,
  onSaveIdentity,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onAddOrgMember,
  onUpdateOrgMember,
  onDeleteOrgMember,
  onViewPublicPortal,
  onOpenVercelGuide,
  onOpenBlueprint,
  onBulkAddMembers,
}) => {
  const currentSekbids = sekbidList && sekbidList.length > 0 ? sekbidList : OSIS_SEKBID_LIST;

  const [activeTab, setActiveTab] = useState<'analytics' | 'accounts' | 'structure' | 'pembina_guru' | 'identity'>('analytics');
  const [structureFilter, setStructureFilter] = useState<'sekbid' | 'bph' | 'pembina_guru' | 'semua'>('sekbid');
  const [selectedSekbidNomor, setSelectedSekbidNomor] = useState<number | 'semua'>('semua');
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [selectedAccountToFill, setSelectedAccountToFill] = useState<string>('');

  // Form New Account State (Dioptimalkan: Cukup Nama, Kelas, Jabatan -> Username & Password Otomatis)
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [nisn, setNisn] = useState('');
  const [role, setRole] = useState<UserRole>('anggota');
  const [jabatan, setJabatan] = useState('');
  const [kelas, setKelas] = useState('');
  const [telepon, setTelepon] = useState('');
  const [createdAccountCard, setCreatedAccountCard] = useState<{
    fullName: string;
    kelas: string;
    jabatan: string;
    username: string;
    password: string;
  } | null>(null);
  const [copiedAccountWa, setCopiedAccountWa] = useState(false);

  // Bulk Word Import & KTA States
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showKtaModal, setShowKtaModal] = useState(false);

  const handleCommitBulkMembers = (
    newAccs: Omit<UserAccount, 'id' | 'createdAt'>[],
    newMems: Omit<OrgMember, 'id'>[]
  ) => {
    if (onBulkAddMembers) {
      onBulkAddMembers(newAccs, newMems);
    } else {
      newAccs.forEach((acc) => onAddAccount(acc));
      newMems.forEach((mem) => onAddOrgMember(mem));
    }
  };

  // Form Org Member State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<OrgMember | null>(null);
  const [memberNama, setMemberNama] = useState('');
  const [memberJabatan, setMemberJabatan] = useState('');
  const [memberKategori, setMemberKategori] = useState<'pembina' | 'bph' | 'sekbid' | 'anggota_sekbid'>('sekbid');
  const [memberPeranSekbid, setMemberPeranSekbid] = useState<'koordinator' | 'anggota'>('anggota');
  const [memberSekbidNomor, setMemberSekbidNomor] = useState<number | undefined>(currentSekbids[0]?.nomor || 1);
  const [memberSekbidNama, setMemberSekbidNama] = useState(currentSekbids[0]?.nama || '');
  const [memberKelas, setMemberKelas] = useState('');
  const [memberKontak, setMemberKontak] = useState('');
  const [memberVisi, setMemberVisi] = useState('');
  const [memberFotoUrl, setMemberFotoUrl] = useState(VOCATIONAL_IMAGE_PRESETS[10].url);

  // Form Seksi Bidang Modal State (Tambah & Edit Sekbid)
  const [showSekbidModal, setShowSekbidModal] = useState(false);
  const [editingSekbid, setEditingSekbid] = useState<SekbidDefinition | null>(null);
  const [sekbidNomorInput, setSekbidNomorInput] = useState<number>(1);
  const [sekbidNamaInput, setSekbidNamaInput] = useState<string>('');
  const [sekbidSingkatanInput, setSekbidSingkatanInput] = useState<string>('');
  const [sekbidDeskripsiInput, setSekbidDeskripsiInput] = useState<string>('');

  const handleOpenAddSekbid = () => {
    setEditingSekbid(null);
    const maxNomor = currentSekbids.reduce((max, s) => Math.max(max, s.nomor), 0);
    setSekbidNomorInput(maxNomor + 1);
    setSekbidNamaInput('');
    setSekbidSingkatanInput('');
    setSekbidDeskripsiInput('');
    setShowSekbidModal(true);
  };

  const handleOpenEditSekbid = (sek: SekbidDefinition) => {
    setEditingSekbid(sek);
    setSekbidNomorInput(sek.nomor);
    setSekbidNamaInput(sek.nama);
    setSekbidSingkatanInput(sek.singkatan);
    setSekbidDeskripsiInput(sek.deskripsi);
    setShowSekbidModal(true);
  };

  const handleSaveSekbid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sekbidNamaInput.trim() || !sekbidSingkatanInput.trim()) return;

    const newOrUpdated: SekbidDefinition = {
      nomor: Number(sekbidNomorInput),
      nama: sekbidNamaInput.trim(),
      singkatan: sekbidSingkatanInput.trim(),
      deskripsi: sekbidDeskripsiInput.trim() || `Seksi Bidang OSIS #${sekbidNomorInput}`,
    };

    if (editingSekbid) {
      if (onUpdateSekbid) {
        onUpdateSekbid(newOrUpdated, editingSekbid.nomor);
      }
    } else {
      if (onAddSekbid) {
        onAddSekbid(newOrUpdated);
      }
    }
    setShowSekbidModal(false);
  };

  const handleDeleteSekbidClick = (sek: SekbidDefinition) => {
    const membersInSekbid = orgMembers.filter(
      (m) => (m.kategori === 'sekbid' || m.kategori === 'anggota_sekbid') && m.sekbidNomor === sek.nomor
    );

    const warnMsg = membersInSekbid.length > 0
      ? `\n\nPERINGATAN: Terdapat ${membersInSekbid.length} personel (koordinator/anggota) yang terdaftar di Sekbid ini!`
      : '';

    if (confirm(`Apakah Anda yakin ingin menghapus Seksi Bidang #${sek.nomor}: "${sek.singkatan}" (${sek.nama})?${warnMsg}`)) {
      if (onDeleteSekbid) {
        onDeleteSekbid(sek.nomor);
      }
      if (selectedSekbidNomor === sek.nomor) {
        setSelectedSekbidNomor('semua');
      }
    }
  };

  const handleMemberPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setMemberFotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // =========================================================================
  // DEWAN GURU PEMBINA SEKBID STATES & HANDLERS
  // =========================================================================
  const [showGuruPembinaModal, setShowGuruPembinaModal] = useState(false);
  const [editingGuruPembina, setEditingGuruPembina] = useState<OrgMember | null>(null);
  const [guruNama, setGuruNama] = useState('');
  const [guruNip, setGuruNip] = useState('');
  const [guruSekbidNomor, setGuruSekbidNomor] = useState<number>(1);
  const [guruMataPelajaran, setGuruMataPelajaran] = useState('');
  const [guruKontak, setGuruKontak] = useState('');
  const [guruVisi, setGuruVisi] = useState('');
  const [guruFotoUrl, setGuruFotoUrl] = useState(VOCATIONAL_IMAGE_PRESETS[11].url);

  const handleOpenAddGuruPembina = (presetSekbidNo?: number) => {
    setEditingGuruPembina(null);
    const targetNo = presetSekbidNo || 1;
    setGuruSekbidNomor(targetNo);
    const matched = currentSekbids.find((s) => s.nomor === targetNo);
    setGuruNama('');
    setGuruNip('');
    setGuruMataPelajaran('');
    setGuruKontak('');
    setGuruVisi(
      `Membimbing dan mengawal pelaksanaan program kerja Sekbid ${targetNo} (${matched?.singkatan || ''}) agar berdaya guna dan profesional bagi siswa SMK Tridharma Gorontalo.`
    );
    setGuruFotoUrl(VOCATIONAL_IMAGE_PRESETS[11].url);
    setShowGuruPembinaModal(true);
  };

  const handleOpenEditGuruPembina = (guru: OrgMember) => {
    setEditingGuruPembina(guru);
    setGuruSekbidNomor(guru.sekbidNomor || 1);
    setGuruNama(guru.nama);
    setGuruNip(guru.nip || '');
    setGuruMataPelajaran(guru.mataPelajaran || '');
    setGuruKontak(guru.kontak || '');
    setGuruVisi(guru.visiSingkat || '');
    setGuruFotoUrl(guru.fotoUrl || VOCATIONAL_IMAGE_PRESETS[11].url);
    setShowGuruPembinaModal(true);
  };

  const handleSaveGuruPembina = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guruNama.trim()) return;

    const matchedSekbid = currentSekbids.find((s) => s.nomor === Number(guruSekbidNomor));
    const sekbidLabel = matchedSekbid ? `${matchedSekbid.singkatan}` : `Sekbid ${guruSekbidNomor}`;
    const generatedJabatan = `Guru Pembina Sekbid ${guruSekbidNomor} (${sekbidLabel})`;

    if (editingGuruPembina) {
      onUpdateOrgMember({
        ...editingGuruPembina,
        nama: guruNama.trim(),
        jabatan: generatedJabatan,
        kategori: 'pembina',
        peranSekbid: 'pembina_guru',
        sekbidNomor: Number(guruSekbidNomor),
        sekbidNama: matchedSekbid?.nama || '',
        kelas: 'Dewan Guru Pembina',
        nip: guruNip.trim() || '-',
        mataPelajaran: guruMataPelajaran.trim() || 'Guru Pembimbing',
        kontak: guruKontak.trim() || '-',
        visiSingkat: guruVisi.trim(),
        fotoUrl: guruFotoUrl.trim() || VOCATIONAL_IMAGE_PRESETS[11].url,
      });
    } else {
      onAddOrgMember({
        nama: guruNama.trim(),
        jabatan: generatedJabatan,
        kategori: 'pembina',
        peranSekbid: 'pembina_guru',
        sekbidNomor: Number(guruSekbidNomor),
        sekbidNama: matchedSekbid?.nama || '',
        kelas: 'Dewan Guru Pembina',
        nip: guruNip.trim() || '-',
        mataPelajaran: guruMataPelajaran.trim() || 'Guru Pembimbing',
        kontak: guruKontak.trim() || '-',
        visiSingkat: guruVisi.trim(),
        fotoUrl: guruFotoUrl.trim() || VOCATIONAL_IMAGE_PRESETS[11].url,
        urutan: 2,
      });
    }

    setShowGuruPembinaModal(false);
    setEditingGuruPembina(null);
  };

  const handleGuruPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setGuruFotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectAccountForAutofill = (accId: string) => {
    setSelectedAccountToFill(accId);
    if (!accId) return;
    const acc = accounts.find((a) => a.id === accId);
    if (acc) {
      setMemberNama(acc.fullName);
      setMemberKelas(acc.kelas || 'SMK Tridharma');
      setMemberKontak(acc.telepon || '-');
      if (acc.sekbidId) {
        const num = parseInt(acc.sekbidId.replace('sekbid-', ''), 10);
        if (!isNaN(num)) {
          handleChangeSekbidNomor(num);
        }
      }
    }
  };

  const handleChangeSekbidNomor = (no: number) => {
    setMemberSekbidNomor(no);
    const found = currentSekbids.find((s) => s.nomor === no);
    if (found) {
      setMemberSekbidNama(found.nama);
      setMemberJabatan(
        memberPeranSekbid === 'koordinator'
          ? `Koordinator Sekbid ${no}: ${found.singkatan}`
          : `Anggota Sekbid ${no}: ${found.singkatan}`
      );
    }
  };

  const handleChangePeranSekbid = (peran: 'koordinator' | 'anggota') => {
    setMemberPeranSekbid(peran);
    const no = memberSekbidNomor || currentSekbids[0]?.nomor || 1;
    const found = currentSekbids.find((s) => s.nomor === no);
    if (found) {
      setMemberJabatan(
        peran === 'koordinator'
          ? `Koordinator Sekbid ${no}: ${found.singkatan}`
          : `Anggota Sekbid ${no}: ${found.singkatan}`
      );
    }
  };

  // Helper Otomatis: Membuat Username & Password Unik dari Nama Siswa
  const generateAutoCredentials = (name: string) => {
    const parts = name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/);
    let autoUser = 'pengurus';
    if (parts.length === 1 && parts[0]) {
      autoUser = parts[0];
    } else if (parts.length >= 2) {
      autoUser = `${parts[0]}.${parts[1]}`;
    }

    // Pastikan tidak tabrakan dengan akun lain
    let finalUser = autoUser;
    let counter = 1;
    while (accounts.some((a) => a.username.toLowerCase() === finalUser.toLowerCase())) {
      finalUser = `${autoUser}${counter}`;
      counter++;
    }

    const rand = Math.floor(100 + Math.random() * 900);
    const autoPass = `tri${rand}`;
    return { autoUser: finalUser, autoPass };
  };

  const inferRoleFromJabatan = (jbt: string): UserRole => {
    const lower = jbt.toLowerCase();
    if (lower.includes('ketua') && !lower.includes('wakil')) return 'ketua';
    if (lower.includes('wakil')) return 'wakil';
    if (lower.includes('sekretaris')) return 'sekretaris';
    if (lower.includes('bendahara')) return 'bendahara';
    if (lower.includes('sekbid') || lower.includes('koordinator')) return 'sekbid';
    return 'anggota';
  };

  const handleFullNameChange = (newName: string) => {
    setFullName(newName);
    if (newName.trim().length >= 2) {
      const { autoUser, autoPass } = generateAutoCredentials(newName);
      setUsername(autoUser);
      if (!password) {
        setPassword(autoPass);
      }
    }
  };

  const handleOpenAddAccount = () => {
    setFullName('');
    setKelas('XI Askep');
    setJabatan('Koordinator Sekbid 1 (Ketaqwaan)');
    setUsername('');
    const rand = Math.floor(100 + Math.random() * 900);
    setPassword(`tri${rand}`);
    setShowAddAccountModal(true);
  };

  // Submit Account - Otomatis Buat Akun & Sambungkan ke Struktur Organisasi
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !kelas.trim() || !jabatan.trim()) return;

    const creds = generateAutoCredentials(fullName);
    const finalUser = username.trim() || creds.autoUser;
    const finalPass = password.trim() || creds.autoPass;
    const finalRole = inferRoleFromJabatan(jabatan);

    // 1. Simpan Akun Login
    onAddAccount({
      username: finalUser.toLowerCase(),
      password: finalPass,
      fullName: fullName.trim(),
      nisn: nisn.trim() || '0000000000',
      role: finalRole,
      jabatan: jabatan.trim(),
      kelas: kelas.trim(),
      telepon: telepon.trim() || '-',
      isActive: true,
    });

    // 2. Otomatis daftarkan juga ke Bagan Struktur Organisasi jika belum ada
    const alreadyInOrg = orgMembers.some(
      (m) => m.nama.toLowerCase() === fullName.trim().toLowerCase()
    );
    if (!alreadyInOrg) {
      const isSekbidRole = finalRole === 'sekbid' || jabatan.toLowerCase().includes('sekbid');
      const isKoord = jabatan.toLowerCase().includes('koordinator');
      const matchNum = jabatan.match(/sekbid\s*(\d+)/i) || jabatan.match(/bidang\s*(\d+)/i);
      const parsedSekbidNo = matchNum ? parseInt(matchNum[1], 10) : undefined;
      const matchedSekbid = parsedSekbidNo ? currentSekbids.find((s) => s.nomor === parsedSekbidNo) : undefined;

      onAddOrgMember({
        nama: fullName.trim(),
        jabatan: jabatan.trim(),
        kategori: isSekbidRole ? (isKoord ? 'sekbid' : 'anggota_sekbid') : (['ketua', 'wakil', 'sekretaris', 'bendahara'].includes(finalRole) ? 'bph' : 'sekbid'),
        kelas: kelas.trim(),
        fotoUrl: VOCATIONAL_IMAGE_PRESETS[Math.floor(Math.random() * 8) + 8].url,
        urutan: orgMembers.length + 1,
        kontak: telepon.trim() || '-',
        visiSingkat: 'Pengurus aktif OSIS SMK Tridharma Gorontalo.',
        sekbidNomor: parsedSekbidNo,
        sekbidNama: matchedSekbid?.nama,
        peranSekbid: isKoord ? 'koordinator' : 'anggota',
      });
    }

    setShowAddAccountModal(false);
    // Tampilkan Kartu Hasil Akun Baru
    setCreatedAccountCard({
      fullName: fullName.trim(),
      kelas: kelas.trim(),
      jabatan: jabatan.trim(),
      username: finalUser.toLowerCase(),
      password: finalPass,
    });

    setFullName('');
    setKelas('');
    setJabatan('');
    setUsername('');
    setPassword('');
  };

  const handleOpenAddMember = (
    presetKategori: 'bph' | 'sekbid' | 'pembina' = 'sekbid',
    presetPeran: 'koordinator' | 'anggota' = 'anggota',
    presetSekbidNo?: number
  ) => {
    setEditingMember(null);
    setSelectedAccountToFill('');
    setMemberKategori(presetKategori);
    setMemberPeranSekbid(presetPeran);
    
    if (presetSekbidNo) {
      const found = currentSekbids.find((s) => s.nomor === presetSekbidNo);
      setMemberSekbidNomor(presetSekbidNo);
      setMemberSekbidNama(found ? found.nama : '');
      setMemberJabatan(
        presetPeran === 'anggota' 
          ? `Anggota Sekbid ${presetSekbidNo}: ${found?.singkatan || ''}`
          : `Koordinator Sekbid ${presetSekbidNo}: ${found?.singkatan || ''}`
      );
    } else if (presetKategori === 'sekbid') {
      const defaultSekbid = currentSekbids[0] || OSIS_SEKBID_LIST[0];
      setMemberSekbidNomor(defaultSekbid.nomor);
      setMemberSekbidNama(defaultSekbid.nama);
      setMemberJabatan(
        presetPeran === 'anggota' 
          ? `Anggota Sekbid ${defaultSekbid.nomor}: ${defaultSekbid.singkatan}`
          : `Koordinator Sekbid ${defaultSekbid.nomor}: ${defaultSekbid.singkatan}`
      );
    } else if (presetKategori === 'bph') {
      setMemberSekbidNomor(undefined);
      setMemberSekbidNama('');
      setMemberJabatan('Wakil Ketua OSIS');
    } else {
      setMemberSekbidNomor(undefined);
      setMemberSekbidNama('');
      setMemberJabatan('Pembina OSIS');
    }

    setMemberNama('');
    setMemberKelas('');
    setMemberKontak('');
    setMemberVisi('');
    setMemberFotoUrl(VOCATIONAL_IMAGE_PRESETS[10].url);
    setShowAddMemberModal(true);
  };

  const handleOpenEditMember = (member: OrgMember) => {
    setEditingMember(member);
    setSelectedAccountToFill('');
    setMemberKategori(member.kategori);
    const isAnggota = member.peranSekbid === 'anggota' || member.jabatan.toLowerCase().includes('anggota');
    setMemberPeranSekbid(isAnggota ? 'anggota' : 'koordinator');
    setMemberSekbidNomor(member.sekbidNomor);
    setMemberSekbidNama(member.sekbidNama || '');
    setMemberNama(member.nama);
    setMemberJabatan(member.jabatan);
    setMemberKelas(member.kelas);
    setMemberKontak(member.kontak);
    setMemberVisi(member.visiSingkat || '');
    setMemberFotoUrl(member.fotoUrl || VOCATIONAL_IMAGE_PRESETS[10].url);
    setShowAddMemberModal(true);
  };

  // Submit Member (Add or Edit)
  const handleSaveOrgMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberNama.trim() || !memberJabatan.trim()) return;

    const isSekbid = memberKategori === 'sekbid' || memberKategori === 'anggota_sekbid';
    const finalKategori = isSekbid ? 'sekbid' : memberKategori;
    const finalPeran: 'koordinator' | 'anggota' | undefined = isSekbid ? memberPeranSekbid : undefined;

    let finalSekbidNama = memberSekbidNama;
    if (isSekbid && memberSekbidNomor) {
      const matched = currentSekbids.find((s) => s.nomor === Number(memberSekbidNomor));
      if (matched) finalSekbidNama = matched.nama;
    }

    if (editingMember) {
      onUpdateOrgMember({
        ...editingMember,
        nama: memberNama.trim(),
        jabatan: memberJabatan.trim(),
        kategori: finalKategori,
        peranSekbid: finalPeran,
        sekbidNomor: isSekbid ? Number(memberSekbidNomor) : undefined,
        sekbidNama: isSekbid ? finalSekbidNama : undefined,
        kelas: memberKelas.trim() || 'SMK Tridharma',
        fotoUrl: memberFotoUrl.trim(),
        kontak: memberKontak.trim() || '-',
        visiSingkat: memberVisi.trim(),
      });
    } else {
      onAddOrgMember({
        nama: memberNama.trim(),
        jabatan: memberJabatan.trim(),
        kategori: finalKategori,
        peranSekbid: finalPeran,
        sekbidNomor: isSekbid ? Number(memberSekbidNomor) : undefined,
        sekbidNama: isSekbid ? finalSekbidNama : undefined,
        kelas: memberKelas.trim() || 'SMK Tridharma',
        fotoUrl: memberFotoUrl.trim(),
        urutan: orgMembers.length + 1,
        kontak: memberKontak.trim() || '-',
        visiSingkat: memberVisi.trim(),
      });
    }

    setShowAddMemberModal(false);
    setEditingMember(null);
    setMemberNama('');
    setMemberJabatan('');
    setMemberKelas('');
    setMemberKontak('');
    setMemberVisi('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-indigo-900/90 to-slate-900 border border-indigo-700/50 rounded-2xl p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-mono mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>KENDALI OTORITAS TINGGI · JENDELA 1</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Master Data, Akun & Struktur Kepengurusan</h2>
            <p className="text-xs text-indigo-200 mt-1 max-w-2xl leading-relaxed">
              Hak akses eksklusif Admin. Hanya Admin yang berhak menentukan akun pengurus baru (username & password). Seluruh penataan struktur otomatis tersinkronisasi ke Portal Publik.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenVercelGuide && (
              <button
                type="button"
                onClick={onOpenVercelGuide}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shadow-sm border border-sky-400/40 active:scale-95 cursor-pointer"
                title="Panduan Hosting Vercel & Sinkronisasi Database Cloud (Supabase/Firebase)"
              >
                <Cloud className="w-4 h-4 text-sky-200" />
                <span>Hosting & Cloud DB</span>
                <span className="text-[9px] bg-sky-950/80 text-sky-200 px-1.5 py-0.5 rounded font-mono font-bold">
                  PEMBINA
                </span>
              </button>
            )}

            {onOpenBlueprint && (
              <button
                type="button"
                onClick={onOpenBlueprint}
                className="px-3.5 py-2 bg-indigo-900/90 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shadow-sm border border-indigo-400/40 active:scale-95 cursor-pointer"
                title="Dokumentasi Arsitektur Sistem, ERD Database & Cetak Biru Teknis (Khusus Pembina)"
              >
                <Layers className="w-4 h-4 text-indigo-300" />
                <span>Blueprint Sistem</span>
                <span className="text-[9px] bg-indigo-950/80 text-indigo-200 px-1.5 py-0.5 rounded font-mono font-bold">
                  PEMBINA
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowKtaModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shadow-sm border border-emerald-400/40 active:scale-95 cursor-pointer"
              title="Cetak & Unduh Kartu Tanda Anggota (KTA) OSIS"
            >
              <CreditCard className="w-4 h-4 text-emerald-200" />
              <span>Kartu Anggota (KTA)</span>
              <span className="text-[9px] bg-emerald-950/80 text-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold">
                PRINT
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shadow-sm border border-emerald-400/40 active:scale-95 cursor-pointer"
              title="Lihat Visualisasi Recharts & Unduh Laporan PDF Ringkasan Otomatis"
            >
              <FileDown className="w-4 h-4 text-emerald-200" />
              <span>Laporan PDF & Analitik</span>
            </button>

            <button
              onClick={onViewPublicPortal}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shadow-sm cursor-pointer"
            >
              <span>Cek Tampilan Publik</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Visualisasi Data & Tren (Recharts)</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
            activeTab === 'analytics' ? 'bg-indigo-800 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            LIVE
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pembina_guru')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'pembina_guru'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Dewan Guru Pembina Sekbid</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
            activeTab === 'pembina_guru' ? 'bg-indigo-800 text-white' : 'bg-purple-100 text-purple-800'
          }`}>
            {orgMembers.filter(
              (m) =>
                m.peranSekbid === 'pembina_guru' ||
                (m.kategori === 'pembina' && m.sekbidNomor) ||
                m.jabatan.toLowerCase().includes('guru pembina')
            ).length} Guru
          </span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'accounts'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Manajemen Akun Kredensial ({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('structure')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'structure'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Bagan Struktur Kepengurusan ({orgMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('identity')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'identity'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Logo & Identitas Sekolah</span>
          <span className="text-[9px] font-mono bg-amber-400/20 text-amber-700 font-bold px-1.5 py-0.5 rounded">
            PEMBINA
          </span>
        </button>
      </div>

      {/* TAB 0: RECHARTS DATA VISUALIZATION */}
      {activeTab === 'analytics' && (
        <DashboardAnalyticsRecharts
          presensiList={presensiList}
          transaksiList={transaksiList}
          accounts={accounts}
          orgMembers={orgMembers}
          schoolIdentity={currentIdentity}
        />
      )}

      {/* TAB: DEWAN GURU PEMBINA SEKSI BIDANG */}
      {activeTab === 'pembina_guru' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-purple-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-purple-300 text-xs font-mono mb-1.5">
                <GraduationCap className="w-4 h-4 text-purple-300" />
                <span>DEWAN GURU PENDAMPING & PEMBINA SEKBID</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                Dewan Guru Pembina di Setiap Seksi Bidang
              </h3>
              <p className="text-xs text-purple-200/80 mt-1 max-w-2xl leading-relaxed">
                Kelola para bapak/ibu guru yang bertindak sebagai pembina teknis dan pendamping moral bagi pengurus di masing-masing Seksi Bidang (Sekbid 1 s.d. 8). Nama dan profil guru pembina akan tampil secara resmi di Bagan Struktur Organisasi Portal Publik.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAddGuruPembina()}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-purple-600/30 whitespace-nowrap active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Guru Pembina Sekbid</span>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Guru Pembina Terdaftar</div>
                <div className="text-xl font-black text-slate-900 font-mono">
                  {orgMembers.filter(
                    (m) =>
                      m.peranSekbid === 'pembina_guru' ||
                      (m.kategori === 'pembina' && m.sekbidNomor) ||
                      m.jabatan.toLowerCase().includes('guru pembina')
                  ).length}{' '}
                  <span className="text-xs font-normal text-slate-500">Guru</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Sekbid Memiliki Pembina</div>
                <div className="text-xl font-black text-indigo-700 font-mono">
                  {
                    currentSekbids.filter((s) =>
                      orgMembers.some(
                        (m) =>
                          (m.peranSekbid === 'pembina_guru' ||
                            (m.kategori === 'pembina' && m.sekbidNomor) ||
                            m.jabatan.toLowerCase().includes('guru pembina')) &&
                          m.sekbidNomor === s.nomor
                      )
                    ).length
                  }{' '}
                  <span className="text-xs font-normal text-slate-500">/ {currentSekbids.length} Bidang</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Pembina Utama OSIS</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                  Bpk. Ilham Arief, S.Pd.
                </div>
                <div className="text-[10px] text-slate-500 font-mono">NIP 198504122011011008</div>
              </div>
            </div>
          </div>

          {/* Sekbid Advisory Cards Grid (Sekbid 1 s.d. 8) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentSekbids.map((sek) => {
              const assignedGurus = orgMembers.filter(
                (m) =>
                  (m.peranSekbid === 'pembina_guru' ||
                    (m.kategori === 'pembina' && m.sekbidNomor) ||
                    m.jabatan.toLowerCase().includes('guru pembina')) &&
                  m.sekbidNomor === sek.nomor
              );

              return (
                <div
                  key={sek.nomor}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-4 sm:p-5">
                    {/* Header Sekbid Badge */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 font-mono font-bold text-xs flex items-center justify-center">
                          #{sek.nomor}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{sek.nama}</div>
                          <div className="text-[10px] text-slate-500 font-semibold">{sek.singkatan}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenAddGuruPembina(sek.nomor)}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Tugaskan Guru</span>
                      </button>
                    </div>

                    {/* Assigned Gurus List */}
                    {assignedGurus.length > 0 ? (
                      <div className="space-y-3">
                        {assignedGurus.map((guru) => (
                          <div
                            key={guru.id}
                            className="bg-gradient-to-br from-purple-50/50 to-indigo-50/30 rounded-xl p-3.5 border border-purple-100 flex items-start justify-between gap-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-purple-200 overflow-hidden shrink-0 shadow-2xs">
                                {guru.fotoUrl ? (
                                  <img
                                    src={guru.fotoUrl}
                                    alt={guru.nama}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs bg-purple-700">
                                    {guru.nama.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 leading-snug">
                                  {guru.nama}
                                </div>
                                <div className="text-[11px] font-semibold text-purple-700 mt-0.5">
                                  {guru.mataPelajaran || 'Guru Pembina Sekbid'}
                                </div>
                                {guru.nip && (
                                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    NIP: {guru.nip}
                                  </div>
                                )}
                                {guru.kontak && guru.kontak !== '-' && (
                                  <div className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-emerald-600" />
                                    <span>{guru.kontak}</span>
                                  </div>
                                )}
                                {guru.visiSingkat && (
                                  <p className="text-[11px] text-slate-600 italic mt-2 pt-1.5 border-t border-purple-100/80">
                                    "{guru.visiSingkat}"
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEditGuruPembina(guru)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors"
                                title="Edit Data Guru Pembina"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Hapus ${guru.nama} dari Pembina Sekbid ${sek.nomor}?`)) {
                                    onDeleteOrgMember(guru.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                                title="Hapus Guru Pembina"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                        <GraduationCap className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                        <div className="text-xs font-semibold text-slate-600">
                          Belum Ada Guru Pembina Ditugaskan
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Tugaskan guru mata pelajaran/kejuruan untuk mendampingi Sekbid {sek.nomor}.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenAddGuruPembina(sek.nomor)}
                          className="mt-2.5 px-3 py-1.5 bg-white border border-purple-300 hover:bg-purple-50 text-purple-700 rounded-lg text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Pilih & Tugaskan Guru Sekarang</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 1: ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daftar Akun Pengurus Aktif</h3>
              <p className="text-xs text-slate-500">
                Kredensial ditetapkan oleh Admin. Tidak disediakan pendaftaran mandiri demi keamanan birokrasi OSIS.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => downloadExcelTemplate(currentIdentity?.namaSekolah || 'SMK TRIDHARMA GORONTALO')}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-300 shadow-2xs cursor-pointer active:scale-95"
                title="Unduh Formulir Template Excel (.xlsx) untuk diisi offline dengan panduan 7 kelas"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unduh Template Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBulkImportModal(true)}
                className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-teal-200 shadow-2xs cursor-pointer active:scale-95"
                title="Impor banyak siswa sekaligus dari file Excel (.xlsx / .xls)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                <span>Impor Massal Excel</span>
              </button>

              <button
                type="button"
                onClick={() => setShowKtaModal(true)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer active:scale-95"
                title="Pratinjau, Cetak & Unduh Kartu Tanda Anggota (KTA) OSIS"
              >
                <CreditCard className="w-3.5 h-3.5 text-white" />
                <span>Cetak KTA OSIS</span>
              </button>

              <button
                onClick={handleOpenAddAccount}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftarkan 1 Pengurus</span>
              </button>
            </div>
          </div>

          {/* Accounts Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Nama & Username</th>
                    <th className="py-3 px-4">Role & Hak Akses</th>
                    <th className="py-3 px-4">Jabatan Organisasi</th>
                    <th className="py-3 px-4">Kelas / Jurusan</th>
                    <th className="py-3 px-4">Password Aktif</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{acc.fullName}</div>
                        <div className="text-[11px] font-mono text-indigo-600">@{acc.username}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                            acc.role === 'pembina'
                              ? 'bg-purple-100 text-purple-800'
                              : acc.role === 'ketua'
                              ? 'bg-indigo-100 text-indigo-800'
                              : acc.role === 'sekretaris'
                              ? 'bg-sky-100 text-sky-800'
                              : acc.role === 'bendahara'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {acc.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{acc.jabatan}</td>
                      <td className="py-3 px-4 text-slate-600">{acc.kelas}</td>
                      <td className="py-3 px-4 font-mono text-[11px] bg-slate-50/50">
                        {acc.password || '••••••••'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onUpdateAccount({ ...acc, isActive: !acc.isActive })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            acc.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {acc.isActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {acc.role !== 'pembina' && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus akun pengurus ${acc.fullName}?`)) {
                                onDeleteAccount(acc.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STRUCTURE */}
      {activeTab === 'structure' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
                <GitBranch className="w-4 h-4" />
                <span>Hierarki & Seksi Bidang OSIS</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Editor Bagan Struktur Kepengurusan & Seksi Bidang
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola Koordinator dan Anggota untuk {currentSekbids.length} Seksi Bidang (Sekbid), Pembina, dan BPH. Admin dapat mengedit, menambah, atau menghapus seksi bidang serta mengatur seluruh struktur anggota.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleOpenAddSekbid}
                className="min-h-[42px] px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs active:scale-95"
              >
                <FolderPlus className="w-4 h-4" />
                <span>+ Tambah Seksi Bidang</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenAddMember('sekbid', 'anggota', typeof selectedSekbidNomor === 'number' ? selectedSekbidNomor : currentSekbids[0]?.nomor || 1)}
                className="min-h-[42px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Anggota Sekbid</span>
              </button>

              <button
                type="button"
                onClick={() => setShowKtaModal(true)}
                className="min-h-[42px] px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
                title="Cetak Kartu Tanda Anggota (KTA) OSIS"
              >
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Cetak KTA OSIS</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Personel</div>
              <div className="text-xl font-black text-slate-900 mt-1 font-mono">{orgMembers.length} <span className="text-xs font-normal text-slate-500">Siswa/Guru</span></div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-semibold text-indigo-600 uppercase">Pembina & BPH</div>
              <div className="text-xl font-black text-indigo-700 mt-1 font-mono">
                {orgMembers.filter(m => m.kategori === 'pembina' || m.kategori === 'bph').length}
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-semibold text-amber-600 uppercase">Koordinator Sekbid</div>
              <div className="text-xl font-black text-amber-700 mt-1 font-mono">
                {orgMembers.filter(m => (m.kategori === 'sekbid' || m.kategori === 'anggota_sekbid') && (m.peranSekbid === 'koordinator' || m.jabatan.toLowerCase().includes('koordinator'))).length}
                <span className="text-xs font-normal text-slate-500"> / {currentSekbids.length} Sekbid</span>
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-semibold text-emerald-600 uppercase">Anggota Sekbid</div>
              <div className="text-xl font-black text-emerald-700 mt-1 font-mono">
                {orgMembers.filter(m => (m.kategori === 'sekbid' || m.kategori === 'anggota_sekbid') && (m.peranSekbid === 'anggota' || (!m.peranSekbid && !m.jabatan.toLowerCase().includes('koordinator')))).length}
                <span className="text-xs font-normal text-slate-500"> Terdaftar</span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setStructureFilter('sekbid')}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  structureFilter === 'sekbid'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Struktur Seksi Bidang</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${structureFilter === 'sekbid' ? 'bg-indigo-800 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {currentSekbids.length} Bidang
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStructureFilter('bph')}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  structureFilter === 'bph'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Pembina & BPH</span>
              </button>

              <button
                type="button"
                onClick={() => setStructureFilter('semua')}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  structureFilter === 'semua'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Semua Posisi ({orgMembers.length})</span>
              </button>
            </div>

            {structureFilter === 'semua' && (
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchMemberQuery}
                  onChange={(e) => setSearchMemberQuery(e.target.value)}
                  placeholder="Cari nama atau jabatan..."
                  className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* VIEW: STRUKTUR SEKSI BIDANG */}
          {structureFilter === 'sekbid' && (
            <div className="space-y-6">
              {/* Sekbid Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedSekbidNomor('semua')}
                  className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedSekbidNomor === 'semua'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Semua Sekbid ({currentSekbids.length})
                </button>

                {currentSekbids.map((sek) => {
                  const count = orgMembers.filter(
                    (m) => (m.kategori === 'sekbid' || m.kategori === 'anggota_sekbid') && m.sekbidNomor === sek.nomor
                  ).length;

                  return (
                    <button
                      key={sek.nomor}
                      type="button"
                      onClick={() => setSelectedSekbidNomor(sek.nomor)}
                      className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                        selectedSekbidNomor === sek.nomor
                          ? 'bg-indigo-600 text-white shadow-xs font-bold'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-mono font-bold">#{sek.nomor}</span>
                      <span>{sek.singkatan}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        selectedSekbidNomor === sek.nomor ? 'bg-indigo-800 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Sekbid Cards Container */}
              <div className="space-y-6">
                {currentSekbids.filter(
                  (s) => selectedSekbidNomor === 'semua' || s.nomor === selectedSekbidNomor
                ).map((sek) => {
                  const koordinator = orgMembers.find(
                    (m) =>
                      (m.kategori === 'sekbid' || m.kategori === 'anggota_sekbid') &&
                      m.sekbidNomor === sek.nomor &&
                      (m.peranSekbid === 'koordinator' || m.jabatan.toLowerCase().includes('koordinator'))
                  );

                  const anggotaList = orgMembers.filter(
                    (m) =>
                      (m.kategori === 'sekbid' || m.kategori === 'anggota_sekbid') &&
                      m.sekbidNomor === sek.nomor &&
                      (m.peranSekbid === 'anggota' || (!m.peranSekbid && !m.jabatan.toLowerCase().includes('koordinator')))
                  );

                  return (
                    <div
                      key={sek.nomor}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all hover:border-slate-300"
                    >
                      {/* Sekbid Card Header with Edit & Hapus & Tambah Anggota */}
                      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 font-mono text-[11px] font-bold">
                              SEKBID #{sek.nomor}
                            </span>
                            <span className="text-xs text-indigo-200 font-semibold">{sek.singkatan}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                              {1 + anggotaList.length} Personel ({koordinator ? '1 Koord' : '0 Koord'}, {anggotaList.length} Anggota)
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">
                            {sek.nama}
                          </h4>
                          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                            {sek.deskripsi}
                          </p>
                        </div>

                        {/* Top Action inside Sekbid: Edit Sekbid, Hapus Sekbid, Tambah Anggota */}
                        <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditSekbid(sek)}
                            className="min-h-[38px] px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-indigo-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700 shadow-2xs active:scale-95"
                            title="Edit nama, singkatan, dan ruang lingkup tugas Seksi Bidang ini"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-indigo-300" />
                            <span>Edit Bidang</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSekbidClick(sek)}
                            className="min-h-[38px] px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-rose-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-rose-800/60 shadow-2xs active:scale-95"
                            title="Hapus Seksi Bidang ini dari sistem"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>Hapus</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenAddMember('sekbid', 'anggota', sek.nomor)}
                            className="min-h-[38px] px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Tambah Anggota</span>
                          </button>
                        </div>
                      </div>

                      {/* Content Section: Koordinator & Anggota */}
                      <div className="p-4 sm:p-5 space-y-5 bg-slate-50/50">
                        {/* 1. KOORDINATOR SEKBID */}
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                              <Crown className="w-3.5 h-3.5 text-amber-500" />
                              <span>Koordinator Seksi Bidang</span>
                            </div>
                            {!koordinator && (
                              <button
                                type="button"
                                onClick={() => handleOpenAddMember('sekbid', 'koordinator', sek.nomor)}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tetapkan Koordinator</span>
                              </button>
                            )}
                          </div>

                          {koordinator ? (
                            <div className="bg-white rounded-xl border-2 border-indigo-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-13 h-13 rounded-xl bg-slate-900 border border-indigo-300 overflow-hidden shrink-0 shadow-inner">
                                  {koordinator.fotoUrl ? (
                                    <img
                                      src={koordinator.fotoUrl}
                                      alt={koordinator.nama}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs bg-indigo-600">
                                      {koordinator.nama.slice(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900 truncate">
                                      {koordinator.nama}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-mono">
                                      KOORDINATOR
                                    </span>
                                  </div>
                                  <div className="text-xs font-medium text-indigo-600 truncate">
                                    {koordinator.jabatan}
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                                    <span>Kelas: {koordinator.kelas}</span>
                                    {koordinator.kontak && koordinator.kontak !== '-' && (
                                      <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                          <Phone className="w-3 h-3 text-slate-400" />
                                          {koordinator.kontak}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditMember(koordinator)}
                                  className="min-h-[34px] px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Hapus Koordinator ${koordinator.nama} dari Sekbid ${sek.nomor}?`)) {
                                      onDeleteOrgMember(koordinator.id);
                                    }
                                  }}
                                  className="min-h-[34px] px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                              <p className="text-xs text-slate-500">
                                Belum ada Koordinator yang ditugaskan untuk Sekbid #{sek.nomor}.
                              </p>
                              <button
                                type="button"
                                onClick={() => handleOpenAddMember('sekbid', 'koordinator', sek.nomor)}
                                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Tetapkan Koordinator Sekbid #{sek.nomor}</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* 2. ANGGOTA SEKSI BIDANG */}
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                              <Users className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Anggota Seksi Bidang ({anggotaList.length} Siswa)</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenAddMember('sekbid', 'anggota', sek.nomor)}
                              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tambah Anggota</span>
                            </button>
                          </div>

                          {anggotaList.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {anggotaList.map((agt) => (
                                <div
                                  key={agt.id}
                                  className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:border-slate-300 flex flex-col justify-between transition-all"
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-1 mb-2">
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono">
                                        ANGGOTA SEKBID
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditMember(agt)}
                                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                                          title="Edit Anggota"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (confirm(`Hapus anggota ${agt.nama} dari Sekbid ${sek.nomor}?`)) {
                                              onDeleteOrgMember(agt.id);
                                            }
                                          }}
                                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                          title="Hapus Anggota"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-200 overflow-hidden shrink-0 shadow-xs">
                                        {agt.fotoUrl ? (
                                          <img
                                            src={agt.fotoUrl}
                                            alt={agt.nama}
                                            referrerPolicy="no-referrer"
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs bg-emerald-600">
                                            {agt.nama.slice(0, 2).toUpperCase()}
                                          </div>
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-xs font-bold text-slate-900 truncate">
                                          {agt.nama}
                                        </div>
                                        <div className="text-[11px] text-slate-600 truncate font-medium">
                                          {agt.jabatan}
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">
                                          Kelas: {agt.kelas}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {agt.visiSingkat && (
                                    <p className="text-[10px] text-slate-500 italic mt-2 pt-1.5 border-t border-slate-100 line-clamp-2">
                                      "{agt.visiSingkat}"
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                              <p className="text-xs text-slate-500">
                                Belum ada Anggota yang ditambahkan di Sekbid #{sek.nomor}.
                              </p>
                              <button
                                type="button"
                                onClick={() => handleOpenAddMember('sekbid', 'anggota', sek.nomor)}
                                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Tambah Anggota Pertama ke Sekbid #{sek.nomor}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: PEMBINA & BPH */}
          {structureFilter === 'bph' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {orgMembers
                  .filter((m) => m.kategori === 'pembina' || m.kategori === 'bph')
                  .sort((a, b) => a.urutan - b.urutan)
                  .map((member) => (
                    <div
                      key={member.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                            member.kategori === 'pembina' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {member.kategori}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditMember(member)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Hapus posisi ${member.nama} dari struktur?`)) {
                                  onDeleteOrgMember(member.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 my-2">
                          <div className="w-13 h-13 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200">
                            {member.fotoUrl ? (
                              <img
                                src={member.fotoUrl}
                                alt={member.nama}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-xs text-white bg-indigo-600">
                                {member.nama.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 leading-snug">{member.nama}</div>
                            <div className="text-[11px] font-semibold text-indigo-600">{member.jabatan}</div>
                            <div className="text-[10px] text-slate-500">Kelas: {member.kelas}</div>
                          </div>
                        </div>
                      </div>

                      {member.visiSingkat && (
                        <p className="text-[11px] text-slate-600 italic mt-2 pt-2 border-t border-slate-100">
                          "{member.visiSingkat}"
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* VIEW: SEMUA POSISI ORGANISASI */}
          {structureFilter === 'semua' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {orgMembers
                .filter((m) => {
                  if (!searchMemberQuery.trim()) return true;
                  const q = searchMemberQuery.toLowerCase();
                  return (
                    m.nama.toLowerCase().includes(q) ||
                    m.jabatan.toLowerCase().includes(q) ||
                    (m.sekbidNama && m.sekbidNama.toLowerCase().includes(q))
                  );
                })
                .map((member) => (
                  <div
                    key={member.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono bg-slate-100 text-slate-700">
                          {member.kategori} {member.sekbidNomor ? `#${member.sekbidNomor}` : ''} {member.peranSekbid ? `(${member.peranSekbid})` : ''}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditMember(member)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus posisi ${member.nama} dari struktur?`)) {
                                onDeleteOrgMember(member.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 my-2">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200">
                          {member.fotoUrl ? (
                            <img
                              src={member.fotoUrl}
                              alt={member.nama}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-400 bg-slate-100">
                              {member.nama.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 leading-snug">{member.nama}</div>
                          <div className="text-[11px] font-semibold text-indigo-600">{member.jabatan}</div>
                          <div className="text-[10px] text-slate-500">Kelas: {member.kelas}</div>
                        </div>
                      </div>
                    </div>

                    {member.visiSingkat && (
                      <p className="text-[11px] text-slate-600 italic mt-2 pt-2 border-t border-slate-100">
                        "{member.visiSingkat}"
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LOGO & IDENTITAS SEKOLAH (KHUSUS PEMBINA) */}
      {activeTab === 'identity' && (
        <SchoolLogoManager
          currentUser={currentUser}
          currentIdentity={currentIdentity || INITIAL_SCHOOL_IDENTITY}
          onSaveIdentity={(newId) => {
            if (onSaveIdentity) onSaveIdentity(newId);
          }}
          onViewPublicPortal={onViewPublicPortal}
        />
      )}

      {/* Modal Add Account - Disederhanakan khusus Pembina: Cukup Nama, Kelas, & Jabatan */}
      {showAddAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Input Pengurus Baru</h3>
                  <p className="text-xs text-slate-500">Cukup masukkan Nama, Kelas & Jabatan. Username & Password dibuat otomatis.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAccountModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              {/* Field 1: Nama Lengkap Siswa */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>1. Nama Lengkap Siswa</span>
                  <span className="text-[10px] text-indigo-600 font-normal">Wajib diisi</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={fullName}
                  onChange={(e) => handleFullNameChange(e.target.value)}
                  placeholder="Contoh: Mohamad Rivaldo Daud"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                />
              </div>

              {/* Field 2: Kelas Siswa (7 Kelas Resmi) */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>2. Kelas Siswa (SMK Tridharma)</span>
                  <span className="text-[10px] text-slate-500">Pilih salah satu dari 7 kelas resmi</span>
                </label>
                {/* Chip Pilihan Cepat 7 Kelas SMK Tridharma */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {DAFTAR_KELAS.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKelas(k)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        kelas === k
                          ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  placeholder="Pilih dari tombol kelas di atas atau ketik"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                />
              </div>

              {/* Field 3: Jabatan Organisasi */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>3. Jabatan Organisasi OSIS</span>
                  <span className="text-[10px] text-slate-500">Pilih dari daftar atau ketik bebas</span>
                </label>
                <input
                  type="text"
                  required
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Contoh: Koordinator Sekbid 1 (Ketaqwaan) atau Anggota"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium mb-2"
                />
                {/* Quick Selection Dropdown / Buttons */}
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setJabatan('Ketua Umum OSIS')}
                    className="text-left px-2.5 py-1.5 rounded-lg text-[11px] hover:bg-white hover:shadow-xs transition-colors text-slate-700 font-medium"
                  >
                    👑 Ketua Umum OSIS
                  </button>
                  <button
                    type="button"
                    onClick={() => setJabatan('Wakil Ketua OSIS')}
                    className="text-left px-2.5 py-1.5 rounded-lg text-[11px] hover:bg-white hover:shadow-xs transition-colors text-slate-700 font-medium"
                  >
                    🤝 Wakil Ketua OSIS
                  </button>
                  <button
                    type="button"
                    onClick={() => setJabatan('Sekretaris Umum OSIS')}
                    className="text-left px-2.5 py-1.5 rounded-lg text-[11px] hover:bg-white hover:shadow-xs transition-colors text-slate-700 font-medium"
                  >
                    📝 Sekretaris Umum
                  </button>
                  <button
                    type="button"
                    onClick={() => setJabatan('Bendahara Umum OSIS')}
                    className="text-left px-2.5 py-1.5 rounded-lg text-[11px] hover:bg-white hover:shadow-xs transition-colors text-slate-700 font-medium"
                  >
                    💰 Bendahara Umum
                  </button>
                  {currentSekbids.map((s) => (
                    <button
                      key={s.nomor}
                      type="button"
                      onClick={() => setJabatan(`Koordinator Sekbid ${s.nomor} (${s.singkatan})`)}
                      className="text-left px-2.5 py-1.5 rounded-lg text-[11px] hover:bg-white hover:shadow-xs transition-colors text-slate-700"
                    >
                      🎯 Sekbid {s.nomor}: {s.singkatan}
                    </button>
                  ))}
                </div>
              </div>

              {/* LIVE PREVIEW: KREDENSIAL LOGIN OTOMATIS */}
              <div className="bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 rounded-2xl p-4 border border-indigo-100/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Kredensial Dihasilkan Otomatis Oleh Sistem</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (fullName) {
                        const { autoUser, autoPass } = generateAutoCredentials(fullName);
                        setUsername(autoUser);
                        setPassword(autoPass);
                      } else {
                        const rand = Math.floor(100 + Math.random() * 900);
                        setPassword(`tri${rand}`);
                      }
                    }}
                    title="Buat Ulang Sandi Acak"
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline"
                  >
                    Acak Ulang Sandi
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">👤 Username Login</span>
                    <span className="font-mono font-bold text-sm text-indigo-700 break-all">
                      {username || (fullName ? generateAutoCredentials(fullName).autoUser : 'nama.siswa')}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">🔑 Password Masuk</span>
                    <span className="font-mono font-bold text-sm text-emerald-700">
                      {password || 'tri482'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Hak Akses Sistem Terdeteksi:</span>
                  <span className="font-semibold text-slate-700 uppercase px-2 py-0.5 bg-white rounded-md border border-slate-200">
                    {inferRoleFromJabatan(jabatan)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Simpan & Buat Akun Otomatis</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KARTU KREDENSIAL BERHASIL DIBUAT (KIRIM WHATSAPP / PRINT) */}
      {createdAccountCard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xs">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Akun Pengurus Siap Digunakan!</h3>
              <p className="text-xs text-slate-500">
                Data login telah dibuat otomatis dan terdaftar di sistem ERP OSIS SMK Tridharma.
              </p>
            </div>

            {/* Kartu Fisik Kredensial */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-lg border border-indigo-800/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">SMK TRIDHARMA GORONTALO</div>
                  <div className="text-xs font-semibold text-slate-200">Kartu Akses Pengurus OSIS</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AKTIF
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Nama Pengurus:</div>
                  <div className="font-bold text-sm text-white">{createdAccountCard.fullName}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[10px] text-slate-400">Kelas / Jurusan:</div>
                    <div className="font-semibold text-slate-200">{createdAccountCard.kelas}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Jabatan:</div>
                    <div className="font-semibold text-indigo-200 line-clamp-1">{createdAccountCard.jabatan}</div>
                  </div>
                </div>

                <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <div className="text-[10px] text-slate-400">👤 Username:</div>
                    <div className="font-mono font-bold text-indigo-300 text-xs select-all">
                      {createdAccountCard.username}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">🔑 Password:</div>
                    <div className="font-mono font-bold text-emerald-300 text-xs select-all">
                      {createdAccountCard.password}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Bagikan WhatsApp & Tutup */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  const message = 
`📢 *AKUN RESMI PORTAL OSIS SMK TRIDHARMA GORONTALO*

Halo *${createdAccountCard.fullName}* (${createdAccountCard.kelas}),
Selamat atas amanah sebagai *${createdAccountCard.jabatan}*!

Berikut data akun Anda untuk masuk ke Portal Pengurus:
🌐 *Website Portal:* ${window.location.origin}
👤 *Username:* ${createdAccountCard.username}
🔑 *Password:* ${createdAccountCard.password}

Silakan buka situs di atas, pilih *Portal Pengurus*, masukkan username & password tersebut untuk melakukan presensi scan QR Pembina dan mengakses tugas kerja Anda.

_Pembina OSIS SMK Tridharma Gorontalo_`;

                  navigator.clipboard.writeText(message);
                  setCopiedAccountWa(true);
                  setTimeout(() => setCopiedAccountWa(false), 3000);
                }}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  copiedAccountWa
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                }`}
              >
                {copiedAccountWa ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin! Siap Ditempel ke WhatsApp Siswa</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Format Teks Kirim ke WhatsApp Siswa</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCreatedAccountCard(null);
                  setCopiedAccountWa(false);
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Member (Termasuk Anggota Seksi Bidang) */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {editingMember ? 'Edit Data Pengurus / Anggota' : 'Tambah Struktur / Anggota Seksi Bidang'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Posisi ini akan otomatis tampil di bagan struktur portal publik.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOrgMember} className="space-y-4 text-xs">
              {/* Optional Quick Account Picker */}
              {!editingMember && accounts.length > 0 && (
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <label className="block font-bold text-indigo-900 mb-1">
                    Isi Cepat dari Akun Pengurus Terdaftar (Opsional):
                  </label>
                  <select
                    value={selectedAccountToFill}
                    onChange={(e) => handleSelectAccountForAutofill(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Pilih Akun Siswa Terdaftar --</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.fullName} ({acc.kelas}) - Role: {acc.role}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Kategori Tingkat Hirarki */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Tingkat Hirarki Organisasi</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMemberKategori('sekbid');
                      setMemberPeranSekbid('anggota');
                      handleChangeSekbidNomor(memberSekbidNomor || 1);
                    }}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      memberKategori === 'sekbid' || memberKategori === 'anggota_sekbid'
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Seksi Bidang (Sekbid)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMemberKategori('bph');
                      setMemberJabatan('Wakil Ketua OSIS');
                    }}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      memberKategori === 'bph'
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Pengurus Harian (BPH)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMemberKategori('pembina');
                      setMemberJabatan('Pembina OSIS');
                    }}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      memberKategori === 'pembina'
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Pembina OSIS
                  </button>
                </div>
              </div>

              {/* Khusus Seksi Bidang: Pilih Sekbid & Peran (Koordinator vs Anggota) */}
              {(memberKategori === 'sekbid' || memberKategori === 'anggota_sekbid') && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Pilihan Seksi Bidang ({currentSekbids.length} Bidang Terdaftar)
                    </label>
                    <select
                      value={memberSekbidNomor || currentSekbids[0]?.nomor || 1}
                      onChange={(e) => handleChangeSekbidNomor(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                    >
                      {currentSekbids.map((s) => (
                        <option key={s.nomor} value={s.nomor}>
                          Sekbid {s.nomor}: {s.singkatan} ({s.nama})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      Peran / Posisi di Seksi Bidang #{memberSekbidNomor || 1}:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleChangePeranSekbid('anggota')}
                        className={`min-h-[40px] px-3 py-2 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                          memberPeranSekbid === 'anggota'
                            ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span>👤 Anggota Sekbid</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleChangePeranSekbid('koordinator')}
                        className={`min-h-[40px] px-3 py-2 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                          memberPeranSekbid === 'koordinator'
                            ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Crown className="w-4 h-4" />
                        <span>👑 Koordinator Sekbid</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Diri Anggota / Pejabat */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Siswa / Pejabat</label>
                <input
                  type="text"
                  required
                  value={memberNama}
                  onChange={(e) => setMemberNama(e.target.value)}
                  placeholder="Contoh: Muhammad Rayhan Daud"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jabatan Spesifik (Tampil di Sertifikat & Kartu)
                </label>
                <input
                  type="text"
                  required
                  value={memberJabatan}
                  onChange={(e) => setMemberJabatan(e.target.value)}
                  placeholder="Contoh: Anggota Sekbid 1: Keimanan & Ketaqwaan"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas Siswa (SMK Tridharma)</label>
                  <select
                    value={DAFTAR_KELAS.includes(memberKelas as any) ? memberKelas : ''}
                    onChange={(e) => {
                      if (e.target.value) setMemberKelas(e.target.value);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold mb-1.5"
                  >
                    <option value="">-- Pilih dari 7 Kelas Resmi --</option>
                    {DAFTAR_KELAS.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    value={memberKelas}
                    onChange={(e) => setMemberKelas(e.target.value)}
                    placeholder="Contoh: X Askep 1, XI Farmasi"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kontak / WhatsApp</label>
                  <input
                    type="text"
                    value={memberKontak}
                    onChange={(e) => setMemberKontak(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Photo Upload & Presets */}
              <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Foto Profil Pengurus / Anggota:</label>
                  <label className="cursor-pointer px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Unggah File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleMemberPhotoUpload}
                    />
                  </label>
                </div>

                {/* Quick Avatar Presets */}
                <div>
                  <div className="text-[10px] text-slate-500 mb-1.5">Pilih Preset Foto Cepat (1 Klik):</div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {VOCATIONAL_IMAGE_PRESETS.slice(8, 16).map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setMemberFotoUrl(preset.url)}
                        className={`w-9 h-9 rounded-xl overflow-hidden border-2 shrink-0 transition-transform ${
                          memberFotoUrl === preset.url ? 'border-indigo-600 scale-110 shadow-sm' : 'border-slate-300 opacity-80 hover:opacity-100'
                        }`}
                        title={preset.title}
                      >
                        <img src={preset.url} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  value={memberFotoUrl}
                  onChange={(e) => setMemberFotoUrl(e.target.value)}
                  placeholder="Atau tempel URL Foto..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-800 focus:outline-none"
                />

                {memberFotoUrl && (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden border border-slate-300 shrink-0 shadow-sm">
                      <img
                        src={memberFotoUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500">Pratinjau Foto Profil yang akan tampil di Portal Publik</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Motto / Visi Singkat Anggota (Opsional)</label>
                <textarea
                  rows={2}
                  value={memberVisi}
                  onChange={(e) => setMemberVisi(e.target.value)}
                  placeholder="Kutipan semangat pengurus untuk portal publik..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="min-h-[42px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
                >
                  {editingMember ? 'Simpan Perubahan' : 'Simpan ke Struktur Organisasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Seksi Bidang (Sekbid) */}
      {showSekbidModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {editingSekbid
                      ? `Edit Informasi Seksi Bidang #${editingSekbid.nomor}`
                      : 'Tambah Seksi Bidang Baru (OSIS)'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pengaturan bidang keorganisasian OSIS yang akan tampil di struktur & filter portal.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSekbidModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSekbid} className="space-y-4 text-xs">
              {/* Nomor & Singkatan */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Nomor Sekbid <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={sekbidNomorInput}
                    onChange={(e) => setSekbidNomorInput(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    Singkatan / Panggilan Bidang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sekbidSingkatanInput}
                    onChange={(e) => setSekbidSingkatanInput(e.target.value)}
                    placeholder="Contoh: Keimanan & Ketaqwaan"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Nama Lengkap Bidang */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nama Lengkap Seksi Bidang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={sekbidNamaInput}
                  onChange={(e) => setSekbidNamaInput(e.target.value)}
                  placeholder="Contoh: Ketaqwaan terhadap Tuhan Yang Maha Esa"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Deskripsi & Ruang Lingkup Tugas */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Deskripsi Ruang Lingkup Tugas & Program
                </label>
                <textarea
                  rows={3}
                  value={sekbidDeskripsiInput}
                  onChange={(e) => setSekbidDeskripsiInput(e.target.value)}
                  placeholder="Tuliskan fokus kegiatan, pembinaan siswa, dan amanah program kerja seksi bidang ini..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white leading-relaxed"
                ></textarea>
              </div>

              {/* Quick Preset Templates for new Sekbid */}
              {!editingSekbid && (
                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-1.5">
                  <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Inspirasi Cepat Bidang Vokasi / Khusus:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      {
                        nomor: currentSekbids.length + 1,
                        singkatan: 'Karir & Bursa Kerja (BKK)',
                        nama: 'Kemitraan Industri, Karir Vokasi & Bursa Kerja Khusus',
                        deskripsi: 'Kerjasama industri, persiapan magang prakerin, bursa kerja khusus dan jejaring alumni SMK.'
                      },
                      {
                        nomor: currentSekbids.length + 1,
                        singkatan: 'Riset & Karya Ilmiah',
                        nama: 'Riset Teknologi, Inovasi Siswa & Karya Ilmiah Remaja (KIR)',
                        deskripsi: 'Pengembangan penelitian vokasi, prototype inovasi karya ilmiah, dan lomba kompetensi siswa.'
                      },
                      {
                        nomor: currentSekbids.length + 1,
                        singkatan: 'Hubungan Masyarakat & Media',
                        nama: 'Hubungan Masyarakat, Komunikasi Publik & Siaran Sekolah',
                        deskripsi: 'Pemberitaan citra positif sekolah, siaran podcast siswa, dan relasi mitra organisasi eksternal.'
                      }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSekbidSingkatanInput(preset.singkatan);
                          setSekbidNamaInput(preset.nama);
                          setSekbidDeskripsiInput(preset.deskripsi);
                        }}
                        className="text-[10px] font-medium bg-white hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-lg border border-blue-200 transition-colors"
                      >
                        + {preset.singkatan}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSekbidModal(false)}
                  className="min-h-[42px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{editingSekbid ? 'Simpan Perubahan Bidang' : 'Tambahkan Seksi Bidang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT GURU PEMBINA SEKBID */}
      {showGuruPembinaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl border border-purple-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {editingGuruPembina ? 'Edit Data Guru Pembina Sekbid' : 'Tambah Guru Pembina Sekbid Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Dewan guru yang membina dan mendampingi pelaksanaan program kerja Sekbid OSIS.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowGuruPembinaModal(false);
                  setEditingGuruPembina(null);
                }}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGuruPembina} className="space-y-3.5 text-xs">
              {/* Field 1: Seksi Bidang Binaan */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Pilih Seksi Bidang yang Dibina <span className="text-rose-500">*</span>
                </label>
                <select
                  value={guruSekbidNomor}
                  onChange={(e) => setGuruSekbidNomor(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-purple-600 focus:bg-white"
                >
                  {currentSekbids.map((s) => (
                    <option key={s.nomor} value={s.nomor}>
                      Sekbid {s.nomor}: {s.singkatan} ({s.nama})
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2: Nama Lengkap Guru & Gelar */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nama Lengkap & Gelar Guru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={guruNama}
                  onChange={(e) => setGuruNama(e.target.value)}
                  placeholder="Contoh: Dra. Hj. Nurhidayah Daud, M.Pd."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-purple-600 focus:bg-white text-sm"
                />
              </div>

              {/* Field 3: NIP & Mata Pelajaran */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    NIP Guru (Opsional)
                  </label>
                  <input
                    type="text"
                    value={guruNip}
                    onChange={(e) => setGuruNip(e.target.value)}
                    placeholder="197405102000032004"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Mata Pelajaran / Posisi
                  </label>
                  <input
                    type="text"
                    value={guruMataPelajaran}
                    onChange={(e) => setGuruMataPelajaran(e.target.value)}
                    placeholder="Contoh: Guru Farmakologi / Agama"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Field 4: No WhatsApp */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nomor Kontak / WhatsApp
                </label>
                <input
                  type="text"
                  value={guruKontak}
                  onChange={(e) => setGuruKontak(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              {/* Field 5: Foto Guru */}
              <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs">Foto Profil Guru Pembina:</label>
                  <label className="cursor-pointer px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Unggah File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleGuruPhotoUpload}
                    />
                  </label>
                </div>

                {/* Preset Foto Guru */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {VOCATIONAL_IMAGE_PRESETS.slice(8, 16).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setGuruFotoUrl(preset.url)}
                      className={`w-9 h-9 rounded-xl overflow-hidden border-2 shrink-0 transition-transform ${
                        guruFotoUrl === preset.url ? 'border-purple-600 scale-110 shadow-sm' : 'border-slate-300 opacity-80 hover:opacity-100'
                      }`}
                      title={preset.title}
                    >
                      <img src={preset.url} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={guruFotoUrl}
                  onChange={(e) => setGuruFotoUrl(e.target.value)}
                  placeholder="URL Foto Guru..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-800 focus:outline-none"
                />
              </div>

              {/* Field 6: Arahan / Visi Pembinaan */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Pesan Visi / Arahan Pembinaan
                </label>
                <textarea
                  rows={2}
                  value={guruVisi}
                  onChange={(e) => setGuruVisi(e.target.value)}
                  placeholder="Arahan guru untuk memotivasi anggota sekbid dalam bertugas..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowGuruPembinaModal(false);
                    setEditingGuruPembina(null);
                  }}
                  className="min-h-[40px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{editingGuruPembina ? 'Simpan Perubahan Guru' : 'Simpan Guru Pembina'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPOR MASSAL DARI EXCEL */}
      {showBulkImportModal && (
        <BulkExcelImportModal
          isOpen={showBulkImportModal}
          onClose={() => setShowBulkImportModal(false)}
          existingAccounts={accounts}
          sekbidList={currentSekbids}
          schoolName={currentIdentity?.namaSekolah || 'SMK TRIDHARMA GORONTALO'}
          onCommitBulkMembers={handleCommitBulkMembers}
        />
      )}

      {/* MODAL KARTU TANDA ANGGOTA (KTA) */}
      {showKtaModal && (
        <KartuTandaAnggotaModal
          isOpen={showKtaModal}
          onClose={() => setShowKtaModal(false)}
          orgMembers={orgMembers}
          accounts={accounts}
          sekbidList={currentSekbids}
          schoolIdentity={currentIdentity}
        />
      )}
    </div>
  );
};
