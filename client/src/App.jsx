import { useState } from 'react'
import './App.css'

function App() {
  const [stores, setStores] = useState([])
  const [storeName, setStoreName] = useState('')
  const [storeAddress, setStoreAddress] = useState('')
  const [formError, setFormError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const name = storeName.trim()
    const address = storeAddress.trim()

    if (!name || !address) {
      setFormError('Please enter both a store name and an address.')
      return
    }

    setStores([...stores, { name, address }])
    setStoreName('')
    setStoreAddress('')
    setFormError('')
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">DELIVERY BUSINESS APP</p>
        <h1>Store management</h1>
        <p className="page-description">
          Keep the stores you visit and their addresses together in one place.
        </p>
      </header>

      <section className="store-layout" aria-label="Manage stores">
        <form className="store-form" onSubmit={handleSubmit}>
          <div className="section-heading">
            <p className="eyebrow">GET STARTED</p>
            <h2>Add a store</h2>
          </div>

          <label htmlFor="store-name">Store name</label>
          <input
            id="store-name"
            name="storeName"
            type="text"
            placeholder="Example: Green Market"
            value={storeName}
            onChange={(event) => setStoreName(event.target.value)}
            required
          />

          <label htmlFor="store-address">Address</label>
          <input
            id="store-address"
            name="storeAddress"
            type="text"
            placeholder="Example: 123 Main Street"
            value={storeAddress}
            onChange={(event) => setStoreAddress(event.target.value)}
            required
          />

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}

          <button type="submit">Add store</button>
        </form>

        <section className="store-list" aria-labelledby="store-list-heading">
          <div className="list-heading">
            <div className="section-heading">
              <p className="eyebrow">YOUR DIRECTORY</p>
              <h2 id="store-list-heading">Stores</h2>
            </div>
            <span className="store-count" aria-label={`${stores.length} stores`}>
              {stores.length}
            </span>
          </div>

          {stores.length === 0 ? (
            <p className="empty-message">
              No stores yet. Add your first store using the form.
            </p>
          ) : (
            <ul className="store-items">
              {stores.map((store, index) => (
                <li className="store-item" key={`${store.name}-${index}`}>
                  <h3>{store.name}</h3>
                  <p>{store.address}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
