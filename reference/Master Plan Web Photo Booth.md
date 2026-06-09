# **MASTER PLAN & CONCEPT PAPER**

## **Enterprise-Grade Web-Based Photo Booth System**

**Dokumen Versi:** 1.0

**Peran Sistem:** Aplikasi *Photo Booth Cross-Platform* (OS-Agnostic)

**Arsitektur Inti:** *Thick-Client* (Edge Processing) dengan *Serverless Backend*

## **1\. EXECUTIVE SUMMARY**

Proyek ini bertujuan untuk mengembangkan sistem *photo booth* kelas profesional yang sepenuhnya berbasis web (*web-based*). Mengambil inspirasi dari perangkat lunak *native* terkemuka seperti LumaBooth, sistem ini dirancang untuk mendemokratisasi akses *photo booth* sehingga dapat dijalankan di perangkat apapun (Windows, macOS, iPadOS, Android) hanya melalui peramban web modern (Google Chrome/Safari).

Dengan menggeser paradigma pemrosesan dari server terpusat ke klien (*Client-side edge processing* menggunakan HTML5 Canvas & WebGL) dan didukung oleh infrastruktur *Serverless* (Vercel), sistem ini menawarkan skalabilitas tinggi, biaya operasional infrastruktur mendekati nol, latensi rendah, serta kemampuan pengoperasian luring (*offline-tolerant*).

## **2\. SYSTEM ARCHITECTURE & TOPOLOGY**

Sistem mengadopsi pola arsitektur **Hybrid Edge-Cloud**. Sebagian besar komputasi berat dilakukan di perangkat pengguna (*Edge/Client*), sementara *Cloud* hanya menangani persistensi data dan integrasi pihak ketiga.

### **2.1. Tumpukan Teknologi (Tech Stack)**

* **Aplikasi Inti (Frontend):** Next.js (React) \- Dipilih karena dukungan SSR/SSG dan ekosistem *routing* yang matang.  
* **Desain Antarmuka (UI/UX):** Tailwind CSS & Framer Motion (untuk animasi transisi standar aplikasi *native*).  
* **Akses Perangkat Keras:** WebRTC (MediaDevices API) untuk kontrol kamera penuh (Resolusi, *Aspect Ratio*, *Facing Mode*).  
* **Pemrosesan Media (Edge):**  
  * *Image Composition:* HTML5 \<canvas\> API.  
  * *Video/GIF:* MediaRecorder API dan gif.js (Web Workers).  
  * *AI Segmentation (Green Screen):* TensorFlow.js / MediaPipe Selfie Segmentation.  
* **Backend & Gateway:** Vercel Serverless Functions (API Routes).  
* **Basis Data & Penyimpanan:** Supabase (PostgreSQL untuk relasi data acara/tamu, dan Storage untuk arsip foto).

### **2.2. Data Flow Diagram (High-Level)**

1. **Capture:** Peramban mengambil *stream* kamera ![][image1] *User* menekan tombol ![][image1] Bingkai (*frame*) dibekukan.  
2. **Process:** Kanvas HTML menggabungkan *raw photo*, *filter/LUT*, dan *overlay* PNG transparan di memori RAM perangkat lokal.  
3. **Output:** Kanvas menghasilkan *Base64* / *Blob Image*.  
4. **Sync:** *Blob* diunggah ke Vercel API (secara asinkron) ![][image1] Disimpan di Supabase Storage ![][image1] Mengembalikan URL Publik.  
5. **Share:** URL Publik diubah menjadi QR Code di layar / dikirim melalui WhatsApp Gateway API.

## **3\. FEATURE SPECIFICATIONS (LUMABOOTH PARITY MAP)**

Berdasarkan referensi fungsionalitas aplikasi *native* tingkat lanjut, berikut adalah spesifikasi modul yang akan dibangun dan strategi implementasinya di platform web:

### **3.1. Modul Persiapan Sesi (Pre-Session)**

