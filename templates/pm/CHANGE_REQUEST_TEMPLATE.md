# Change Request — {CR-ID}

> **Output file location:** `docs/pm/changes/CR-{ID}.md`
> **When to fill:** Setiap kali ada permintaan perubahan scope, timeline, atau budget setelah
> baseline disepakati (Gate R). Jangan mulai kerja perubahan sebelum CR ini disetujui.
> **Solo/personal project:** sederhanakan — cukup catat di `docs/dev-docs/DECISIONS.md`,
> tidak perlu file CR terpisah.

---

## Identifikasi

| Field | Value |
|---|---|
| **CR ID** | CR-{ID} (contoh: CR-001) |
| **Tanggal permintaan** | {YYYY-MM-DD} |
| **Diminta oleh** | {nama / role} |
| **Diajukan ke** | {nama approver — lihat Q65g di CONTEXT.md} |

---

## Deskripsi Perubahan

**Apa yang berubah:**
{Deskripsikan perubahan yang diminta secara konkret — fitur apa yang ditambah/dihapus/diubah,
atau constraint mana yang bergeser. Hindari bahasa ambigu seperti "enhance" atau "improve."}

**Mengapa perlu berubah:**
{Alasan bisnis atau teknis — bukan justifikasi post-hoc, tapi trigger nyata yang memunculkan
permintaan ini: temuan user research, perubahan regulasi, feedback stakeholder, blockers teknis.}

---

## Dampak (Impact Assessment)

### Scope
- [ ] Menambah fitur / deliverable baru
- [ ] Mengurangi / menghapus fitur yang sudah direncanakan
- [ ] Mengubah spesifikasi fitur yang sudah ada
- [ ] Tidak ada perubahan scope (hanya timeline/budget)

**Detail scope delta:** {apa yang masuk / keluar dari baseline}

### Timeline
| | Sebelum | Setelah |
|---|---|---|
| Milestone terdampak | {nama milestone} | {nama milestone yang sama} |
| Target selesai | {tanggal baseline} | {tanggal baru} |
| Slip | — | {+N hari / minggu} |

**Milestones downstream yang ikut bergeser:** {daftar milestone yang jadwalnya terpengaruh secara tidak langsung}

### Budget / Resources
| | Sebelum | Setelah |
|---|---|---|
| Estimasi jam tambahan | — | {+N jam} |
| Estimasi biaya tambahan | — | {+Rp/$/€ N} |
| Resource yang dibutuhkan | — | {siapa / apa} |

### Risiko
{Risiko baru yang muncul akibat perubahan ini, atau risiko lama yang meningkat. Format:
"Jika [X], maka [Y konsekuensi]." Minimum 1 entri — jika tidak ada risiko sama sekali,
tuliskan "No new risks identified" secara eksplisit.}

---

## Opsi

### Opsi A — Terima perubahan sepenuhnya (recommended / not recommended)
- Dampak: {ringkasan dampak dari tabel di atas}
- Trade-off: {apa yang dikorbankan}

### Opsi B — Terima sebagian (jika ada alternatif)
- {apa yang diterima vs. apa yang ditolak / ditunda}
- Dampak: {…}

### Opsi C — Tolak perubahan
- Alasan: {mengapa menolak adalah pilihan valid}
- Konsekuensi menolak: {…}

---

## Keputusan

**Opsi yang dipilih:** {A / B / C}

**Disetujui oleh:** {nama, role}
**Tanggal keputusan:** {YYYY-MM-DD}
**Catatan:** {kondisi, syarat, atau hal yang perlu dimonitor pasca-approval}

---

## Update yang Diperlukan Setelah CR Disetujui

```
□ TASKS.md — tambah / hapus / ubah task sesuai keputusan
□ docs/pm/TIMELINE.md — update baseline milestone yang bergeser
□ docs/pm/RISK-REGISTER.md — tambah risiko baru jika ada
□ docs/pm/CHANGE-LOG.md — catat CR ini (satu baris ringkasan)
□ CONTEXT.md — update last_milestone dan next_action jika fase berubah
□ Stakeholder terdampak diberitahu (lihat COMMUNICATION-PLAN.md)
```

**CR ini tidak boleh ditutup sampai semua checkbox di atas selesai.**
