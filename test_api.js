const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:8081/api';

async function testEndpoints() {
  console.log('--- Starting API Verification ---');

  // 1. Get Pizzas
  try {
    const res = await fetch(`${BASE_URL}/pizzas`);
    const pizzas = await res.json();
    console.log(`[PASS] GET /pizzas returned ${pizzas.length} items`);
  } catch (err) {
    console.error('[FAIL] GET /pizzas:', err.message);
  }

  // 2. Create Order
  let newOrderId;
  try {
    const orderData = {
      items: [
        { name: "Margherita", size: "Grande", quantity: 2, price: 50.0 }
      ],
      total: 100.0,
      observations: "Test order"
    };
    
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    if (res.ok) {
        const order = await res.json();
        newOrderId = order.id;
        console.log(`[PASS] POST /orders created order ID: ${order.id}`);
    } else {
        const err = await res.text();
        console.error(`[FAIL] POST /orders: ${res.status} - ${err}`);
    }

  } catch (err) {
    console.error('[FAIL] POST /orders:', err.message);
  }

  // 3. Get Orders History
  try {
    const res = await fetch(`${BASE_URL}/orders`);
    const orders = await res.json();
    console.log(`[PASS] GET /orders returned ${orders.length} orders`);
    
    // Verify the new order is in the list
    if (newOrderId) {
        const found = orders.find(o => o.id === newOrderId);
        if (found) {
             console.log(`[PASS] New order ${newOrderId} found in history`);
        } else {
             console.error(`[FAIL] New order ${newOrderId} NOT found in history`);
        }
    }

  } catch (err) {
    console.error('[FAIL] GET /orders:', err.message);
  }
  
  // 4. Get Specific Order
  if (newOrderId) {
      try {
        const res = await fetch(`${BASE_URL}/orders/${newOrderId}`);
        if(res.ok) {
            const order = await res.json();
             console.log(`[PASS] GET /orders/:id returned order ${order.id}`);
             if(order.items && order.items.length > 0) {
                 console.log(`[PASS] Order items persisted: ${order.items.length}`);
             } else {
                 console.error(`[FAIL] Order items NOT persisted`);
             }
        } else {
             console.error(`[FAIL] GET /orders/:id: ${res.status}`);
        }
      } catch (err) {
        console.error('[FAIL] GET /orders/:id:', err.message);
      }
  }

  console.log('--- Verification Complete ---');
}

testEndpoints();
