# Design System & UI Specification: AnyLearn Dashboard

Dokumen ini adalah panduan spesifikasi antarmuka pengguna (UI) untuk dashboard platform edukasi **AnyLearn**. Desain ini mengusung gaya **Clean Modern EdTech** dengan karakteristik utama: dominasi warna putih bersih, pembatas garis tipis (*border-driven cards*), sudut membulat (*rounded corners*), serta penggunaan warna aksen pastel yang lembut untuk membedakan kategori item.

---

## 1. Color Palette (Palet Warna)

### Base & Backgrounds
* **App Canvas Background:** `#FFFFFF` (Putih bersih untuk area utama)
* **Secondary / Subtle Background:** `#F8FAFC` (Abu-abu sangat muda untuk *card* luar atau *hover state*)
* **Hero Banner Background:** `#F4F7FE` (Biru keabu-abuan sangat lembut)
* **Border / Divider Color:** `#E2E8F0` atau `#EDF2F7` (`1px solid` untuk membatasi setiap *card* dan *section*)

### Typography (Text Colors)
* **Text Primary (Heading & Title):** `#1E293B` (Dark Slate / Hitam keabu-abuan pekat)
* **Text Secondary (Body & Metadata):** `#64748B` (Muted Slate / Abu-abu sedang)
* **Text Muted (Placeholder & Sub-label):** `#94A3B8` (Abu-abu muda)
* **Text Brand / Highlight:** `#1D63FF` (Biru terang untuk judul *banner* dan menu aktif)

### Primary Brand & Status Colors
* **Primary Blue (Brand / Active / Completed):** `#1D63FF`
* **Primary Blue Light (Active Nav BG):** `#EBF2FF`
* **Success Green (Progress Bar / Running):** `#22C55E` (Track background: `#DCFCE7`)
* **Warning / Coral Red (To Start / Notification Dot):** `#FF6B6B`

### Pastel Accent System (Ikon, Card Author, & Tombol)
Desain ini menggunakan 4 kombinasi warna pastel utama secara berulang untuk ikon kursus, latar kartu *Popular Authors*, dan tombol *View Course*:

| Varian Pastel | Background (`bg`) | Button / Inner Pill (`bg-accent`) | Text / Icon Accent (`text`) |
| :--- | :--- | :--- | :--- |
| **Pastel Blue** | `#EAF2FF` | `#CFE2FF` | `#1D63FF` |
| **Pastel Yellow** | `#FFFBEB` | `#FEF0C7` | `#D97706` |
| **Pastel Green** | `#ECFDF3` | `#D1FADF` | `#059669` |
| **Pastel Pink/Coral** | `#FFF1F2` | `#FFE4E6` | `#E11D48` |
| **Pastel Purple** *(Opsional)* | `#F3E8FF` | `#E9D5FF` | `#7C3AED` |

---

## 2. Typography (Tipografi)

* **Recommended Font Family:** `'Plus Jakarta Sans'`, `'Poppins'`, atau `'Inter'`, sans-serif.
* **Font Scale & Weights:**
  * **Brand Logo:** `20px` (`1.25rem`) — Bold (`700`), Color: `#1E293B`
  * **Hero Banner Title:** `22px` (`1.375rem`) — Bold (`700`), Color: `#1D63FF`
  * **Section Headers (`Running Courses`, `Statistics`, dll.):** `15px` (`0.9375rem`) — SemiBold (`600`), Color: `#1E293B`
  * **Card Titles (Nama Kursus / Nama Author):** `14px` (`0.875rem`) — SemiBold (`600`), Color: `#1E293B`, Line-height: `1.4`
  * **Body / Banner Subtitle:** `13px` (`0.8125rem`) — Regular (`400`), Color: `#64748B`, Line-height: `1.6`
  * **Metadata (Jumlah Lecture, Jam, Role User):** `12px` (`0.75rem`) — Medium (`500`), Color: `#64748B`
  * **Micro Text / Badges (`VIEW COURSE`, `COURSES`, Rating, `%`):** `10px - 11px` — SemiBold/Bold (`600`/`700`), Uppercase untuk tombol.

