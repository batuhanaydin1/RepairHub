
import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'https://repairhub-d5q1.onrender.com/api/customers'
const SERVICE_API_URL = 'https://repairhub-d5q1.onrender.com/api/service-records'

const emptyForm = {
  fullName: '',
  phone: '',
  email: '',
}

const emptyServiceForm = {
  customerId: '',
  deviceName: '',
  problemDescription: '',
  status: 'Onarım bekliyor',
  price: '',
}

const pages = [
  { id: 'dashboard', label: 'Genel Bakış', icon: '▦' },
  { id: 'customers', label: 'Müşteriler', icon: '♙' },
  { id: 'services', label: 'Servis Takibi', icon: '⚙' },
  { id: 'new-service', label: 'Yeni Servis', icon: '+' },
]

function App() {
  const [customers, setCustomers] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [servicesLoading, setServicesLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [serviceForm, setServiceForm] = useState(emptyServiceForm)
  const [editingId, setEditingId] = useState(null)
  const [editingServiceId, setEditingServiceId] = useState(null)
  const [savingService, setSavingService] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')

  // Servis arama ve filtreleme durumları
  const [serviceSearch, setServiceSearch] = useState('')
  const [serviceStatusFilter, setServiceStatusFilter] = useState('all')

  async function loadCustomers() {
    try {
      setLoading(true)
      const response = await fetch(API_URL)

      if (!response.ok) throw new Error('Müşteriler yüklenemedi.')

      const data = await response.json()
      setCustomers(data)

      setServiceForm((previous) => ({
        ...previous,
        customerId:
          previous.customerId || (data.length ? String(data[0].id) : ''),
      }))
      setError('')
    } catch {
      setError('Müşteriler yüklenemedi. Backend çalışıyor mu kontrol et.')
    } finally {
      setLoading(false)
    }
  }

  async function loadServices() {
    try {
      setServicesLoading(true)
      const response = await fetch(SERVICE_API_URL)

      if (!response.ok) throw new Error('Servis kayıtları yüklenemedi.')

      setServices(await response.json())
    } catch {
      setError('Servis kayıtları yüklenemedi. API bağlantısını kontrol et.')
    } finally {
      setServicesLoading(false)
    }
  }

  async function refreshData() {
    await Promise.all([loadCustomers(), loadServices()])
  }

  useEffect(() => {
    refreshData()
  }, [])

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function handleServiceChange(event) {
    setServiceForm({
      ...serviceForm,
      [event.target.name]: event.target.value,
    })
  }

  function handleEdit(customer) {
    setEditingId(customer.id)
    setForm({
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email || '',
    })
    setError('')
    setMessage('')
    setActivePage('customers')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    const isEditing = editingId !== null

    try {
      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      )

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(
            'Bilgileri kontrol et. E-posta adresi geçersiz olabilir.',
          )
        }
        throw new Error(
          isEditing
            ? 'Müşteri güncellenemedi.'
            : 'Müşteri kaydedilemedi.',
        )
      }

      const savedCustomer = await response.json()

      if (isEditing) {
        setCustomers((previous) =>
          previous.map((customer) =>
            customer.id === editingId ? savedCustomer : customer,
          ),
        )
        setMessage('Müşteri başarıyla güncellendi.')
      } else {
        setCustomers((previous) => [...previous, savedCustomer])
        setServiceForm((previous) => ({
          ...previous,
          customerId: String(savedCustomer.id),
        }))
        setMessage('Müşteri başarıyla eklendi.')
      }

      setEditingId(null)
      setForm(emptyForm)
    } catch (err) {
      setError(err.message || 'Bir bağlantı hatası oluştu.')
    }
  }

  async function handleDelete(id) {
    if (
      !window.confirm(
        'Bu müşteriyi kalıcı olarak silmek istediğine emin misin?',
      )
    ) {
      return
    }

    setError('')
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(
          'Müşteri silinemedi. Bu müşteriye bağlı servis kayıtları olabilir.',
        )
      }

      setCustomers((previous) =>
        previous.filter((customer) => customer.id !== id),
      )

      if (editingId === id) {
        setEditingId(null)
        setForm(emptyForm)
      }

      setMessage('Müşteri başarıyla silindi.')
      await loadServices()
    } catch (err) {
      setError(err.message || 'Bir bağlantı hatası oluştu.')
    }
  }

  function handleEditService(record) {
    setEditingServiceId(record.id)
    setServiceForm({
      customerId: String(record.customerId),
      deviceName: record.deviceName,
      problemDescription: record.problemDescription,
      status: record.status,
      price: record.price == null ? '' : String(record.price),
    })
    setError('')
    setMessage('')
    setActivePage('new-service')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDeleteService(id) {
    if (
      !window.confirm(
        'Bu servis kaydını kalıcı olarak silmek istediğine emin misin?',
      )
    ) {
      return
    }

    setError('')
    setMessage('')

    try {
      const response = await fetch(`${SERVICE_API_URL}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Servis kaydı silinemedi.')
      }

      setMessage('Servis kaydı başarıyla silindi.')
      await loadServices()
    } catch (err) {
      setError(err.message || 'Servis kaydı silinirken bir hata oluştu.')
    }
  }

  function cancelServiceEdit() {
    setEditingServiceId(null)
    setServiceForm({
      ...emptyServiceForm,
      customerId: customers.length ? String(customers[0].id) : '',
    })
    setError('')
    setMessage('')
  }

  async function handleServiceSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!serviceForm.customerId) {
      setError('Önce bir müşteri eklemelisin.')
      return
    }

    const isEditing = editingServiceId !== null

    try {
      setSavingService(true)

      const response = await fetch(
        isEditing
          ? `${SERVICE_API_URL}/${editingServiceId}`
          : SERVICE_API_URL,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: Number(serviceForm.customerId),
            deviceName: serviceForm.deviceName,
            problemDescription: serviceForm.problemDescription,
            status: serviceForm.status,
            price:
              serviceForm.price.trim() === ''
                ? null
                : Number(serviceForm.price),
          }),
        },
      )

      if (!response.ok) {
        const details = await response.text()
        throw new Error(
          details ||
            (isEditing
              ? 'Servis kaydı güncellenemedi.'
              : 'Servis kaydı oluşturulamadı.'),
        )
      }

      setEditingServiceId(null)
      setServiceForm({
        ...emptyServiceForm,
        customerId: serviceForm.customerId,
      })
      setMessage(
        isEditing
          ? 'Servis kaydı başarıyla güncellendi.'
          : 'Servis kaydı başarıyla oluşturuldu.',
      )

      await loadServices()
      setActivePage('services')
    } catch (err) {
      setError(err.message || 'Servis kaydı işlemi başarısız oldu.')
    } finally {
      setSavingService(false)
    }
  }

  function getCustomerName(record) {
    if (record.customer?.fullName) return record.customer.fullName

    const customer = customers.find(
      (item) => item.id === record.customerId,
    )
    return customer?.fullName || `Müşteri #${record.customerId}`
  }

  function formatPrice(price) {
    if (price === null || price === undefined) return 'Belirlenmedi'

    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 2,
    }).format(price)
  }

  function handleLogoClick(event) {
    event.preventDefault()
    setActivePage('dashboard')
    setError('')
    setMessage('')
    refreshData()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Arama ve durum filtresine uyan servis kayıtları
  const filteredServices = services.filter((record) => {
    const search = serviceSearch.trim().toLocaleLowerCase('tr-TR')

    const matchesSearch =
      search === '' ||
      String(record.id).includes(search) ||
      (record.deviceName || '').toLocaleLowerCase('tr-TR').includes(search) ||
      (record.problemDescription || '')
        .toLocaleLowerCase('tr-TR')
        .includes(search) ||
      getCustomerName(record).toLocaleLowerCase('tr-TR').includes(search)

    const matchesStatus =
      serviceStatusFilter === 'all' ||
      record.status === serviceStatusFilter

    return matchesSearch && matchesStatus
  })

  const pageTitle = pages.find((page) => page.id === activePage)?.label

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <a className="logo" href="#" onClick={handleLogoClick}>
          Repair<span>Hub</span>
        </a>

        <p className="sidebar-caption">YÖNETİM PANELİ</p>

        <nav className="sidebar-nav" aria-label="Ana menü">
          {pages.map((page) => (
            <button
              key={page.id}
              type="button"
              className={`nav-item ${activePage === page.id ? 'active' : ''}`}
              onClick={() => {
                setActivePage(page.id)
                setError('')
                setMessage('')
              }}
            >
              <span className="nav-icon">{page.icon}</span>
              {page.label}
              {page.id === 'services' && services.length > 0 && (
                <span className="nav-count">{services.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <span className="status-dot" />
          <div>
            <strong>API bağlantısı</strong>
            <small>Yerel geliştirme</small>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="topbar-label">REPAIRHUB / YÖNETİM</span>
            <h1>{pageTitle}</h1>
          </div>
        </header>

        {(error || message) && (
          <div
            className={`notice ${error ? 'error-notice' : 'success-notice'}`}
            role={error ? 'alert' : 'status'}
          >
            {error || message}
            <button
              className="notice-close"
              type="button"
              aria-label="Mesajı kapat"
              onClick={() => {
                setError('')
                setMessage('')
              }}
            >
              ×
            </button>
          </div>
        )}

        {activePage === 'dashboard' && (
          <section className="page-content">
            <div className="welcome-panel">
              <div>
                <span className="eyebrow">GENEL DURUM</span>
                <h2>İşletmene hoş geldin.</h2>
                <p>
                  Müşterilerini ve teknik servis süreçlerini tek yerden takip et.
                </p>
              </div>
              <div className="welcome-symbol">RH</div>
            </div>

            <div className="stats-grid">
              <article className="stat-card">
                <span className="stat-icon blue">♙</span>
                <p>Toplam müşteri</p>
                <strong>{loading ? '—' : customers.length}</strong>
                <small>Kayıtlı müşteri sayısı</small>
              </article>

              <article className="stat-card">
                <span className="stat-icon purple">⚙</span>
                <p>Toplam servis</p>
                <strong>{servicesLoading ? '—' : services.length}</strong>
                <small>Oluşturulan servis kayıtları</small>
              </article>

              <article className="stat-card">
                <span className="stat-icon orange">◷</span>
                <p>Devam eden</p>
                <strong>
                  {servicesLoading
                    ? '—'
                    : services.filter((record) =>
                        ['Onarım bekliyor', 'Onarımda', 'Onarım yapılıyor'].includes(
                          record.status,
                        ),
                      ).length}
                </strong>
                <small>Bekleyen veya onarımdaki işler</small>
              </article>

              <article className="stat-card">
                <span className="stat-icon green">✓</span>
                <p>Tamamlanan</p>
                <strong>
                  {servicesLoading
                    ? '—'
                    : services.filter((record) =>
                        ['Tamamlandı', 'Teslim edildi'].includes(
                          record.status,
                        ),
                      ).length}
                </strong>
                <small>Tamamlanmış servisler</small>
              </article>
            </div>

            <div className="content-panel">
              <div className="panel-heading">
                <div>
                  <h2>Son servis kayıtları</h2>
                  <p>En son oluşturulan servisler</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setActivePage('services')}
                >
                  Tümünü gör →
                </button>
              </div>

              {servicesLoading ? (
                <p className="empty-state">Servisler yükleniyor...</p>
              ) : services.length === 0 ? (
                <p className="empty-state">Henüz servis kaydı yok.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Cihaz</th>
                        <th>Müşteri</th>
                        <th>Durum</th>
                        <th>Ücret</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...services].reverse().slice(0, 5).map((record) => (
                        <tr key={record.id}>
                          <td className="device-cell">{record.deviceName}</td>
                          <td>{getCustomerName(record)}</td>
                          <td>
                            <span className="status-badge">
                              {record.status}
                            </span>
                          </td>
                          <td>{formatPrice(record.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="quick-actions">
              <button onClick={() => setActivePage('customers')}>
                <span>♙</span>
                <strong>Müşterileri yönet</strong>
                <small>Müşteri listesine git →</small>
              </button>
              <button onClick={() => setActivePage('new-service')}>
                <span>＋</span>
                <strong>Yeni servis oluştur</strong>
                <small>Onarım kaydı ekle →</small>
              </button>
            </div>
          </section>
        )}

        {activePage === 'customers' && (
          <section className="page-content">
            <div className="section-intro">
              <div>
                <span className="eyebrow">MÜŞTERİ YÖNETİMİ</span>
                <h2>Müşteriler</h2>
                <p>
                  Müşteri bilgilerini görüntüle, güncelle veya yeni müşteri ekle.
                </p>
              </div>
              <button
                className="primary-button"
                onClick={() => {
                  setEditingId(null)
                  setForm(emptyForm)
                  document
                    .getElementById('customer-form')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                + Yeni müşteri
              </button>
            </div>

            {loading ? (
              <p className="empty-state">Müşteriler yükleniyor...</p>
            ) : customers.length === 0 ? (
              <p className="empty-state">
                Henüz müşteri yok. Aşağıdaki formdan ekleyebilirsin.
              </p>
            ) : (
              <div className="content-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Müşteri listesi</h2>
                    <p>{customers.length} kayıt</p>
                  </div>
                </div>
                <div className="customer-list">
                  {customers.map((customer) => (
                    <article className="customer-card" key={customer.id}>
                      <div className="customer-avatar">
                        {customer.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="customer-info">
                        <h3>{customer.fullName}</h3>
                        <p>{customer.phone}</p>
                        <p>{customer.email || 'E-posta belirtilmedi'}</p>
                        <small>Müşteri No: {customer.id}</small>
                      </div>
                      <div className="customer-actions">
                        <button
                          className="edit-button"
                          type="button"
                          onClick={() => handleEdit(customer)}
                        >
                          Düzenle
                        </button>
                        <button
                          className="delete-button"
                          type="button"
                          onClick={() => handleDelete(customer.id)}
                        >
                          Sil
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            <div className="content-panel form-panel" id="customer-form">
              <div className="panel-heading">
                <div>
                  <h2>
                    {editingId !== null
                      ? 'Müşteriyi düzenle'
                      : 'Yeni müşteri ekle'}
                  </h2>
                  <p>Yıldız (*) ile belirtilen alanlar zorunludur.</p>
                </div>
              </div>

              <form className="customer-form" onSubmit={handleSubmit}>
                <label htmlFor="fullName">Ad soyad *</label>
                <input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  placeholder="Örn. Ahmet Yılmaz"
                />

                <label htmlFor="phone">Telefon *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={20}
                  required
                  placeholder="05551234567"
                />

                <label htmlFor="email">E-posta</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={255}
                  placeholder="ornek@email.com"
                />

                <div className="form-actions">
                  <button className="primary-button" type="submit">
                    {editingId !== null
                      ? 'Değişiklikleri kaydet'
                      : 'Müşteriyi kaydet'}
                  </button>
                  {editingId !== null && (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={cancelEdit}
                    >
                      İptal
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>
        )}

        {activePage === 'services' && (
          <section className="page-content">
            <div className="section-intro">
              <div>
                <span className="eyebrow">TEKNİK SERVİS</span>
                <h2>Servis kayıtları</h2>
                <p>
                  Cihazları, arıza açıklamalarını, durumları ve ücretleri takip et.
                </p>
              </div>
              <button
                className="primary-button"
                type="button"
                onClick={() => {
                  setEditingServiceId(null)
                  setServiceForm({
                    ...emptyServiceForm,
                    customerId: customers.length
                      ? String(customers[0].id)
                      : '',
                  })
                  setActivePage('new-service')
                }}
              >
                + Yeni servis
              </button>
            </div>

            <div className="content-panel service-filters">
              <div className="filter-controls">
                <div className="search-field">
                  <label htmlFor="serviceSearch">Servislerde ara</label>
                  <input
                    id="serviceSearch"
                    type="search"
                    value={serviceSearch}
                    onChange={(event) => setServiceSearch(event.target.value)}
                    placeholder="Cihaz, müşteri, arıza veya servis no..."
                  />
                </div>

                <div className="status-filter">
                  <label htmlFor="serviceStatusFilter">Duruma göre filtrele</label>
                  <select
                    id="serviceStatusFilter"
                    value={serviceStatusFilter}
                    onChange={(event) =>
                      setServiceStatusFilter(event.target.value)
                    }
                  >
                    <option value="all">Tüm durumlar</option>
                    <option value="Onarım bekliyor">Onarım bekliyor</option>
                    <option value="Onarımda">Onarımda</option>
                    <option value="Onarım yapılıyor">Onarım yapılıyor</option>
                    <option value="Tamamlandı">Tamamlandı</option>
                    <option value="Teslim edildi">Teslim edildi</option>
                  </select>
                </div>

                <button
                  className="secondary-button clear-filters-button"
                  type="button"
                  onClick={() => {
                    setServiceSearch('')
                    setServiceStatusFilter('all')
                  }}
                >
                  Filtreleri temizle
                </button>
              </div>
            </div>

            {servicesLoading ? (
              <p className="empty-state">Servis kayıtları yükleniyor...</p>
            ) : filteredServices.length === 0 ? (
              <div className="content-panel">
                <p className="empty-state">
                  {services.length === 0
                    ? 'Henüz servis kaydı yok. Yeni servis oluşturarak başlayabilirsin.'
                    : 'Aramana veya seçtiğin duruma uygun servis kaydı bulunamadı.'}
                </p>
              </div>
            ) : (
              <div className="content-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Servis listesi</h2>
                    <p>
                      {filteredServices.length} / {services.length} kayıt
                      gösteriliyor
                    </p>
                  </div>
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Servis No</th>
                        <th>Cihaz</th>
                        <th>Müşteri</th>
                        <th>Arıza açıklaması</th>
                        <th>Durum</th>
                        <th>Ücret</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map((record) => (
                        <tr key={record.id}>
                          <td>#{record.id}</td>
                          <td className="device-cell">{record.deviceName}</td>
                          <td>{getCustomerName(record)}</td>
                          <td className="problem-cell">
                            {record.problemDescription}
                          </td>
                          <td>
                            <span className="status-badge">
                              {record.status}
                            </span>
                          </td>
                          <td>{formatPrice(record.price)}</td>
                          <td>
                            <div className="customer-actions">
                              <button
                                className="edit-button"
                                type="button"
                                onClick={() => handleEditService(record)}
                              >
                                Düzenle
                              </button>
                              <button
                                className="delete-button"
                                type="button"
                                onClick={() => handleDeleteService(record.id)}
                              >
                                Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {activePage === 'new-service' && (
          <section className="page-content">
            <div className="section-intro">
              <div>
                <span className="eyebrow">
                  {editingServiceId !== null ? 'KAYDI DÜZENLE' : 'YENİ KAYIT'}
                </span>
                <h2>
                  {editingServiceId !== null
                    ? 'Servis kaydını düzenle'
                    : 'Servis oluştur'}
                </h2>
                <p>Müşteriyi seç ve cihazın arıza bilgilerini kaydet.</p>
              </div>
            </div>

            <div className="content-panel form-panel">
              <form className="customer-form" onSubmit={handleServiceSubmit}>
                <label htmlFor="serviceCustomer">Müşteri *</label>
                <select
                  id="serviceCustomer"
                  name="customerId"
                  value={serviceForm.customerId}
                  onChange={handleServiceChange}
                  required
                  disabled={customers.length === 0}
                >
                  <option value="">Müşteri seç</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fullName} — #{customer.id}
                    </option>
                  ))}
                </select>

                {customers.length === 0 && (
                  <p className="form-hint">
                    Önce Müşteriler bölümünden müşteri eklemelisin.
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setActivePage('customers')}
                    >
                      Müşterilere git →
                    </button>
                  </p>
                )}

                <label htmlFor="deviceName">Cihaz adı *</label>
                <input
                  id="deviceName"
                  name="deviceName"
                  value={serviceForm.deviceName}
                  onChange={handleServiceChange}
                  maxLength={100}
                  required
                  placeholder="Örn. iPhone 13"
                />

                <label htmlFor="problemDescription">Arıza açıklaması *</label>
                <textarea
                  id="problemDescription"
                  name="problemDescription"
                  value={serviceForm.problemDescription}
                  onChange={handleServiceChange}
                  maxLength={500}
                  required
                  rows={4}
                  placeholder="Cihazdaki arızayı açıkla..."
                />

                <label htmlFor="serviceStatus">Servis durumu *</label>
                <select
                  id="serviceStatus"
                  name="status"
                  value={serviceForm.status}
                  onChange={handleServiceChange}
                  required
                >
                  <option value="Onarım bekliyor">Onarım bekliyor</option>
                  <option value="Onarımda">Onarımda</option>
                  <option value="Onarım yapılıyor">Onarım yapılıyor</option>
                  <option value="Tamamlandı">Tamamlandı</option>
                  <option value="Teslim edildi">Teslim edildi</option>
                </select>

                <label htmlFor="servicePrice">Ücret (TL)</label>
                <input
                  id="servicePrice"
                  name="price"
                  type="number"
                  value={serviceForm.price}
                  onChange={handleServiceChange}
                  min="0"
                  max="100000000"
                  step="0.01"
                  placeholder="Örn. 3500"
                />

                <div className="form-actions">
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={savingService || customers.length === 0}
                  >
                    {savingService
                      ? 'Kaydediliyor...'
                      : editingServiceId !== null
                        ? 'Değişiklikleri kaydet'
                        : 'Servis kaydını oluştur'}
                  </button>

                  {editingServiceId !== null && (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={cancelServiceEdit}
                      disabled={savingService}
                    >
                      İptal
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>
        )}

        <footer className="main-footer">
          <span>© {new Date().getFullYear()} RepairHub</span>
          <span>Müşteri ve teknik servis yönetimi</span>
        </footer>
      </main>
    </div>
  )
}

export default App
