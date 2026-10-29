/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  UserAccount, 
  OrgMember, 
  ProgramKerja, 
  PresensiRecord, 
  SuratDokumen, 
  RapatItem, 
  TransaksiKas, 
  InventarisBarang, 
  JadwalPiketItem, 
  AspirasiSiswa, 
  GaleriKegiatan, 
  HeroBanner,
  SchoolGeoConfig,
  AgendaHarianSekretaris,
  SystemModulesConfig,
  SchoolIdentityConfig,
  SekbidDefinition,
  OSIS_SEKBID_LIST
} from './types/erp';
import { 
  INITIAL_ACCOUNTS, 
  INITIAL_ORG_MEMBERS, 
  INITIAL_PROKER, 
  INITIAL_PRESENSI, 
  INITIAL_SURAT, 
  INITIAL_RAPAT, 
  INITIAL_TRANSAKSI_KAS, 
  INITIAL_INVENTARIS, 
  INITIAL_JADWAL_PIKET, 
  INITIAL_ASPIRASI, 
  INITIAL_GALERI, 
  INITIAL_HERO_BANNERS,
  INITIAL_AGENDA_SEKRETARIS,
  INITIAL_SYSTEM_MODULES 
} from './data/initialData';
import { INITIAL_SCHOOL_IDENTITY } from './data/schoolIdentityPresets';
import { SCHOOL_GEO_CONFIG } from './utils/geoUtils';

import { PublicPortal } from './components/public/PublicPortal';
import { DashboardLayout, DashboardView } from './components/dashboard/DashboardLayout';
import { ControlRoomJendela1 } from './components/dashboard/ControlRoomJendela1';
import { ControlRoomJendela2 } from './components/dashboard/ControlRoomJendela2';
import { GeoLocationConfigMaps } from './components/dashboard/GeoLocationConfigMaps';
import { PortalPengurus } from './components/dashboard/PortalPengurus';
import { GaleriMediaManager } from './components/dashboard/GaleriMediaManager';
import { PresensiGeofencing } from './components/dashboard/PresensiGeofencing';
import { SuratGenerator } from './components/dashboard/SuratGenerator';
import { ManajemenRapat } from './components/dashboard/ManajemenRapat';
import { KeuanganKas } from './components/dashboard/KeuanganKas';
import { InventarisAset } from './components/dashboard/InventarisAset';
import { JadwalPiket } from './components/dashboard/JadwalPiket';
import { AspirasiManager } from './components/dashboard/AspirasiManager';
import { LoginModal } from './components/auth/LoginModal';
import { BlueprintDocument } from './components/blueprint/BlueprintDocument';
import { VercelDatabaseGuideModal } from './components/guide/VercelDatabaseGuideModal';
import { saveAs } from 'file-saver';
import { 
  getSupabaseClient, 
  pullDataFromCloud, 
  pushDataToCloud 
} from './services/cloudDatabase';