---

## 3. Layout & Grid System

Struktur halaman menggunakan **Fixed Sidebar + Sticky Topbar + 2-Column Asymmetric Main Content**.

```text
+-------------------+-------------------------------------------------------------+
|                   |  Top Header (Search Bar, Notification, User Profile)        |
|                   +-----------------------------------------+-------------------+
|                   |  Hero Banner                            |                   |
|                   +-----------------------------------------+                   |
|   Left Sidebar    |  Running Courses (3-Column Grid)        |   Right Sidebar   |
|   (220px - 240px) |  [Card 1]     [Card 2]     [Card 3]     |   (Popular        |
|                   +---------------+-------------------------+    Authors &      |
|   - Logo          |  Statistics   |  New Courses            |    Featured       |
|   - Nav Menu      |  (1/3 Width)  |  (2/3 Width)            |    Subjects)      |
|   - Logout        |  [Donut Chart]|  [List of 4 Courses]    |   (~300px-320px)  |
+-------------------+---------------+-------------------------+-------------------+
```

### Dimensi & Spacing Utama:
* **Container Max-Width:** `1440px` (atau *full-screen* `100vw` dengan `height: 100vh` dan *scrollable main area*).
* **Left Sidebar Width:** `230px`, `border-right: 1px solid #E2E8F0`, `padding: 24px 16px`.
* **Top Header Height:** `72px`, `border-bottom: 1px solid #E2E8F0`, `padding: 0 32px`.
* **Main Content Wrapper:** `padding: 24px 32px`, `display: grid`, `grid-template-columns: 1fr 310px`, `gap: 24px`.

---

## 4. Borders, Radius & Shadows

UI ini **tidak mengandalkan drop-shadow tebal**, melainkan garis batas (*border*) yang rapi dan bersih:
* **Card Border:** `1px solid #E2E8F0`
* **Border Radius:**
  * **Large Container / Card Utama:** `16px` (`rounded-2xl`)
  * **Inner Cards (Item Kursus, Author Card, Nav Link):** `12px` (`rounded-xl`)
  * **Icon Box:** `10px` (`rounded-lg`)
  * **Buttons / Badges:** `6px - 8px` (`rounded-md`)
  * **Avatar & Chart:** `9999px` (`rounded-full`)
* **Shadows:** Hanya digunakan secara sangat halus pada *Donut Chart* (`0 10px 25px -5px rgba(29, 99, 255, 0.15)`) agar grafik terlihat menonjol.

---

## 5. Spesifikasi Komponen Detail

### A. Left Sidebar (Navigasi Kiri)
1. **Brand Header:**
   * Ikon buku berwarna biru (`#1D63FF`, ukuran `32x32px`, `border-radius: 8px`) dengan aksen pita/bookmark putih di bagian atas.
   * Teks **"AnyLearn"** di sebelah kanan ikon (`gap: 12px`).
2. **Navigation List (`margin-top: 40px`):**
   * Item vertikal dengan `gap: 8px`.
   * Setiap item memiliki `padding: 12px 16px`, `border-radius: 10px`, ikon di kiri (`18px`) + teks menu (`14px`, Medium).
   * **Active State (`Dashboard`):** Background `#EBF2FF`, teks dan ikon `#1D63FF`, font-weight `600`.
   * **Inactive State (`Courses`, `Schedules`, `Settings`, `Helps`):** Background `transparent`, teks dan ikon `#64748B`. Hover: `background: #F8FAFC`.
3. **Bottom Action (`Logout`):**
   * Diletakkan di bagian paling bawah (`margin-top: auto`).
   * Ikon panah keluar + teks "Logout" berwarna `#64748B`.

### B. Top Header
1. **Search Bar (Kiri):**
   * Ikon kaca pembesar (`#64748B`) + Input tanpa *border* (`placeholder: "Search courses"`, warna `#94A3B8`, lebar `300px`).
