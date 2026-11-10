import { useState } from 'react'
import './App.css'

function formatCurrency(amountCents) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountCents / 100)
}

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
  const [balances, setBalances] = useState({})
  const [charges, setCharges] = useState([])
  const [owedStoreId, setOwedStoreId] = useState('')
  const [owedAmount, setOwedAmount] = useState('')
  const [collectedAmount, setCollectedAmount] = useState('')
  const [totalCollectedAmount, setTotalCollectedAmount] = useState('')
  const [isFullyPaidEntry, setIsFullyPaidEntry] = useState(false)
  const [paymentEntryError, setPaymentEntryError] = useState('')
  const [nextChargeId, setNextChargeId] = useState(1)
  const [payments, setPayments] = useState([])
  const [nextPaymentId, setNextPaymentId] = useState(1)

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

  function handleRecordAmounts(event) {
    event.preventDefault()

    const storeId = Number(owedStoreId)
    const hasOwedAmount = owedAmount.trim() !== ''
    const hasCollectedAmount = collectedAmount.trim() !== ''
    const hasTotalCollectedAmount = totalCollectedAmount.trim() !== ''
    const owedAmountCents = hasOwedAmount
      ? Math.round(Number(owedAmount) * 100)
      : 0
    const collectedAmountCents = hasCollectedAmount
      ? Math.round(Number(collectedAmount) * 100)
      : 0
    const totalCollectedAmountCents = hasTotalCollectedAmount
      ? Math.round(Number(totalCollectedAmount) * 100)
      : null
    const storeExists = stores.some((store) => store.id === storeId)

    if (
      !storeExists ||
      (isFullyPaidEntry && (hasOwedAmount || hasCollectedAmount)) ||
      (hasOwedAmount && !Number.isFinite(owedAmountCents)) ||
      owedAmountCents < 0 ||
      (hasCollectedAmount && !Number.isFinite(collectedAmountCents)) ||
      collectedAmountCents < 0 ||
      (hasTotalCollectedAmount &&
        (!Number.isFinite(totalCollectedAmountCents) ||
          totalCollectedAmountCents < 0))
    ) {
      setPaymentEntryError(
        isFullyPaidEntry
          ? 'Leave Amount Owed and Payment Collected blank when using the fully paid option.'
          : 'Select a store and enter amounts of zero or more.',
      )
      return
    }

    if (
      !isFullyPaidEntry &&
      !hasOwedAmount &&
      !hasCollectedAmount
    ) {
      setPaymentEntryError(
        'Enter an amount owed or collected, or select Store has fully paid.',
      )
      return
    }

    const currentBalance = balances[storeId] || 0

    if (isFullyPaidEntry) {
      if (currentBalance > 0) {
        if (
          hasTotalCollectedAmount &&
          totalCollectedAmountCents !== currentBalance
        ) {
          setPaymentEntryError(
            `Enter the remaining balance of ${formatCurrency(currentBalance)}, or leave this optional amount blank.`,
          )
          return
        }

        const store = stores.find((item) => item.id === storeId)
        const confirmed = window.confirm(
          `Confirm ${store.name} has paid the remaining balance of ${formatCurrency(currentBalance)}?`,
        )

        if (!confirmed) {
          return
        }

        setBalances((currentBalances) => ({
          ...currentBalances,
          [storeId]: 0,
        }))
        setPayments((currentPayments) => [
          ...currentPayments,
          {
            id: nextPaymentId,
            storeId,
            amountCents: currentBalance,
            appliedAmountCents: currentBalance,
          },
        ])
        setNextPaymentId(nextPaymentId + 1)
      } else {
        if (totalCollectedAmountCents === null) {
          const store = stores.find((item) => item.id === storeId)
          const confirmed = window.confirm(
            `Confirm ${store.name} is fully paid? The collected amount will be shown as Not recorded.`,
          )

          if (!confirmed) {
            return
          }
        }

        const recordedAmountCents = totalCollectedAmountCents ?? 0
        setCharges((currentCharges) => [
          ...currentCharges,
          {
            id: nextChargeId,
            storeId,
            amountCents: recordedAmountCents,
          },
        ])
        setNextChargeId(nextChargeId + 1)
        if (totalCollectedAmountCents !== null) {
          setPayments((currentPayments) => [
            ...currentPayments,
            {
              id: nextPaymentId,
              storeId,
              amountCents: totalCollectedAmountCents,
              appliedAmountCents: totalCollectedAmountCents,
            },
          ])
          setNextPaymentId(nextPaymentId + 1)
        } else {
          setPayments((currentPayments) => [
            ...currentPayments,
            {
              id: nextPaymentId,
              storeId,
              amountCents: null,
              appliedAmountCents: 0,
            },
          ])
          setNextPaymentId(nextPaymentId + 1)
        }
        setBalances((currentBalances) => ({
          ...currentBalances,
          [storeId]: 0,
        }))
      }

      setOwedStoreId('')
      setOwedAmount('')
      setCollectedAmount('')
      setTotalCollectedAmount('')
      setIsFullyPaidEntry(false)
      setPaymentEntryError('')
      return
    }

    const updatedBalance = (balances[storeId] || 0) + owedAmountCents
    const appliedAmountCents = Math.min(
      collectedAmountCents,
      updatedBalance,
    )
    setBalances((currentBalances) => ({
      ...currentBalances,
      [storeId]: updatedBalance - appliedAmountCents,
    }))
    if (hasOwedAmount) {
      setCharges((currentCharges) => [
        ...currentCharges,
        { id: nextChargeId, storeId, amountCents: owedAmountCents },
      ])
      setNextChargeId(nextChargeId + 1)
    }

    if (hasCollectedAmount && collectedAmountCents > 0) {
      setPayments((currentPayments) => [
        ...currentPayments,
        {
          id: nextPaymentId,
          storeId,
          amountCents: collectedAmountCents,
          appliedAmountCents,
        },
      ])
      setNextPaymentId(nextPaymentId + 1)
    }

    setOwedStoreId('')
    setOwedAmount('')
    setCollectedAmount('')
    setTotalCollectedAmount('')
    setIsFullyPaidEntry(false)
    setPaymentEntryError('')
  }

  function handleMarkFullyPaid(storeId) {
    const store = stores.find((item) => item.id === storeId)
    const remainingBalanceCents = balances[storeId] || 0
    const hasRecordedCharges = charges.some(
      (charge) => charge.storeId === storeId,
    )

    if (!store || !hasRecordedCharges || remainingBalanceCents <= 0) {
      return
    }

    const confirmed = window.confirm(
      `Has ${store.name} paid its entire remaining balance of ${formatCurrency(remainingBalanceCents)}?`,
    )

    if (!confirmed) {
      return
    }

    setBalances((currentBalances) => ({
      ...currentBalances,
      [storeId]: 0,
    }))
    setPayments((currentPayments) => [
      ...currentPayments,
      {
        id: nextPaymentId,
        storeId,
        amountCents: remainingBalanceCents,
        appliedAmountCents: remainingBalanceCents,
      },
    ])
    setNextPaymentId(nextPaymentId + 1)
  }

  const pendingDeliveries = deliveries.filter(
    (delivery) => delivery.status === 'pending',
  )
  const completedDeliveries = deliveries.filter(
    (delivery) => delivery.status === 'completed',
  )
  const storePaymentSummaries = stores.map((store) => {
    const totalOwedCents = charges
      .filter((charge) => charge.storeId === store.id)
      .reduce((total, charge) => total + charge.amountCents, 0)
    const amountPaidCents = payments
      .filter((payment) => payment.storeId === store.id)
      .reduce((total, payment) => total + payment.appliedAmountCents, 0)
    const hasUnrecordedPayment = payments.some(
      (payment) => payment.storeId === store.id && payment.amountCents === null,
    )
    const recordedAmountPaidCents = payments
      .filter(
        (payment) =>
          payment.storeId === store.id && payment.amountCents !== null,
      )
      .reduce((total, payment) => total + payment.appliedAmountCents, 0)
    const remainingBalanceCents = balances[store.id] || 0
    const storeDeliveries = deliveries.filter(
      (delivery) => delivery.storeId === store.id,
    )
    const pendingCount = storeDeliveries.filter(
      (delivery) => delivery.status === 'pending',
    ).length
    const completedCount = storeDeliveries.filter(
      (delivery) => delivery.status === 'completed',
    ).length

    let deliverySummary = 'No Deliveries'
    if (pendingCount > 0 || completedCount > 0) {
      const deliveryParts = []
      if (pendingCount > 0) deliveryParts.push(`${pendingCount} Pending`)
      if (completedCount > 0) deliveryParts.push(`${completedCount} Completed`)
      deliverySummary = deliveryParts.join(', ')
    }

    return {
      ...store,
      totalOwedCents,
      amountPaidCents,
      hasUnrecordedPayment,
      recordedAmountPaidCents,
      remainingBalanceCents,
      hasCharges: charges.some((charge) => charge.storeId === store.id),
      deliverySummary,
    }
  })
  const storeBalanceGroups = [
    {
      title: 'Still Owe',
      statusClass: 'is-outstanding',
      stores: storePaymentSummaries.filter(
        (store) => store.remainingBalanceCents > 0,
      ),
      emptyMessage: 'No stores currently owe money.',
    },
    {
      title: 'Fully Paid',
      statusClass: 'is-paid',
      stores: storePaymentSummaries.filter(
        (store) => store.hasCharges && store.remainingBalanceCents === 0,
      ),
      emptyMessage: 'No stores with recorded charges are fully paid yet.',
    },
    {
      title: 'No Balance Recorded',
      statusClass: 'is-unrecorded',
      stores: storePaymentSummaries.filter((store) => !store.hasCharges),
      emptyMessage: 'Every store has a recorded charge.',
    },
  ]
  const stillOweStores = storeBalanceGroups[0].stores
  const fullyPaidStores = storeBalanceGroups[1].stores
  const noBalanceStores = storeBalanceGroups[2].stores
  const totalOutstandingCents = stillOweStores.reduce(
    (total, store) => total + store.remainingBalanceCents,
    0,
  )
  const selectedPaymentBalanceCents = balances[Number(owedStoreId)] || 0

  function renderBalanceStore(store, showPaymentDetails) {
    const paymentStatus = !store.hasCharges
      ? 'No Balance Recorded'
      : store.remainingBalanceCents === 0
        ? 'Fully Paid'
        : 'Still Owe'
    const paymentStatusClass = !store.hasCharges
      ? 'is-unrecorded'
      : store.remainingBalanceCents === 0
        ? 'is-paid'
        : 'is-outstanding'

    return (
      <li className="balance-item" key={store.id}>
        <div className="balance-store">
          <h4>{store.name}</h4>
          <p>{store.address}</p>
        </div>
        <div className="balance-details">
          {showPaymentDetails && (
            <>
              <p>
                <span>Total amount owed</span>
                <strong>{formatCurrency(store.totalOwedCents)}</strong>
              </p>
              <p>
                <span>Amount paid</span>
                <strong>
                  {store.hasUnrecordedPayment &&
                  store.recordedAmountPaidCents === 0
                    ? 'Not recorded'
                    : formatCurrency(store.amountPaidCents)}
                </strong>
              </p>
            </>
          )}
          {!showPaymentDetails && store.hasCharges && (
            <p>
              <span>Amount paid</span>
              <strong>
                {store.hasUnrecordedPayment &&
                store.recordedAmountPaidCents === 0
                  ? 'Not recorded'
                  : formatCurrency(store.amountPaidCents)}
              </strong>
            </p>
          )}
          <p>
            <span>Remaining balance</span>
            <strong>{formatCurrency(store.remainingBalanceCents)}</strong>
          </p>
          <p>
            <span>Payment status</span>
            <strong className={`balance-status ${paymentStatusClass}`}>
              {paymentStatus}
            </strong>
          </p>
          <p>
            <span>Delivery status</span>
            <strong>{store.deliverySummary}</strong>
          </p>
        </div>
        {showPaymentDetails && (
          <label className="mark-paid-control">
            <input
              type="checkbox"
              checked={false}
              onChange={(event) => {
                if (event.target.checked) {
                  handleMarkFullyPaid(store.id)
                }
              }}
            />
            <span>Mark as Fully Paid</span>
          </label>
        )}
      </li>
    )
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
                      <span className="delivery-status-label">Pending</span>
                      <p className="delivery-balance">
                        Remaining balance:{' '}
                        {formatCurrency(balances[store.id] || 0)}
                      </p>
                      <label className="delivery-complete-control">
                        <input
                          type="checkbox"
                          aria-label={`Mark ${store.name} delivery as completed`}
                          onChange={() =>
                            handleCompleteDelivery(delivery.id)
                          }
                        />
                        <span>Mark as completed</span>
                      </label>
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
                      <label className="delivery-complete-control">
                        <input type="checkbox" checked disabled readOnly />
                        <span>Delivery completed</span>
                      </label>
                      <p className="delivery-balance">
                        Remaining balance:{' '}
                        {formatCurrency(balances[store.id] || 0)}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </section>

      <section className="payment-section" aria-label="Track store payments">
        <form className="payment-form payment-entry-form" onSubmit={handleRecordAmounts}>
          <div className="section-heading">
            <p className="eyebrow">PAYMENT TRACKING</p>
            <h2>Record store amounts</h2>
          </div>

          <div className="payment-field">
            <label htmlFor="owed-store">Choose a store</label>
            <select
              id="owed-store"
              name="owedStore"
              value={owedStoreId}
              onChange={(event) => {
                setOwedStoreId(event.target.value)
                setPaymentEntryError('')
              }}
              disabled={stores.length === 0}
              required
            >
              <option value="">
                {stores.length === 0 ? 'Add a store first' : 'Select a store'}
              </option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name} — {formatCurrency(balances[store.id] || 0)} owed
                </option>
              ))}
            </select>
          </div>

          <div className="payment-amount-fields">
            <div className="payment-field">
              <label htmlFor="owed-amount">Amount Owed (USD)</label>
              <input
                id="owed-amount"
                name="owedAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Leave blank if none"
                value={owedAmount}
                onChange={(event) => setOwedAmount(event.target.value)}
              />
            </div>
            <div className="payment-field">
              <label htmlFor="collected-amount">
                Payment Collected (USD)
              </label>
              <input
                id="collected-amount"
                name="collectedAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Leave blank if none"
                value={collectedAmount}
                onChange={(event) => setCollectedAmount(event.target.value)}
              />
            </div>
          </div>

          <label className="fully-paid-entry-control">
            <input
              type="checkbox"
              checked={isFullyPaidEntry}
              onChange={(event) => {
                if (
                  event.target.checked &&
                  (owedAmount.trim() !== '' || collectedAmount.trim() !== '')
                ) {
                  setPaymentEntryError(
                    'Clear Amount Owed and Payment Collected before using the fully paid option.',
                  )
                  return
                }
                setIsFullyPaidEntry(event.target.checked)
                setPaymentEntryError('')
              }}
            />
            <span>Store has fully paid</span>
          </label>

          {isFullyPaidEntry && (
            <div className="payment-field">
              <label htmlFor="total-collected-amount">
                Total Amount Collected (USD)
              </label>
              <input
                id="total-collected-amount"
                name="totalCollectedAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder={
                  selectedPaymentBalanceCents > 0
                    ? `Optional; remaining balance is ${formatCurrency(selectedPaymentBalanceCents)}`
                    : 'Optional; leave blank if not recorded'
                }
                value={totalCollectedAmount}
                onChange={(event) =>
                  setTotalCollectedAmount(event.target.value)
                }
              />
              {selectedPaymentBalanceCents > 0 && (
                <p className="payment-field-help">
                  Saving requires confirmation and records the full remaining
                  balance as collected.
                </p>
              )}
            </div>
          )}

          {paymentEntryError && (
            <p className="form-error" role="alert">
              {paymentEntryError}
            </p>
          )}

          <button type="submit" disabled={stores.length === 0}>
            Save amounts
          </button>
        </form>

        <div className="payment-results-grid">
          <section className="payment-list" aria-labelledby="balances-heading">
            <div className="list-heading">
              <div className="section-heading">
                <p className="eyebrow">ACCOUNT STATUS</p>
                <h2 id="balances-heading">Store balances</h2>
              </div>
              <span
                className="store-count"
                aria-label={`${stores.length} stores`}
              >
                {stores.length}
              </span>
            </div>

            {stores.length === 0 ? (
              <p className="empty-message">
                Add a store to start tracking balances.
              </p>
            ) : (
              <div className="balance-groups">
                <div className="balance-summary-cards">
                  <div className="balance-summary-card is-outstanding">
                    <span>Still Owe</span>
                    <strong>{stillOweStores.length}</strong>
                    <p>{formatCurrency(totalOutstandingCents)} outstanding</p>
                  </div>
                  <div className="balance-summary-card is-paid">
                    <span>Fully Paid</span>
                    <strong>{fullyPaidStores.length}</strong>
                    <p>
                      {fullyPaidStores.length === 1 ? 'store' : 'stores'} fully
                      paid
                    </p>
                  </div>
                </div>

                <section
                  className="balance-group"
                  aria-labelledby="still-owe-heading"
                >
                  <div className="balance-group-heading">
                    <h3 id="still-owe-heading">Still Owe Stores</h3>
                    <span>{stillOweStores.length}</span>
                  </div>
                  {stillOweStores.length === 0 ? (
                    <p className="group-empty-message">
                      No stores currently owe money.
                    </p>
                  ) : (
                    <ul className="balance-items">
                      {stillOweStores.map((store) =>
                        renderBalanceStore(store, true),
                      )}
                    </ul>
                  )}
                </section>

                <section
                  className="balance-group fully-paid-group"
                  aria-labelledby="fully-paid-heading"
                >
                  <div className="balance-group-heading">
                    <h3 id="fully-paid-heading">Fully Paid Stores</h3>
                    <span>{fullyPaidStores.length}</span>
                  </div>
                  {fullyPaidStores.length === 0 ? (
                    <p className="group-empty-message">
                      No stores with recorded charges are fully paid yet.
                    </p>
                  ) : (
                    <ul className="balance-items">
                      {fullyPaidStores.map((store) =>
                        renderBalanceStore(store, false),
                      )}
                    </ul>
                  )}
                </section>

                <section
                  className="balance-group"
                  aria-labelledby="no-balance-heading"
                >
                  <div className="balance-group-heading">
                    <h3 id="no-balance-heading">No Balance Recorded</h3>
                    <span>{noBalanceStores.length}</span>
                  </div>
                  {noBalanceStores.length === 0 ? (
                    <p className="group-empty-message">
                      Every store has a recorded charge.
                    </p>
                  ) : (
                    <ul className="balance-items">
                      {noBalanceStores.map((store) =>
                        renderBalanceStore(store, false),
                      )}
                    </ul>
                  )}
                </section>
              </div>
            )}
          </section>

          <section className="payment-list" aria-labelledby="collected-heading">
            <div className="list-heading">
              <div className="section-heading">
                <p className="eyebrow">PAYMENT HISTORY</p>
                <h2 id="collected-heading">Money collected</h2>
              </div>
              <span
                className="store-count"
                aria-label={`${payments.length} payments`}
              >
                {payments.length}
              </span>
            </div>

            {payments.length === 0 ? (
              <p className="empty-message">No payments recorded yet.</p>
            ) : (
              <ul className="balance-items">
                {[...payments].reverse().map((payment) => {
                  const store = stores.find(
                    (item) => item.id === payment.storeId,
                  )

                  return (
                    <li className="balance-item" key={payment.id}>
                      <div className="balance-store">
                        <h3>{store.name}</h3>
                        <p>Payment collected</p>
                      </div>
                      <div className="balance-summary">
                        <strong>
                          {payment.amountCents === null
                            ? 'Not recorded'
                            : formatCurrency(payment.amountCents)}
                        </strong>
                      </div>
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