export default function App() {
  // Main Navigation Mode
  const [appMode, setAppMode] = useState<'public' | 'dashboard' | 'blueprint'>('public');
  const [dashboardView, setDashboardView] = useState<DashboardView>('jendela1');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showVercelGuideModal, setShowVercelGuideModal] = useState<boolean>(false);

  // Persistent States
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('td_erp_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('td_erp_current_user');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS[0]; // Default Bapak Ilham Arief, S.Pd.
  });

  const [orgMembers, setOrgMembers] = useState<OrgMember[]>(() => {
    const saved = localStorage.getItem('td_erp_org_members');
    return saved ? JSON.parse(saved) : INITIAL_ORG_MEMBERS;
  });

  const [prokerList, setProkerList] = useState<ProgramKerja[]>(() => {
    const saved = localStorage.getItem('td_erp_proker');
    return saved ? JSON.parse(saved) : INITIAL_PROKER;
  });

  const [systemModules, setSystemModules] = useState<SystemModulesConfig>(() => {
    const saved = localStorage.getItem('td_erp_modules');
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_MODULES;
  });

  const [presensiList, setPresensiList] = useState<PresensiRecord[]>(() => {
    const saved = localStorage.getItem('td_erp_presensi');
    return saved ? JSON.parse(saved) : INITIAL_PRESENSI;
  });

  const [suratList, setSuratList] = useState<SuratDokumen[]>(() => {
    const saved = localStorage.getItem('td_erp_surat');
    return saved ? JSON.parse(saved) : INITIAL_SURAT;
  });

  const [rapatList, setRapatList] = useState<RapatItem[]>(() => {
    const saved = localStorage.getItem('td_erp_rapat');
    return saved ? JSON.parse(saved) : INITIAL_RAPAT;
  });

  const [transaksiList, setTransaksiList] = useState<TransaksiKas[]>(() => {
    const saved = localStorage.getItem('td_erp_transaksi');
    return saved ? JSON.parse(saved) : INITIAL_TRANSAKSI_KAS;
  });

  const [inventarisList, setInventarisList] = useState<InventarisBarang[]>(() => {
    const saved = localStorage.getItem('td_erp_inventaris');
    return saved ? JSON.parse(saved) : INITIAL_INVENTARIS;
  });

  const [jadwalPiket, setJadwalPiket] = useState<JadwalPiketItem[]>(() => {
    const saved = localStorage.getItem('td_erp_piket');
    return saved ? JSON.parse(saved) : INITIAL_JADWAL_PIKET;
  });

  const [aspirasiList, setAspirasiList] = useState<AspirasiSiswa[]>(() => {
    const saved = localStorage.getItem('td_erp_aspirasi');
    return saved ? JSON.parse(saved) : INITIAL_ASPIRASI;
  });

  const [galeriList, setGaleriList] = useState<GaleriKegiatan[]>(() => {
    const saved = localStorage.getItem('td_erp_galeri');
    return saved ? JSON.parse(saved) : INITIAL_GALERI;
  });

  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>(() => {
    const saved = localStorage.getItem('td_erp_hero_banners');
    return saved ? JSON.parse(saved) : INITIAL_HERO_BANNERS;
  });

  const [schoolGeoConfig, setSchoolGeoConfig] = useState<SchoolGeoConfig>(() => {
    const saved = localStorage.getItem('td_erp_geo_config');
    return saved ? JSON.parse(saved) : SCHOOL_GEO_CONFIG;
  });

  const [agendaSekretaris, setAgendaSekretaris] = useState<AgendaHarianSekretaris>(() => {
    const saved = localStorage.getItem('td_erp_agenda_sekretaris');
    return saved ? JSON.parse(saved) : INITIAL_AGENDA_SEKRETARIS;
  });

  const [schoolIdentity, setSchoolIdentity] = useState<SchoolIdentityConfig>(() => {
    const saved = localStorage.getItem('td_erp_school_identity');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOL_IDENTITY;
  });

  const [sekbidList, setSekbidList] = useState<SekbidDefinition[]>(() => {
    const saved = localStorage.getItem('td_erp_sekbid_list');
    return saved ? JSON.parse(saved) : OSIS_SEKBID_LIST;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('td_erp_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('td_erp_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('td_erp_org_members', JSON.stringify(orgMembers));
  }, [orgMembers]);

  useEffect(() => {
    localStorage.setItem('td_erp_proker', JSON.stringify(prokerList));
  }, [prokerList]);

  useEffect(() => {
    localStorage.setItem('td_erp_modules', JSON.stringify(systemModules));
  }, [systemModules]);

  useEffect(() => {
    localStorage.setItem('td_erp_presensi', JSON.stringify(presensiList));
  }, [presensiList]);

  useEffect(() => {
    localStorage.setItem('td_erp_surat', JSON.stringify(suratList));
  }, [suratList]);

  useEffect(() => {
    localStorage.setItem('td_erp_rapat', JSON.stringify(rapatList));
  }, [rapatList]);

  useEffect(() => {
    localStorage.setItem('td_erp_transaksi', JSON.stringify(transaksiList));
  }, [transaksiList]);

  useEffect(() => {
    localStorage.setItem('td_erp_inventaris', JSON.stringify(inventarisList));
  }, [inventarisList]);

  useEffect(() => {
    localStorage.setItem('td_erp_aspirasi', JSON.stringify(aspirasiList));
  }, [aspirasiList]);

  useEffect(() => {
    localStorage.setItem('td_erp_galeri', JSON.stringify(galeriList));
  }, [galeriList]);

  useEffect(() => {
    localStorage.setItem('td_erp_hero_banners', JSON.stringify(heroBanners));
  }, [heroBanners]);

  useEffect(() => {
    localStorage.setItem('td_erp_geo_config', JSON.stringify(schoolGeoConfig));
  }, [schoolGeoConfig]);

  useEffect(() => {
    localStorage.setItem('td_erp_agenda_sekretaris', JSON.stringify(agendaSekretaris));
  }, [agendaSekretaris]);

  useEffect(() => {
    localStorage.setItem('td_erp_school_identity', JSON.stringify(schoolIdentity));
  }, [schoolIdentity]);

  useEffect(() => {
    localStorage.setItem('td_erp_sekbid_list', JSON.stringify(sekbidList));
  }, [sekbidList]);

  // Initial pull from Supabase Cloud if configured
  useEffect(() => {
    async function initCloudSync() {
      const client = getSupabaseClient();
      if (!client) return;

      try {
        const [
          cloudAccounts,
          cloudMembers,
          cloudSekbids,
          cloudProker,
          cloudPresensi,
          cloudSurat,
          cloudRapat,
          cloudKas,
          cloudAset,
          cloudPiket,
          cloudAspirasi,
          cloudGaleri,
          cloudBanners,
          cloudIdentity,
        ] = await Promise.all([
          pullDataFromCloud('accounts'),
          pullDataFromCloud('orgMembers'),
          pullDataFromCloud('sekbidList'),
          pullDataFromCloud('prokerList'),
          pullDataFromCloud('presensiList'),
          pullDataFromCloud('suratList'),
          pullDataFromCloud('rapatList'),
          pullDataFromCloud('transaksiList'),
          pullDataFromCloud('inventarisList'),
          pullDataFromCloud('jadwalPiket'),
          pullDataFromCloud('aspirasiList'),
          pullDataFromCloud('galeriList'),
          pullDataFromCloud('heroBanners'),
          pullDataFromCloud('schoolIdentity'),
        ]);

        if (cloudAccounts && Array.isArray(cloudAccounts) && cloudAccounts.length > 0) setAccounts(cloudAccounts);
        if (cloudMembers && Array.isArray(cloudMembers) && cloudMembers.length > 0) setOrgMembers(cloudMembers);
        if (cloudSekbids && Array.isArray(cloudSekbids) && cloudSekbids.length > 0) setSekbidList(cloudSekbids);
        if (cloudProker && Array.isArray(cloudProker)) setProkerList(cloudProker);
        if (cloudPresensi && Array.isArray(cloudPresensi)) setPresensiList(cloudPresensi);
        if (cloudSurat && Array.isArray(cloudSurat)) setSuratList(cloudSurat);
        if (cloudRapat && Array.isArray(cloudRapat)) setRapatList(cloudRapat);
        if (cloudKas && Array.isArray(cloudKas)) setTransaksiList(cloudKas);
        if (cloudAset && Array.isArray(cloudAset)) setInventarisList(cloudAset);
        if (cloudPiket && Array.isArray(cloudPiket)) setJadwalPiket(cloudPiket);
        if (cloudAspirasi && Array.isArray(cloudAspirasi)) setAspirasiList(cloudAspirasi);
        if (cloudGaleri && Array.isArray(cloudGaleri)) setGaleriList(cloudGaleri);
        if (cloudBanners && Array.isArray(cloudBanners)) setHeroBanners(cloudBanners);
        if (cloudIdentity && cloudIdentity.namaSekolah) setSchoolIdentity(cloudIdentity);
      } catch (err) {
        console.warn('Gagal sinkronisasi cloud awal:', err);
      }
    }

    initCloudSync();
  }, []);

  // Debounced auto-push to Supabase Cloud on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const client = getSupabaseClient();
      if (!client) return;
      pushDataToCloud('accounts', accounts);
      pushDataToCloud('orgMembers', orgMembers);
      pushDataToCloud('sekbidList', sekbidList);
      pushDataToCloud('prokerList', prokerList);
      pushDataToCloud('presensiList', presensiList);
      pushDataToCloud('suratList', suratList);
      pushDataToCloud('rapatList', rapatList);
      pushDataToCloud('transaksiList', transaksiList);
      pushDataToCloud('inventarisList', inventarisList);
      pushDataToCloud('jadwalPiket', jadwalPiket);
      pushDataToCloud('aspirasiList', aspirasiList);
      pushDataToCloud('galeriList', galeriList);
      pushDataToCloud('heroBanners', heroBanners);
      pushDataToCloud('schoolIdentity', schoolIdentity);
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    accounts,
    orgMembers,
    sekbidList,
    prokerList,
    presensiList,
    suratList,
    rapatList,
    transaksiList,
    inventarisList,
    jadwalPiket,
    aspirasiList,
    galeriList,
    heroBanners,
    schoolIdentity,
  ]);

  // Export all system data into a single JSON file
  const handleExportAllData = () => {
    const backupBundle = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      namaSekolah: schoolIdentity.namaSekolah,
      data: {
        accounts,
        orgMembers,
        sekbidList,
        prokerList,
        presensiList,
        suratList,
        rapatList,
        transaksiList,
        inventarisList,
        jadwalPiket,
        aspirasiList,
        galeriList,
        heroBanners,
        schoolGeoConfig,
        agendaSekretaris,
        schoolIdentity,
        systemModules,
      },
    };

    const blob = new Blob([JSON.stringify(backupBundle, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const dateStr = new Date().toISOString().split('T')[0];
    saveAs(blob, `backup-erp-osis-smk-tridharma-${dateStr}.json`);
  };

  // Import system data from JSON file
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const data = parsed.data || parsed;

        if (data.accounts) setAccounts(data.accounts);
        if (data.orgMembers) setOrgMembers(data.orgMembers);
        if (data.sekbidList) setSekbidList(data.sekbidList);
        if (data.prokerList) setProkerList(data.prokerList);
        if (data.presensiList) setPresensiList(data.presensiList);
        if (data.suratList) setSuratList(data.suratList);
        if (data.rapatList) setRapatList(data.rapatList);
        if (data.transaksiList) setTransaksiList(data.transaksiList);
        if (data.inventarisList) setInventarisList(data.inventarisList);
        if (data.jadwalPiket) setJadwalPiket(data.jadwalPiket);
        if (data.aspirasiList) setAspirasiList(data.aspirasiList);
        if (data.galeriList) setGaleriList(data.galeriList);
        if (data.heroBanners) setHeroBanners(data.heroBanners);
        if (data.schoolGeoConfig) setSchoolGeoConfig(data.schoolGeoConfig);
        if (data.agendaSekretaris) setAgendaSekretaris(data.agendaSekretaris);
        if (data.schoolIdentity) setSchoolIdentity(data.schoolIdentity);
        if (data.systemModules) setSystemModules(data.systemModules);

        // Auto push imported data to Supabase if connected
        const client = getSupabaseClient();
        if (client) {
          Object.keys(data).forEach((key) => {
            pushDataToCloud(key, data[key]);
          });
        }

        alert('Data berhasil dipulihkan dari file cadangan JSON!');
      } catch (err: any) {
        alert('Gagal membaca file cadangan: ' + (err?.message || 'Format JSON tidak valid'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handlers for Seksi Bidang (Sekbid)
  const handleAddSekbid = (newSek: SekbidDefinition) => {
    setSekbidList((prev) => [...prev, newSek]);
  };

  const handleUpdateSekbid = (updSek: SekbidDefinition, oldNomor?: number) => {
    const targetNomor = oldNomor !== undefined ? oldNomor : updSek.nomor;
    setSekbidList((prev) =>
      prev.map((s) => (s.nomor === targetNomor ? updSek : s))
    );
    // Update any linked org members so their sekbidNama and jabatan stay synchronized
    setOrgMembers((prev) =>
      prev.map((m) => {
        if ((m.kategori === 'sekbid' || m.kategori === 'anggota_sekbid') && m.sekbidNomor === targetNomor) {
          const isKoord = m.peranSekbid === 'koordinator' || m.jabatan.toLowerCase().includes('koordinator');
          return {
            ...m,
            sekbidNomor: updSek.nomor,
            sekbidNama: updSek.nama,
            jabatan: isKoord
              ? `Koordinator Sekbid ${updSek.nomor}: ${updSek.singkatan}`
              : `Anggota Sekbid ${updSek.nomor}: ${updSek.singkatan}`,
          };
        }
        return m;
      })
    );
  };

  const handleDeleteSekbid = (nomor: number) => {
    setSekbidList((prev) => prev.filter((s) => s.nomor !== nomor));
  };

  // Check if current user is Executive (Pembina or BPH)
  const isExecutiveUser = currentUser
    ? ['pembina', 'ketua', 'wakil', 'sekretaris', 'bendahara'].includes(currentUser.role)
    : true;

  // Public Aspirasi Addition
  const handleAddAspirasi = (
    item: Omit<AspirasiSiswa, 'id' | 'tiketKode' | 'tanggal' | 'status'>
  ): string => {
    const newId = `asp-${Date.now()}`;
    const newCode = `ASP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: AspirasiSiswa = {
      ...item,
      id: newId,
      tiketKode: newCode,
      tanggal: new Date().toISOString().split('T')[0],
      status: 'Masuk',
    };
    setAspirasiList([newRecord, ...aspirasiList]);
    return newCode;
  };

  // Switch to Dashboard
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setShowLoginModal(false);
    setAppMode('dashboard');
    const isExec = ['pembina', 'ketua', 'wakil', 'sekretaris', 'bendahara'].includes(user.role);
    if (isExec) {
      setDashboardView('jendela1');
    }
  };

  // Reset to initial demo data if needed
  const handleResetDemoData = () => {
    if (confirm('Kembalikan seluruh data simulasi ke awal?')) {
      localStorage.clear();
      setAccounts(INITIAL_ACCOUNTS);
      setOrgMembers(INITIAL_ORG_MEMBERS);
      setProkerList(INITIAL_PROKER);
      setSystemModules(INITIAL_SYSTEM_MODULES);
      setPresensiList(INITIAL_PRESENSI);
      setSuratList(INITIAL_SURAT);
      setRapatList(INITIAL_RAPAT);
      setTransaksiList(INITIAL_TRANSAKSI_KAS);
      setInventarisList(INITIAL_INVENTARIS);
      setAspirasiList(INITIAL_ASPIRASI);
      setGaleriList(INITIAL_GALERI);
      setHeroBanners(INITIAL_HERO_BANNERS);
      setSchoolGeoConfig(SCHOOL_GEO_CONFIG);
      setAgendaSekretaris(INITIAL_AGENDA_SEKRETARIS);
      setSchoolIdentity(INITIAL_SCHOOL_IDENTITY);
      setSekbidList(OSIS_SEKBID_LIST);
      setCurrentUser(INITIAL_ACCOUNTS[0]);
    }
  };

  // Render Blueprint Screen
  if (appMode === 'blueprint') {
    return <BlueprintDocument onBackToApp={() => setAppMode('public')} />;
  }

  // Render Public Portal
  if (appMode === 'public') {
    return (
      <>
        <PublicPortal
          schoolIdentity={schoolIdentity}
          prokerList={prokerList}
          orgMembers={orgMembers}
          sekbidList={sekbidList}
          galeriList={galeriList}
          heroBanners={heroBanners}
          aspirasiList={aspirasiList}
          onAddAspirasi={handleAddAspirasi}
          onOpenLogin={() => setShowLoginModal(true)}
          onOpenBlueprint={() => setAppMode('blueprint')}
          onOpenVercelGuide={() => setShowVercelGuideModal(true)}
        />

        {showLoginModal && (
          <LoginModal
            accounts={accounts}
            schoolIdentity={schoolIdentity}
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => setShowLoginModal(false)}
          />
        )}

        {showVercelGuideModal && (
          <VercelDatabaseGuideModal
            isOpen={showVercelGuideModal}
            onClose={() => setShowVercelGuideModal(false)}
            onExportAllData={handleExportAllData}
            onImportData={handleImportData}
          />
        )}
      </>
    );
  }

  // Render Dedicated Operational Portal for Pengurus (Sekbid & Anggota)
  // Khusus hanya untuk melakukan Presensi Geofencing GPS & Update Hasil Proker
  if (appMode === 'dashboard' && !isExecutiveUser && currentUser) {
    return (
      <>
        <PortalPengurus
          currentUser={currentUser}
          allAccounts={accounts}
          orgMembers={orgMembers}
          sekbidList={sekbidList}
          schoolIdentity={schoolIdentity}
          prokerList={prokerList}
          presensiList={presensiList}
          currentGeoConfig={schoolGeoConfig}
          jadwalPiket={jadwalPiket}
          agendaSekretaris={agendaSekretaris}
          onAddPresensi={(record) => {
            const newRec: PresensiRecord = {
              ...record,
              id: `prs-${Date.now()}`,
            };
            setPresensiList([newRec, ...presensiList]);
          }}
          onUpdateProker={(updPrk) => {
            setProkerList(prokerList.map((p) => (p.id === updPrk.id ? updPrk : p)));
          }}
          onSwitchUser={(user) => {
            setCurrentUser(user);
          }}
          onLogout={() => {
            setAppMode('public');
          }}
          onOpenPublicPortal={() => setAppMode('public')}
          onOpenVercelGuide={() => setShowVercelGuideModal(true)}
        />

        {showVercelGuideModal && (
          <VercelDatabaseGuideModal
            isOpen={showVercelGuideModal}
            onClose={() => setShowVercelGuideModal(false)}
            onExportAllData={handleExportAllData}
            onImportData={handleImportData}
          />
        )}
      </>
    );
  }

  // Render Executive Dashboard ERP (Pembina & BPH: Ketua, Wakil, Sekretaris, Bendahara)
  return (
    <>
      <DashboardLayout
        currentUser={currentUser || accounts[0]}
        allAccounts={accounts}
        currentView={dashboardView}
        systemModules={systemModules}
        schoolIdentity={schoolIdentity}
        onSelectView={setDashboardView}
        onSwitchUser={(user) => setCurrentUser(user)}
        onLogout={() => {
          setAppMode('public');
        }}
        onOpenPublicPortal={() => setAppMode('public')}
        onOpenBlueprint={() => setAppMode('blueprint')}
        onOpenVercelGuide={() => setShowVercelGuideModal(true)}
      >
        {/* VIEW 1: CONTROL ROOM JENDELA 1 */}
        {dashboardView === 'jendela1' && (
          <ControlRoomJendela1
            currentUser={currentUser || accounts[0]}
            accounts={accounts}
            orgMembers={orgMembers}
            sekbidList={sekbidList}
            onAddSekbid={handleAddSekbid}
            onUpdateSekbid={handleUpdateSekbid}
            onDeleteSekbid={handleDeleteSekbid}
            currentIdentity={schoolIdentity}
            onSaveIdentity={setSchoolIdentity}
            onAddAccount={(newAcc) => {
              const created: UserAccount = {
                ...newAcc,
                id: `usr-${Date.now()}`,
                createdAt: new Date().toISOString().split('T')[0],
              };
              setAccounts([...accounts, created]);
            }}
            onUpdateAccount={(updAcc) => {
              setAccounts(accounts.map((a) => (a.id === updAcc.id ? updAcc : a)));
            }}
            onDeleteAccount={(id) => {
              setAccounts(accounts.filter((a) => a.id !== id));
            }}
            onAddOrgMember={(newMem) => {
              const created: OrgMember = {
                ...newMem,
                id: `org-${Date.now()}`,
              };
              setOrgMembers([...orgMembers, created]);
            }}
            onUpdateOrgMember={(updMem) => {
              setOrgMembers(orgMembers.map((m) => (m.id === updMem.id ? updMem : m)));
            }}
            onDeleteOrgMember={(id) => {
              setOrgMembers(orgMembers.filter((m) => m.id !== id));
            }}
            onViewPublicPortal={() => setAppMode('public')}
          />
        )}

        {/* VIEW 2: CONTROL ROOM JENDELA 2 */}
        {dashboardView === 'jendela2' && (
          <ControlRoomJendela2
            prokerList={prokerList}
            systemModules={systemModules}
            onAddProker={(newPrk) => {
              const created: ProgramKerja = {
                ...newPrk,
                id: `prk-${Date.now()}`,
                updatedAt: new Date().toISOString().split('T')[0],
              };
              setProkerList([...prokerList, created]);
            }}
            onUpdateProker={(updPrk) => {
              setProkerList(prokerList.map((p) => (p.id === updPrk.id ? updPrk : p)));
            }}
            onDeleteProker={(id) => {
              setProkerList(prokerList.filter((p) => p.id !== id));
            }}
            onToggleModule={(modKey) => {
              setSystemModules({
                ...systemModules,
                [modKey]: !systemModules[modKey],
              });
            }}
          />
        )}

        {/* VIEW: MEDIA & VISUAL LAMAN PUBLIK */}
        {dashboardView === 'galeri' && (
          <GaleriMediaManager
            currentUser={currentUser || accounts[0]}
            galeriList={galeriList}
            heroBanners={heroBanners}
            onAddGaleri={(newGlr) => {
              const created: GaleriKegiatan = {
                ...newGlr,
                id: `glr-${Date.now()}`,
              };
              setGaleriList([created, ...galeriList]);
            }}
            onUpdateGaleri={(updGlr) => {
              setGaleriList(galeriList.map((g) => (g.id === updGlr.id ? updGlr : g)));
            }}
            onDeleteGaleri={(id) => {
              setGaleriList(galeriList.filter((g) => g.id !== id));
            }}
            onAddHeroBanner={(newBan) => {
              const created: HeroBanner = {
                ...newBan,
                id: `hb-${Date.now()}`,
              };
              setHeroBanners([...heroBanners, created]);
            }}
            onUpdateHeroBanner={(updBan) => {
              setHeroBanners(heroBanners.map((b) => (b.id === updBan.id ? updBan : b)));
            }}
            onDeleteHeroBanner={(id) => {
              setHeroBanners(heroBanners.filter((b) => b.id !== id));
            }}
            onViewPublicPortal={() => setAppMode('public')}
          />
        )}

        {/* VIEW: PENGATURAN LOKASI PRESENSI (VISUAL MAPS) */}
        {dashboardView === 'geomaps' && (
          <GeoLocationConfigMaps
            currentUser={currentUser || accounts[0]}
            currentGeoConfig={schoolGeoConfig}
            onSaveGeoConfig={(newConfig) => {
              setSchoolGeoConfig(newConfig);
            }}
            onNavigateToPresensi={() => setDashboardView('presensi')}
          />
        )}

        {/* VIEW 3: PRESENSI GEOFENCING */}
        {dashboardView === 'presensi' && (
          <PresensiGeofencing
            currentUser={currentUser || accounts[0]}
            presensiList={presensiList}
            currentGeoConfig={schoolGeoConfig}
            agendaSekretaris={agendaSekretaris}
            onUpdateAgendaSekretaris={(updated) => setAgendaSekretaris(updated)}
            onNavigateToMapsConfig={() => setDashboardView('geomaps')}
            onAddPresensi={(record) => {
              const newRec: PresensiRecord = {
                ...record,
                id: `prs-${Date.now()}`,
              };
              setPresensiList([newRec, ...presensiList]);
            }}
            onUpdatePresensi={(updated) => {
              setPresensiList(presensiList.map((p) => (p.id === updated.id ? updated : p)));
            }}
            onBatchValidatePresensi={(ids, status, catatan) => {
              const now = new Date();
              const timeStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]} WITA`;
              setPresensiList(
                presensiList.map((p) => {
                  if (ids.includes(p.id)) {
                    return {
                      ...p,
                      isValidatedByPembina: status === 'Disetujui Sah',
                      statusValidasiPembina: status,
                      validatedBy: currentUser?.fullName || 'Ilham Arief, S.Pd. (Pembina OSIS)',
                      validatedAt: timeStr,
                      catatanPembina: catatan || p.catatanPembina || 'Divalidasi langsung oleh Pembina OSIS.',
                    };
                  }
                  return p;
                })
              );
            }}
          />
        )}

        {/* VIEW 4: SURAT GENERATOR */}
        {dashboardView === 'surat' && (
          <SuratGenerator
            currentUser={currentUser || accounts[0]}
            suratList={suratList}
            schoolIdentity={schoolIdentity}
            onAddSurat={(newSurat) => {
              const created: SuratDokumen = {
                ...newSurat,
                id: `srt-${Date.now()}`,
                createdAt: new Date().toISOString().split('T')[0],
              };
              setSuratList([created, ...suratList]);
            }}
            onUpdateSurat={(updSurat) => {
              setSuratList(suratList.map((s) => (s.id === updSurat.id ? updSurat : s)));
            }}
            onDeleteSurat={(id) => {
              setSuratList(suratList.filter((s) => s.id !== id));
            }}
          />
        )}

        {/* VIEW 5: MANAJEMEN RAPAT */}
        {dashboardView === 'rapat' && (
          <ManajemenRapat
            currentUser={currentUser || accounts[0]}
            rapatList={rapatList}
            accounts={accounts}
            onAddRapat={(newRapat) => {
              const created: RapatItem = {
                ...newRapat,
                id: `rpt-${Date.now()}`,
              };
              setRapatList([created, ...rapatList]);
            }}
            onUpdateRapat={(updRapat) => {
              setRapatList(rapatList.map((r) => (r.id === updRapat.id ? updRapat : r)));
            }}
            onDeleteRapat={(id) => {
              setRapatList(rapatList.filter((r) => r.id !== id));
            }}
          />
        )}

        {/* VIEW 6: KEUANGAN KAS */}
        {dashboardView === 'keuangan' && (
          <KeuanganKas
            currentUser={currentUser || accounts[0]}
            transaksiList={transaksiList}
            onAddTransaksi={(newTr) => {
              const created: TransaksiKas = {
                ...newTr,
                id: `tr-${Date.now()}`,
              };
              setTransaksiList([created, ...transaksiList]);
            }}
            onDeleteTransaksi={(id) => {
              setTransaksiList(transaksiList.filter((t) => t.id !== id));
            }}
          />
        )}

        {/* VIEW 7: INVENTARIS ASET */}
        {dashboardView === 'inventaris' && (
          <InventarisAset
            currentUser={currentUser || accounts[0]}
            inventarisList={inventarisList}
            onAddInventaris={(newItem) => {
              const created: InventarisBarang = {
                ...newItem,
                id: `inv-${Date.now()}`,
                riwayatPeminjaman: [],
              };
              setInventarisList([...inventarisList, created]);
            }}
            onUpdateInventaris={(updItem) => {
              setInventarisList(
                inventarisList.map((item) => (item.id === updItem.id ? updItem : item))
              );
            }}
            onDeleteInventaris={(id) => {
              setInventarisList(inventarisList.filter((item) => item.id !== id));
            }}
          />
        )}

        {/* VIEW 8: JADWAL PIKET */}
        {dashboardView === 'piket' && (
          <JadwalPiket
            currentUser={currentUser || accounts[0]}
            jadwalList={jadwalPiket}
            presensiList={presensiList}
            agendaSekretaris={agendaSekretaris}
            onUpdateAgendaSekretaris={(updated) => setAgendaSekretaris(updated)}
            onNavigateToPresensi={() => setDashboardView('presensi')}
          />
        )}

        {/* VIEW 9: MODERASI ASPIRASI */}
        {dashboardView === 'aspirasi' && (
          <AspirasiManager
            currentUser={currentUser || accounts[0]}
            aspirasiList={aspirasiList}
            onUpdateAspirasi={(updAsp) => {
              setAspirasiList(aspirasiList.map((a) => (a.id === updAsp.id ? updAsp : a)));
            }}
            onDeleteAspirasi={(id) => {
              setAspirasiList(aspirasiList.filter((a) => a.id !== id));
            }}
          />
        )}
      </DashboardLayout>
      {showVercelGuideModal && (
        <VercelDatabaseGuideModal
          isOpen={showVercelGuideModal}
          onClose={() => setShowVercelGuideModal(false)}
          onExportAllData={handleExportAllData}
          onImportData={handleImportData}
        />
      )}
    </>
  );
}
