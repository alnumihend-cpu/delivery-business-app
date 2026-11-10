import { useState } from 'react'
import './App.css'

function App() {
  const [stores, setStores] = useState([])
  const [nextStoreId, setNextStoreId] = useState(1)
  const [storeName, setStoreName] = useState('')
  const [storeAddress, setStoreAddress] = useState('')
  const [formError, setFormError] = useState('')
  const [deliveries, setDeliveries] = useState([])
  const [nextDeliveryId, setNextDeliveryId] = useState(1)
  const [selectedStoreId, setSelectedStoreId] = useState('')
  const [deliveryError, setDeliveryError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const name = storeName.trim()
    const address = storeAddress.trim()

    if (!name || !address) {
      setFormError('Please enter both a store name and an address.')
      return
    }

    setStores([...stores, { id: nextStoreId, name, address }])
    setNextStoreId(nextStoreId + 1)
    setStoreName('')
    setStoreAddress('')
    setFormError('')
  }

  function handleAddDelivery(event) {
    event.preventDefault()

    const storeId = Number(selectedStoreId)
    const selectedStore = stores.find((store) => store.id === storeId)

    if (!selectedStore) {
      setDeliveryError('Please select a store before adding a delivery.')
      return
    }

    setDeliveries([
      ...deliveries,
      { id: nextDeliveryId, storeId, status: 'pending' },
    ])
    setNextDeliveryId(nextDeliveryId + 1)
    setSelectedStoreId('')
    setDeliveryError('')
  }

  function handleCompleteDelivery(deliveryId) {
    setDeliveries(
      deliveries.map((delivery) =>
        delivery.id === deliveryId
          ? { ...delivery, status: 'completed' }
          : delivery,
      ),
    )
  }

  const pendingDeliveries = deliveries.filter(
    (delivery) => delivery.status === 'pending',
  )
  const completedDeliveries = deliveries.filter(
    (delivery) => delivery.status === 'completed',
  )

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

      <section className="delivery-section" aria-label="Track deliveries">
        <form className="delivery-form" onSubmit={handleAddDelivery}>
          <div className="section-heading">
            <p className="eyebrow">DAILY WORK</p>
            <h2>Add a delivery</h2>
          </div>

          <label htmlFor="delivery-store">Choose a store</label>
          <select
            id="delivery-store"
            name="deliveryStore"
            value={selectedStoreId}
            onChange={(event) => {
              setSelectedStoreId(event.target.value)
              setDeliveryError('')
            }}
            disabled={stores.length === 0}
            required
          >
            <option value="">
              {stores.length === 0 ? 'Add a store first' : 'Select a store'}
            </option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} — {store.address}
              </option>
            ))}
          </select>

          {deliveryError && (
            <p className="form-error" role="alert">
              {deliveryError}
            </p>
          )}

          <button type="submit" disabled={stores.length === 0}>
            Add delivery
          </button>
        </form>

        <div className="delivery-status-grid">
          <section className="delivery-list" aria-labelledby="pending-heading">
            <div className="list-heading">
              <div className="section-heading">
                <p className="eyebrow">TO DO</p>
                <h2 id="pending-heading">Pending</h2>
              </div>
              <span
                className="store-count"
                aria-label={`${pendingDeliveries.length} pending deliveries`}
              >
                {pendingDeliveries.length}
              </span>
            </div>

            {pendingDeliveries.length === 0 ? (
              <p className="empty-message">No pending deliveries.</p>
            ) : (
              <ul className="delivery-items">
                {pendingDeliveries.map((delivery) => {
                  const store = stores.find(
                    (item) => item.id === delivery.storeId,
                  )

                  return (
                    <li className="delivery-item" key={delivery.id}>
                      <h3>{store.name}</h3>
                      <p>{store.address}</p>
                      <button
                        type="button"
                        onClick={() => handleCompleteDelivery(delivery.id)}
                      >
                        Mark as completed
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section
            className="delivery-list"
            aria-labelledby="completed-heading"
          >
            <div className="list-heading">
              <div className="section-heading">
                <p className="eyebrow">DONE</p>
                <h2 id="completed-heading">Completed</h2>
              </div>
              <span
                className="store-count"
                aria-label={`${completedDeliveries.length} completed deliveries`}
              >
                {completedDeliveries.length}
              </span>
            </div>

            {completedDeliveries.length === 0 ? (
              <p className="empty-message">No completed deliveries yet.</p>
            ) : (
              <ul className="delivery-items">
                {completedDeliveries.map((delivery) => {
                  const store = stores.find(
                    (item) => item.id === delivery.storeId,
                  )

                  return (
                    <li className="delivery-item" key={delivery.id}>
                      <h3>{store.name}</h3>
                      <p>{store.address}</p>
                      <span className="completed-label">Completed</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}

export default App