* **Welcome Screen Engine:** Layar siaga (*standby*) yang mendukung latar belakang video MP4 atau gambar statis, lengkap dengan elemen judul dinamis yang dapat diatur via dasbor.  
* **Disclaimer & Survey Modals:** \* *Syarat & Ketentuan:* Tamu harus menekan "Setuju" (*I Agree*) sebelum kamera aktif.  
  * *Survei Tamu:* Formulir pop-up untuk mengumpulkan data (contoh: Nama, Email, Pesan untuk penyelenggara acara).  
* **Virtual Attendant (Audio Cues):** Sistem injeksi audio HTML5 (\<audio\>) yang memutar berkas MP3 berdasarkan *Event Trigger* (misal: "Bersiaplah\!", "Lihat ke kamera", "Senyum\!").

### **3.2. Modul Pemotretan (Capture Engine)**

* **Mode Operasi:**  
  * *Single Photo:* 1 jepretan standar.  
  * *Multi-Photo (Strip):* 3-4 jepretan beruntun dengan interval *delay* yang dapat diatur, dikomposisikan ke dalam desain vertikal/horizontal.  
  * *GIF / Boomerang:* Perekaman *burst frames* yang dirender menjadi animasi *looping*.  
* **Camera Configuration:** Pemetaan kontrol kamera (ISO, *Exposure*) secara virtual menggunakan MediaTrackConstraints dari WebRTC (tergantung dukungan perangkat/browser keras).

### **3.3. Modul Pemrosesan Gambar (Post-Processing)**

* **Dynamic Overlay:** Penempelan stiker digital, logo perusahaan, atau desain bingkai (PNG) secara presisi menggunakan koordinat X/Y di Kanvas.  
* **AI Background Removal (Green Screen tanpa layar):** Menggunakan model ML *on-device* ringan untuk memisahkan subjek dari latar belakang, menggantinya dengan gambar digital.  
* **CSS Image Filters:** Filter instan (Glamour, B\&W, Sepia) menggunakan atribut filter pada CSS sebelum dirender permanen di Kanvas.

### **3.4. Modul Distribusi (Sharing & Printing)**

* **Instant QR Generation:** Merender QR Code dinamis berisi tautan foto.  
* **WhatsApp/Email Integration:** Memanfaatkan API Serverless untuk berinteraksi dengan penyedia layanan SMTP (Resend/SendGrid) atau API WhatsApp.  
* **Kiosk Auto-Print:** Strategi mencetak tanpa klik ganda dengan memanfaatkan fitur sistem operasi: mode *Kiosk Printing* (Chrome \--kiosk-printing), yang akan langsung mengirim *buffer* gambar ke *default printer*.

### **3.5. Modul Administrasi (Control & Dashboard)**

* **Settings Lock PIN:** Menyembunyikan dan mengunci menu pengaturan URL (/settings) dengan lapisan enkripsi PIN lokal (*localStorage*) agar tamu tidak bisa mengubah konfigurasi acara.  
* **Cloud Dashboard (Fase Lanjutan):** Pusat komando (CMS) tempat penyelenggara acara mendesain *layout*, mengunggah *overlay*, dan memantau analitik foto (*Sharing Status*).

## **4\. TECHNICAL CHALLENGES & MITIGATION STRATEGY**

Berjalan di dalam peramban web (*browser*) membawa batasan akses OS. Berikut adalah mitigasi teknisnya:

| Risiko / Tantangan | Dampak | Strategi Mitigasi Arsitektural |
| :---- | :---- | :---- |
| **Izin Kamera Terblokir** | Sistem tidak berfungsi. | Mewajibkan penggunaan HTTPS. Memberikan panduan UI yang jelas jika deteksi getUserMedia gagal. |
| **Koneksi Internet Terputus** | Gagal *upload* & *share*. | Implementasi **PWA (Progressive Web App)** dan **Service Workers**. Foto yang belum terunggah akan diantrekan di *IndexedDB* (Penyimpanan lokal browser) dan akan diunggah otomatis di latar belakang saat jaringan kembali (*Background Sync*). |
| **Memory Leak (Performa turun)** | Browser *crash* setelah berjam-jam dipakai. | *Garbage Collection* ketat. Membersihkan memori (*clear* Blob dan URL objek) secara paksa setelah setiap sesi tamu selesai menggunakan fungsi *React Cleanup*. |
| **Auto-Print Terhalang Dialog** | Mengganggu pengalaman *seamless*. | Menyiapkan panduan setup mesin fisik untuk menjalankan Chrome OS / Windows Edge dalam *Target Command* khusus (Mode Kiosk). |