2. **User Actions (Kanan):**
   * **Notification Bell:** Ikon lonceng *outline* dengan titik merah kecil (`6px`, `#FF6B6B`) di kanan atasnya.
   * **User Profile:** Teks rata kanan (`shashik.design` tebal `#1E293B` di atas, `UI/UX designer` `#94A3B8` di bawah) + Avatar bulat (`40x40px`) dengan latar hijau pastel di sebelah kanannya.

### C. Hero Banner
* **Container:** `background: #F4F7FE`, `border: 1px solid #E2E8F0`, `border-radius: 16px`, `padding: 24px 32px`, `position: relative`, `display: flex`, `justify-content: space-between`, `align-items: center`.
* **Konten Kiri (`max-width: 60%`):**
  * Heading: *"Expand Career opportunities via AnyLearn!!"* (`#1D63FF`, `22px`, Bold).
  * Subheading: *"Learn anytime, anywhere. Enhance your skills with the flexible online courses."* (`#475569`, `13px`, `margin-top: 8px`).
* **Konten Kanan:** Ilustrasi vektor karakter menggunakan laptop (`height: ~100px`).
* **Pagination Dots (Tengah Bawah):** 3 titik bulat (`6px`). Titik aktif berwarna `#1D63FF`, titik pasif berwarna `#CBD5E1`.

### D. Running Courses (Grid 3 Kolom)
* **Section Header:** Teks `"Running Courses"` di kiri + tombol teks `"All ->"` (`13px`, `#1E293B`) di kanan.
* **Grid:** `grid-template-columns: repeat(3, 1fr)`, `gap: 16px`.
* **Course Card Item:**
  * Container: `background: #FFFFFF`, `border: 1px solid #E2E8F0`, `border-radius: 16px`, `padding: 16px`.
  * **Top Row:**
    * Kiri: Kotak Ikon Pastel (`44x44px`, `border-radius: 10px`) + Judul Kursus (2 baris, `14px`, SemiBold).
    * Kanan Atas: Badge Rating (`background: #F1F5F9`, `padding: 3px 8px`, `border-radius: 6px`, ikon bintang abu-abu + angka `4.5` ukuran `11px`).
  * **Middle Row (Metadata):** `margin-top: 16px`, `display: flex`, `flex-direction: column`, `gap: 6px`.
    * Baris 1: Ikon buku kecil + `"20 Lectures / 09 Hours"` (`12px`, `#64748B`).
    * Baris 2: Ikon user kecil + Nama Instruktur mis. `"Steve Jobs"` (`12px`, `#64748B`).
  * **Bottom Row (Progress Bar):** `margin-top: 14px`.
    * Persentase (`90%`, `11px`, `#64748B`) di kanan atas *bar*.
    * Track bar: `height: 5px`, `background: #DCFCE7`, `border-radius: 99px`.
    * Fill bar: `background: #22C55E`, lebar sesuai persentase (`90%`, `50%`, `70%`).

### E. Statistics (Donut Chart Card)
* **Container:** Lebar sekitar `35%` dari baris bawah. `border: 1px solid #E2E8F0`, `border-radius: 16px`, `padding: 20px`, `display: flex`, `flex-direction: column`, `align-items: center`.
* **Header Internal:** Ikon menu 3 titik (`...`) dalam lingkaran abu-abu muda di pojok kanan atas *card*.
* **Donut Chart:**
  * Ukuran lingkaran: `~160x160px`, ketebalan *stroke* sekitar `18px`, memiliki jeda putih tipis (`gap`) antar segmen.
  * Segmen: Biru `#1D63FF` (70%), Hijau `#22C55E` (20%), Merah/Coral `#FF6B6B` (10%).
  * Teks Tengah: Angka `"15"` (`20px`, Bold, `#1E293B`) + `"Total Courses"` (`11px`, `#64748B`).
* **Legend (Bawah Chart):** Grid 3 kolom rata tengah (`margin-top: 24px`, `gap: 16px`).
  * Setiap item memiliki: Ikon cincin berlubang (`12x12px`, `border: 2.5px solid [Warna Segmen]`), Angka persentase tebal (`70%`), dan label status (`Completed`, `Running`, `To Start` dalam warna `#94A3B8`).

