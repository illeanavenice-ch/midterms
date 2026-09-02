import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { Activity, Boxes, ChevronLeft, ChevronRight, Filter, Headphones, Laptop, Plus, ShieldCheck, Smartphone, Sparkles, Watch } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import styles from './App.module.css'

const categories = ['Smartphone', 'Laptop', 'Wearable', 'Audio']
const initialForm = { gadgetName: '', category: '', manufacturer: '', healthRating: '', techBrand: '', userRole: 'Engineer' }
const starterData = [
  { id: 1, gadgetName: 'Nova X Pro', category: 'Smartphone', manufacturer: 'Orion Devices', healthRating: 94, techBrand: 'NovaTech', userRole: 'Engineer' },
  { id: 2, gadgetName: 'AeroBook 14', category: 'Laptop', manufacturer: 'Aero Computing', healthRating: 88, techBrand: 'Aero', userRole: 'Tester' },
  { id: 3, gadgetName: 'Pulse Fit 3', category: 'Wearable', manufacturer: 'Pulse Labs', healthRating: 91, techBrand: 'Pulse', userRole: 'Tester' },
  { id: 4, gadgetName: 'Sonic Buds', category: 'Audio', manufacturer: 'Sonic Works', healthRating: 82, techBrand: 'Sonic', userRole: 'Engineer' },
]

const categoryIcon = { Smartphone, Laptop, Wearable: Watch, Audio: Headphones }
const healthLabel = value => value >= 90 ? 'Excellent' : value >= 75 ? 'Good' : value >= 50 ? 'Fair' : 'Needs review'

function Field({ label, error, children }) {
  return <label className={styles.field}><span>{label}</span>{children}{error && <small>{error}</small>}</label>
}

