# RepairHub

RepairHub, müşterilerin, cihazların ve tamir süreçlerinin tek bir platform üzerinden yönetilmesini amaçlayan full-stack bir web uygulamasıdır.

Proje, müşteri bilgilerini ve cihazlara ait tamir kayıtlarını dijital ortamda düzenli bir şekilde takip etmeyi kolaylaştırmak için geliştirilmiştir.

## Canlı Demo

**[RepairHub'ı canlı incele](https://repair-hub-jade.vercel.app)**

## Temel Özellikler

- Müşteri kayıtlarını görüntüleme ve yönetme
- Cihaz bilgilerini yönetme
- Tamir kayıtlarını takip etme
- React tabanlı web arayüzü üzerinden API ile iletişim kurma
- PostgreSQL veritabanında verileri saklama

## Kullanılan Teknolojiler

**Frontend**
- React
- Vite
- JavaScript

**Backend**
- C#
- ASP.NET Core Web API
- Entity Framework Core
- .NET 10

**Veritabanı**
- PostgreSQL
- Supabase

**Deployment**
- Vercel — Frontend
- Render — Backend

## Projeyi Yerel Ortamda Çalıştırma

### Gereksinimler

- Node.js ve npm
- .NET 10 SDK
- PostgreSQL veya yapılandırılmış Supabase veritabanı bağlantısı

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

Backend API projesini `backend` klasöründeki çözüm üzerinden çalıştırabilirsiniz. Uygulamayı başlatmadan önce veritabanı bağlantı ayarlarının yapılandırılması gerekir.

## Projenin Amacı

RepairHub, modern web teknolojileri kullanarak frontend, backend ve veritabanı katmanlarını bir araya getiren bir uygulama geliştirme ve bunu bulut ortamında yayınlama çalışmasıdır.