### F. New Courses (Vertical List Card)
* **Container Luar:** Lebar sekitar `65%` dari baris bawah. `background: #F8FAFC` (atau putih dengan `border: 1px solid #E2E8F0`), `border-radius: 16px`, `padding: 16px`, berisi 4 kartu horizontal yang ditumpuk (`display: flex`, `flex-direction: column`, `gap: 12px`).
* **Course List Item:**
  * Container: `background: #FFFFFF`, `border: 1px solid #E2E8F0`, `border-radius: 12px`, `padding: 12px 16px`, `display: flex`, `align-items: center`, `justify-content: space-between`.
  * Kiri: Kotak Ikon Pastel (`40x40px`) + Info Teks (Judul kursus `13.5px` SemiBold di atas, `"20 Lectures / 25 Hours"` `12px` `#64748B` di bawah).
  * Kanan: Tombol `"VIEW COURSE"` (`padding: 8px 14px`, `border-radius: 8px`, `font-size: 10px`, Bold, warna *background* dan teks mengikuti tema pastel masing-masing baris: Biru, Hijau, Kuning, Pink).

### G. Right Sidebar (Popular Authors & Featured Subjects)
Seluruh kolom kanan dibungkus dalam **satu kartu tinggi** (`border: 1px solid #E2E8F0`, `border-radius: 16px`, `padding: 20px`).

1. **Popular Authors Section:**
   * **Header:** `"Popular Authors"` (`15px`, SemiBold, `margin-bottom: 16px`).
   * **List:** 5 kartu ditumpuk vertikal (`gap: 10px`).
   * **Author Item Card:**
     * Seluruh latar kartu menggunakan warna pastel lembut (Biru, Kuning, Hijau, Pink, Hijau). `padding: 10px 12px`, `border-radius: 12px`, `display: flex`, `align-items: center`, `justify-content: space-between`.
     * Kiri: Avatar foto profil bulat (`38x38px`) + Teks (Nama Author `13px` SemiBold `#1E293B` + `"5 Design Courses"` `11px` `#64748B`).
     * Kanan: Badge/Tombol kecil `"COURSES"` (`padding: 5px 10px`, `border-radius: 6px`, `font-size: 9px`, Bold, warna sedikit lebih pekat dari latar belakang kartu).

2. **Featured Subjects Section (`margin-top: 28px`):**
   * **Header:** `"Featured Subjects"` (`15px`, SemiBold, `margin-bottom: 12px`).
   * **List:** 4 item baris teks yang dipisahkan oleh garis bawah (`border-bottom: 1px solid #F1F5F9`, kecuali item terakhir).
   * **Subject Item:** `padding: 12px 0`, `display: flex`, `align-items: center`, `justify-content: space-between`, `cursor: pointer`.
     * Kiri: Nama Subjek (`Graphic Design`, `Cyber Security`, dll. — `13.5px`, SemiBold, `#1E293B`) + Sub-label jumlah kursus (`25 Courses` — `11.5px`, `#64748B`, `margin-top: 2px`).
     * Kanan: Ikon panah kanan (`->`, `#1E293B`, `16px`).

---

## 6. Rekomendasi Tech Stack untuk Implementasi

Jika kamu ingin mengimplementasikan desain ini ke website kamu dengan cepat dan presisi:
* **CSS Framework:** **Tailwind CSS** (sangat cocok karena sistem *border*, *pastel color*, dan *grid*-nya bisa langsung dipetakan ke *utility classes*).
* **Icon Library:** **Lucide Icons** (`lucide-react`) atau **Heroicons** (gunakan varian *outline* dengan `stroke-width: 1.75` atau `2`).
* **Chart Library:** **Chart.js** (`react-chartjs-2`) atau **Recharts** (`PieChart` dengan `innerRadius` dan `outerRadius` serta `paddingAngle={4}`).