export default function App() {
  const [items, setItems] = useState(starterData)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [selectedId, setSelectedId] = useState(starterData[0].id)
  const [activeItem, setActiveItem] = useState(starterData[0])
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    setActiveItem(items.find(item => item.id === selectedId) ?? null)
  }, [selectedId, items])

  const validateField = (name, value) => {
    if (String(value).trim() === '') return 'This field is required.'
    if (['gadgetName', 'manufacturer', 'techBrand'].includes(name) && String(value).trim().length < 3) return 'Enter at least 3 characters.'
    if (name === 'healthRating' && (+value < 1 || +value > 100)) return 'Health rating must be from 1 to 100.'
    return ''
  }

  const updateField = event => {
    const { name, value } = event.target
    setForm(current => ({ ...current, [name]: value }))
    setErrors(current => ({ ...current, [name]: validateField(name, value) }))
  }

  const submitForm = event => {
    event.preventDefault()
    const nextErrors = Object.fromEntries(Object.entries(form).map(([name, value]) => [name, validateField(name, value)]))
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    const newItem = { ...form, healthRating: Number(form.healthRating), id: Date.now() }
    setItems(current => [...current, newItem])
    setSelectedId(newItem.id)
    setForm(initialForm)
    setErrors({})
    setShowForm(false)
  }

  const columns = useMemo(() => [
    { accessorKey: 'gadgetName', header: 'Gadget', cell: info => <div className={styles.gadgetCell}><span className={styles.miniIcon}>{(() => { const Icon = categoryIcon[info.row.original.category]; return <Icon size={16}/> })()}</span><div><b>{info.getValue()}</b><small>{info.row.original.techBrand}</small></div></div> },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'manufacturer', header: 'Manufacturer' },
    { accessorKey: 'healthRating', header: 'Health', cell: info => <div className={styles.health}><b>{info.getValue()}</b><span><i style={{ width: `${info.getValue()}%` }} /></span></div> },
    { accessorKey: 'userRole', header: 'Role', cell: info => <span className={`${styles.badge} ${info.getValue() === 'Engineer' ? styles.engineer : styles.tester}`}>{info.getValue()}</span> },
  ], [])

  const filteredData = useMemo(() => categoryFilter === 'All' ? items : items.filter(item => item.category === categoryFilter), [items, categoryFilter])
  const table = useReactTable({ data: filteredData, columns, initialState: { pagination: { pageSize: 4 } }, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel() })
  const averageHealth = Math.round(items.reduce((sum, item) => sum + item.healthRating, 0) / items.length)

  return <div className={styles.app}>
    <aside className={styles.sidebar}>
      <div className={styles.logo}><span><Boxes size={22}/></span><b>GadgetGrid</b></div>
      <nav><button className={styles.navActive}><Activity size={18}/> Inventory Hub</button><button><ShieldCheck size={18}/> Quality Center</button></nav>
      <div className={styles.sidebarBottom}><small>TECH OPERATIONS</small><div className={styles.avatar}>AB</div><div><b>illEANA JIMENEZ</b><span>Administrator</span></div></div>
    </aside>

    <main>
      <header><div><p>INVENTORY / OVERVIEW</p><h1>Tech Gadget Inventory Hub</h1><span>Register, inspect, and monitor every device in one place.</span></div><button className={styles.primary} onClick={() => setShowForm(value => !value)}><Plus size={18}/>{showForm ? 'Close form' : 'Register gadget'}</button></header>

      <section className={styles.stats}>
        <article><span className={styles.blueIcon}><Boxes/></span><div><small>TOTAL GADGETS</small><strong>{items.length}</strong><p>Across {new Set(items.map(i => i.category)).size} categories</p></div></article>
        <article><span className={styles.greenIcon}><ShieldCheck/></span><div><small>AVERAGE HEALTH</small><strong>{averageHealth}<em>/100</em></strong><p>{healthLabel(averageHealth)} inventory condition</p></div></article>
        <article><span className={styles.purpleIcon}><Sparkles/></span><div><small>TOP CATEGORY</small><strong>{categories.map(c => [c, items.filter(i => i.category === c).length]).sort((a,b) => b[1]-a[1])[0][0]}</strong><p>Most registered device type</p></div></article>
      </section>

      {showForm && <section className={styles.formPanel}>
        <div className={styles.sectionTitle}><div><h2>Register a new gadget</h2><p>All fields are required. Validation happens as you type.</p></div></div>
        <form onSubmit={submitForm} noValidate>
          <Field label="Gadget name" error={errors.gadgetName}><input name="gadgetName" value={form.gadgetName} onChange={updateField} placeholder="e.g. Nova X Pro" className={errors.gadgetName ? styles.invalid : ''}/></Field>
          <Field label="Category" error={errors.category}><select name="category" value={form.category} onChange={updateField} className={errors.category ? styles.invalid : ''}><option value="">Select category</option>{categories.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Manufacturer" error={errors.manufacturer}><input name="manufacturer" value={form.manufacturer} onChange={updateField} placeholder="e.g. Orion Devices" className={errors.manufacturer ? styles.invalid : ''}/></Field>
          <Field label="Health rating (1-100)" error={errors.healthRating}><input type="number" min="1" max="100" name="healthRating" value={form.healthRating} onChange={updateField} placeholder="90" className={errors.healthRating ? styles.invalid : ''}/></Field>
          <Field label="Tech brand name" error={errors.techBrand}><input name="techBrand" value={form.techBrand} onChange={updateField} placeholder="e.g. NovaTech" className={errors.techBrand ? styles.invalid : ''}/></Field>
          <fieldset><legend>User role</legend><label><input type="radio" name="userRole" value="Engineer" checked={form.userRole === 'Engineer'} onChange={updateField}/> Engineer</label><label><input type="radio" name="userRole" value="Tester" checked={form.userRole === 'Tester'} onChange={updateField}/> Tester</label></fieldset>
          <div className={styles.formActions}><button type="button" onClick={() => { setForm(initialForm); setErrors({}) }}>Clear</button><button className={styles.primary} type="submit"><Plus size={17}/> Add to registry</button></div>
        </form>
      </section>}

      <section className={styles.workspace}>
        <article className={styles.tablePanel}>
          <div className={styles.sectionTitle}><div><h2>Gadget registry</h2><p>{filteredData.length} records available</p></div><label className={styles.filter}><Filter size={16}/><select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); table.setPageIndex(0) }}><option>All</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label></div>
          <div className={styles.tableWrap}><table><thead>{table.getHeaderGroups().map(group => <tr key={group.id}>{group.headers.map(header => <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map(row => <tr key={row.id} onClick={() => setSelectedId(row.original.id)} className={row.original.id === selectedId ? styles.selected : ''}>{row.getVisibleCells().map(cell => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table>{table.getRowModel().rows.length === 0 && <div className={styles.empty}>No gadgets match this filter.</div>}</div>
          <div className={styles.pagination}><span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}</span><div><button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft size={16}/> Previous</button><button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next <ChevronRight size={16}/></button></div></div>
        </article>

        <aside className={styles.detailPanel}>
          <div className={styles.sectionTitle}><div><h2>Active profile</h2><p>Selected gadget details</p></div><span className={styles.live}>LIVE</span></div>
          {activeItem ? <div className={styles.profile}>
            <div className={styles.heroIcon}>{(() => { const Icon = categoryIcon[activeItem.category]; return <Icon size={36}/> })()}</div><h3>{activeItem.gadgetName}</h3><p>{activeItem.techBrand}</p><span className={`${styles.badge} ${activeItem.userRole === 'Engineer' ? styles.engineer : styles.tester}`}>{activeItem.userRole}</span>
            <div className={styles.score}><div><span>Device health</span><b>{healthLabel(activeItem.healthRating)}</b></div><strong>{activeItem.healthRating}<small>/100</small></strong><div className={styles.scoreBar}><i style={{width: `${activeItem.healthRating}%`}}/></div></div>
            <dl><div><dt>Category</dt><dd>{activeItem.category}</dd></div><div><dt>Manufacturer</dt><dd>{activeItem.manufacturer}</dd></div><div><dt>Tech brand</dt><dd>{activeItem.techBrand}</dd></div><div><dt>Registry ID</dt><dd>GG-{String(activeItem.id).slice(-5)}</dd></div></dl>
          </div> : <div className={styles.empty}>Select a row to inspect its profile.</div>}
        </aside>
      </section>
    </main>
  </div>
}
