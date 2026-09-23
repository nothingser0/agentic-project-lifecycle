# Schedule Health Guide — Deteksi dan Koreksi Keterlambatan

**Purpose:** Memberi AI agent mekanisme konkret untuk mendeteksi proyek yang terus molor
dan mensurface-nya ke user — bukan hanya mencatat dan melanjutkan.

**When to use:** Setiap checkpoint di Build Loop (Medium+), setiap kali `TASKS.md` diupdate
dengan milestone baru yang selesai atau bergeser.

---

## Kapan Health Check Dijalankan

| Event | Trigger |
|---|---|
| Milestone selesai | Catat actual vs. planned date, hitung slip |
| Milestone bergeser | Jalankan health check sebelum update `TIMELINE.md` |
| Setiap 3 milestone selesai | Jalankan rolling health check otomatis |
| User menambah scope | Jalankan sebelum menerima scope baru |

---

## Cara Menghitung Schedule Health

### Step 1 — Kumpulkan data dari TASKS.md / TIMELINE.md

Untuk setiap milestone yang sudah selesai, catat:

```
Milestone | Planned Date | Actual Date | Slip (hari)
M1        | 2026-09-10   | 2026-09-10  | 0
M2        | 2026-09-17   | 2026-09-19  | +2
M3        | 2026-09-24   | 2026-09-29  | +5
```

### Step 2 — Hitung rata-rata slip

```
Average slip = total slip days / number of completed milestones
Contoh: (0 + 2 + 5) / 3 = 2.3 hari rata-rata slip per milestone
```

### Step 3 — Terapkan threshold

| Kondisi | Status | Tindakan |
|---|---|---|
| Rata-rata slip = 0, tidak ada milestone yang slip >20% | 🟢 **On Track** | Lanjut normal |
| 1–2 milestone berturut-turut slip, OR rata-rata slip 1–3 hari | 🟡 **At Risk** | Surface ke user, tawarkan scope trim |
| 3+ milestone berturut-turut slip, OR rata-rata slip >3 hari, OR slip kumulatif >20% total timeline | 🔴 **Off Track** | Stop, wajib surface ke user sebelum lanjut |

---

## Tindakan per Status

### 🟢 On Track
Tidak ada tindakan khusus. Catat di checkpoint ledger:
```
Schedule health: 🟢 On track (0 slipped milestones)
```

### 🟡 At Risk

Surface ke user dengan format ini — jangan hanya catat di file lalu lanjut:

```
⚠️ Schedule health: AT RISK

Milestone yang terlambat: M2 (+2 hari), M3 (+5 hari)
Rata-rata slip: 2.3 hari per milestone
Proyeksi: jika tren ini berlanjut, target selesai bergeser +[N] hari dari baseline

Opsi:
A) Trim scope — fitur mana yang bisa ditunda ke next session?
B) Extend timeline — geser target selesai secara resmi (buat CR)
C) Tambah kapasitas — ada resource tambahan?

Pilih salah satu sebelum saya lanjut ke milestone berikutnya.
```

Jangan lanjut build sampai user memilih opsi.

### 🔴 Off Track

Stop build. Surface ke user dengan format ini:

```
🔴 Schedule health: OFF TRACK — perlu keputusan sebelum lanjut

3 milestone berturut-turut terlambat:
- M2: +2 hari
- M3: +5 hari  
- M4: +4 hari
Rata-rata slip: 3.7 hari per milestone
Kumulatif slip: +11 hari (dari baseline total [N] hari)

Ini pola, bukan kejadian tunggal. Perlu root cause:
- Estimasi terlalu optimis?
- Scope lebih besar dari yang diperkirakan?
- Ada blocker teknis yang terus muncul?

Wajib buat Change Request (CR) sebelum melanjutkan — pakai template
templates/pm/CHANGE_REQUEST_TEMPLATE.md.

Setelah CR disetujui, saya update TIMELINE.md dan lanjut.
```

Agent **tidak boleh melanjutkan build** sampai user merespons dan CR dibuat.

---

## Integrasi dengan CONTEXT.md

Setiap kali health check dijalankan, tambahkan field ini ke CONTEXT.md:

```
schedule_health: [green | yellow | red]
last_health_check: [YYYY-MM-DD]
cumulative_slip_days: [N]
slipped_milestones: [N dari total M yang sudah selesai]
```

Jika `schedule_health: red` dan tidak ada CR yang tercatat di `docs/pm/changes/`,
agent harus menolak melanjutkan build meski user meminta — ini bukan opsional.

---

## Contoh Checkpoint Ledger dengan Health Check (Medium+)

```
Done: M1-auth, M2-dashboard.
Building: M3-employee-CRUD.
Queued: M4-role-nav, M5-CSV-export.
Added this session: CSV export (pushed role-nav ke berikutnya).

Schedule health: 🟡 AT RISK
- M2 selesai +2 hari dari plan
- Proyeksi: M3 mungkin +2-3 hari juga jika pola berlanjut
- Sudah surface ke user → user pilih trim scope (defer CSV ke Phase 2)
- CR-001 dibuat dan disetujui
```

---

## Catatan untuk Solo Projects / Small Tier

- Small tier: tidak wajib formal health check, tapi agent tetap harus menyebut jika terasa "ini lebih lama dari perkiraan"
- Solo developer Medium+: jalankan health check tapi sederhanakan output — tidak perlu formal CR, cukup satu paragraf keputusan di `docs/dev-docs/DECISIONS.md`
