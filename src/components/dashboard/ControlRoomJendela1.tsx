import React, { useState } from 'react';
import { UserAccount, OrgMember, UserRole, SchoolIdentityConfig, OSIS_SEKBID_LIST, SekbidDefinition } from '../../types/erp';
import { VOCATIONAL_IMAGE_PRESETS } from '../../data/imagePresets';
import { INITIAL_SCHOOL_IDENTITY } from '../../data/schoolIdentityPresets';
import { SchoolLogoManager } from './SchoolLogoManager';
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
  AlertCircle
} from 'lucide-react';

interface ControlRoomJendela1Props {
  currentUser: UserAccount;
  accounts: UserAccount[];
  orgMembers: OrgMember[];
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
}

export const ControlRoomJendela1: React.FC<ControlRoomJendela1Props> = ({
  currentUser,
  accounts,
  orgMembers,
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
}) => {
  const currentSekbids = sekbidList && sekbidList.length > 0 ? sekbidList : OSIS_SEKBID_LIST;

  const [activeTab, setActiveTab] = useState<'accounts' | 'structure' | 'identity'>('accounts');
  const [structureFilter, setStructureFilter] = useState<'sekbid' | 'bph' | 'semua'>('sekbid');
  const [selectedSekbidNomor, setSelectedSekbidNomor] = useState<number | 'semua'>('semua');
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [selectedAccountToFill, setSelectedAccountToFill] = useState<string>('');

  // Form New Account State
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [nisn, setNisn] = useState('');
  const [role, setRole] = useState<UserRole>('anggota');
  const [jabatan, setJabatan] = useState('');
  const [kelas, setKelas] = useState('');
  const [telepon, setTelepon] = useState('');

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

  // Submit Account
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !fullName.trim()) return;

    onAddAccount({
      username: username.trim().toLowerCase(),
      password: password.trim(),
      fullName: fullName.trim(),
      nisn: nisn.trim() || '0000000000',
      role,
      jabatan: jabatan.trim() || 'Pengurus OSIS',
      kelas: kelas.trim() || 'SMK Tridharma',
      telepon: telepon.trim() || '-',
      isActive: true,
    });

    setShowAddAccountModal(false);
    setUsername('');
    setPassword('');
    setFullName('');
    setNisn('');
    setJabatan('');
    setKelas('');
    setTelepon('');
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

          <button
            onClick={onViewPublicPortal}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-colors whitespace-nowrap shadow-sm"
          >
            <span>Cek Tampilan Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
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
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
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
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
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

            <button
              onClick={() => setShowAddAccountModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftarkan Pengurus Baru</span>
            </button>
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
                onClick={() => handleOpenAddMember('sekbid', 'koordinator')}
                className="min-h-[42px] px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>+ Posisi Struktur</span>
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

      {/* Modal Add Account */}
      {showAddAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>Pendaftaran Akun Pengurus Baru</span>
              </h3>
              <button
                onClick={() => setShowAddAccountModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Mohamad Rivaldo Daud"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Username Login</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="rivaldo.daud"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Password Awal</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kombinasi sandi"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Hak Akses (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ketua">Ketua Umum OSIS</option>
                    <option value="wakil">Wakil Ketua OSIS</option>
                    <option value="sekretaris">Sekretaris OSIS</option>
                    <option value="bendahara">Bendahara OSIS</option>
                    <option value="sekbid">Koordinator Sekbid</option>
                    <option value="anggota">Anggota Pengurus</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">NISN</label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="0078912345"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Jabatan Spesifik</label>
                <input
                  type="text"
                  required
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Contoh: Koordinator Sekbid 5 (Demokrasi & HAM)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kelas / Jurusan</label>
                  <input
                    type="text"
                    required
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    placeholder="XI TKJ 1"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    placeholder="0812xxxx"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
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
                  <label className="block font-bold text-slate-700 mb-1">Kelas / Jurusan Vokasi</label>
                  <input
                    type="text"
                    required
                    value={memberKelas}
                    onChange={(e) => setMemberKelas(e.target.value)}
                    placeholder="Contoh: X RPL / XI TKJ 1"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
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
    </div>
  );
};