## **5\. PHASED IMPLEMENTATION ROADMAP (MILESTONES)**

Pendekatan *Agile* diusulkan dengan rilis bertahap untuk memvalidasi *Proof of Concept* sejak dini.

### **Phase 1: Foundation & "The Core Loop" (Bulan 1\)**

* **Fokus:** Membuat prototipe mesin *capture* dasar yang stabil.  
* **Deliverables:** UI Kiosk layar penuh, akses dan pergantian kamera (*front/back*), penghitungan mundur, pengambilan foto tunggal, penempatan bingkai (*overlay*) transparan, tombol '*Retake*' atau '*Print*' standar, pembersihan state.

### **Phase 2: Offline Resilience & Sharing (Bulan 2\)**

* **Fokus:** Infrastruktur data dan manajemen aset luring.  
* **Deliverables:** Integrasi Vercel API & Supabase. Konversi aplikasi menjadi PWA yang dapat diinstal (ikon di *desktop*). Layar *sharing* dengan dinamis QR Code. Antrean *IndexedDB* untuk sinkronisasi latar belakang jika internet mati.

### **Phase 3: The "Luma-Parity" UX Upgrade (Bulan 3\)**

* **Fokus:** Pengalaman tamu yang imersif dan interaktif.  
* **Deliverables:** Fitur *Virtual Attendant* (injeksi MP3 *timeline*), penambahan *Pre-Session Modals* (Survey/Syarat Ketentuan), Menu Pengaturan *Lock PIN* di klien, Mode tata letak *Multi-Photo* (Strips).

### **Phase 4: Pro Media & AI Features (Bulan 4+)**

* **Fokus:** Kemampuan kompetitif tingkat lanjut.  
* **Deliverables:** Mode Perekaman GIF/Boomerang, filter wajah (penghalusan/Beauty Mode), dan penghapusan latar belakang AI (MediaPipe WebGL).

### **Phase 5: Commercial SaaS Dashboard (Masa Depan)**

* **Fokus:** Komersialisasi & Organisasi.  
* **Deliverables:** Portal *login* terpisah untuk *Event Organizer*. Kemampuan membuat *Event ID*, mengunggah aset bingkai (*drag-and-drop builder*), melihat log pengunjung, dan integrasi *Payment Gateway* (QRIS) untuk bilik foto ritel berbayar mandiri (*Self-service mall booth*).

## **6\. KESIMPULAN ARSITEKTURAL**

Membangun *Photo Booth* berbasis Web dengan menggunakan pendekatan *Serverless* dan *Client-Side Processing* adalah lompatan modern yang sangat layak (*feasible*) dan efisien. Sistem ini menghindari proses rumit seperti pemeliharaan server Python/OpenCV 24/7 dan masalah *packaging desktop installer* (.exe / .dmg).

Dengan menguasai manipulasi manipulasi HTML5 \<canvas\> dan API Peramban generasi terbaru, sistem yang dibangun akan memiliki ketangguhan aplikasi *native* dengan fleksibilitas luar biasa dari ekosistem Web.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAoUlEQVR4XmNgGAWjYGCBgoICh5ycXJqoqCgPuhwlgFFeXr4VaLAxugRFAGQg0OBeIJMFXY4SwAgMhgKg4XEgNrokGAAVCABtliQFKykpAc2Umw9kT1ZRUeFDN5MsICsrawI0cLW0tLQMuhxZAGiQMNDAxYqKivLocmQDoIFZwCCLQBcnG4DSKdDQqTIyMtLocpQARnV1dV4QjS4xCkYBjQAAvNgWekn9kccAAAAASUVORK5CYII=>