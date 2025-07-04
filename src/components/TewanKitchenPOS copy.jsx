import React, { useState, useEffect } from 'react';
import { Plus, Minus, Edit3, Trash2, Receipt, BarChart3, DollarSign, Clock, Users, TrendingUp } from 'lucide-react';

const TewanKitchenPOS = () => {
  const [currentView, setCurrentView] = useState('order');
  const [selectedTable, setSelectedTable] = useState(null);
  const [orders, setOrders] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [menuItems] = useState([
    { id: 1, name: 'Pork Rad Na', price: 45, category: 'Main Dish' },
    { id: 2, name: 'Chicken Rad Na', price: 45, category: 'Main Dish' },
    { id: 3, name: 'Fried Egg', price: 15, category: 'Side Dish' },
    { id: 4, name: 'Pork Fried Rice', price: 50, category: 'Main Dish' },
    { id: 5, name: 'Beef Fried Rice', price: 60, category: 'Main Dish' },
    { id: 6, name: 'Water', price: 10, category: 'Beverage' },
    { id: 7, name: 'Soft Drink', price: 20, category: 'Beverage' }
  ]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(10);
  const [tax, setTax] = useState(7);

  const tables = Array.from({ length: 12 }, (_, i) => i + 1);

  const addToOrder = (tableId, item, quantity = 1) => {
    setOrders(prev => ({
      ...prev,
      [tableId]: {
        ...prev[tableId],
        items: {
          ...prev[tableId]?.items,
          [item.id]: {
            ...item,
            quantity: (prev[tableId]?.items?.[item.id]?.quantity || 0) + quantity
          }
        },
        timestamp: new Date().toISOString()
      }
    }));
  };

  const updateQuantity = (tableId, itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(tableId, itemId);
      return;
    }
    
    setOrders(prev => ({
      ...prev,
      [tableId]: {
        ...prev[tableId],
        items: {
          ...prev[tableId].items,
          [itemId]: {
            ...prev[tableId].items[itemId],
            quantity: newQuantity
          }
        }
      }
    }));
  };

  const removeItem = (tableId, itemId) => {
    setOrders(prev => {
      const newItems = { ...prev[tableId].items };
      delete newItems[itemId];
      return {
        ...prev,
        [tableId]: {
          ...prev[tableId],
          items: newItems
        }
      };
    });
  };

  const calculateOrderTotal = (tableId) => {
    const order = orders[tableId];
    if (!order?.items) return { subtotal: 0, tax: 0, serviceCharge: 0, discount: 0, total: 0 };

    const subtotal = Object.values(order.items).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = (subtotal * tax) / 100;
    const serviceChargeAmount = (subtotal * serviceCharge) / 100;
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal + taxAmount + serviceChargeAmount - discountAmount;

    return { subtotal, tax: taxAmount, serviceCharge: serviceChargeAmount, discount: discountAmount, total };
  };

  const processPayment = (tableId) => {
    const order = orders[tableId];
    const totals = calculateOrderTotal(tableId);
    
    const transaction = {
      id: Date.now(),
      tableId,
      items: order.items,
      totals,
      paymentMethod,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };

    setTransactions(prev => [...prev, transaction]);
    
    // Clear the order
    setOrders(prev => {
      const newOrders = { ...prev };
      delete newOrders[tableId];
      return newOrders;
    });

    // Save to Google Sheets (simulated)
    saveToGoogleSheets(transaction);
    
    alert('Payment processed successfully!');
    setCurrentView('order');
    setSelectedTable(null);
  };

  const saveToGoogleSheets = (transaction) => {
    // This would integrate with Google Sheets API
    console.log('Saving to Google Sheets:', transaction);
  };

  const getReportData = () => {
    const today = new Date().toLocaleDateString();
    const todayTransactions = transactions.filter(t => t.date === today);
    
    const totalRevenue = todayTransactions.reduce((sum, t) => sum + t.totals.total, 0);
    const totalOrders = todayTransactions.length;
    
    const paymentBreakdown = todayTransactions.reduce((acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.totals.total;
      return acc;
    }, {});

    const popularItems = {};
    todayTransactions.forEach(t => {
      Object.values(t.items).forEach(item => {
        popularItems[item.name] = (popularItems[item.name] || 0) + item.quantity;
      });
    });

    return { totalRevenue, totalOrders, paymentBreakdown, popularItems };
  };

  const TableGrid = () => (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
      {tables.map(tableNum => {
        const hasOrder = orders[tableNum];
        const orderTotal = hasOrder ? calculateOrderTotal(tableNum).total : 0;
        
        return (
          <button
            key={tableNum}
            onClick={() => {
              setSelectedTable(tableNum);
              setCurrentView('menu');
            }}
            className={`p-6 rounded-lg border-2 transition-all ${
              hasOrder 
                ? 'border-orange-500 bg-orange-50 hover:bg-orange-100' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-center">
              <div className="text-lg font-semibold">Table {tableNum}</div>
              {hasOrder && (
                <div className="text-sm text-orange-600 mt-1">
                  ฿{orderTotal.toFixed(2)}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );

  const MenuView = () => {
    const categories = [...new Set(menuItems.map(item => item.category))];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Table {selectedTable} - Menu</h2>
          <button
            onClick={() => setCurrentView('checkout')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            View Order ({Object.keys(orders[selectedTable]?.items || {}).length})
          </button>
        </div>

        {categories.map(category => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-medium text-gray-800">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {menuItems.filter(item => item.category === category).map(item => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-gray-600">฿{item.price}</div>
                    </div>
                    <button
                      onClick={() => addToOrder(selectedTable, item)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const CheckoutView = () => {
    const order = orders[selectedTable];
    const totals = calculateOrderTotal(selectedTable);

    if (!order?.items) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500">No items in order</div>
          <button
            onClick={() => setCurrentView('menu')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Items
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Table {selectedTable} - Checkout</h2>
        
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium mb-3">Order Items</h3>
          {Object.values(order.items).map(item => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-gray-600">฿{item.price} each</div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(selectedTable, item.id, item.quantity - 1)}
                  className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(selectedTable, item.id, item.quantity + 1)}
                  className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                >
                  <Plus size={16} />
                </button>
                <span className="ml-4 font-medium">฿{(item.price * item.quantity).toFixed(2)}</span>
                <button
                  onClick={() => removeItem(selectedTable, item.id)}
                  className="text-red-600 hover:text-red-800 ml-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="font-medium mb-3">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>฿{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Charge ({serviceCharge}%):</span>
              <span>฿{totals.serviceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({tax}%):</span>
              <span>฿{totals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount ({discount}%):</span>
              <span>-฿{totals.discount.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>฿{totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium mb-3">Payment Method</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'cash', label: 'Cash' },
              { id: 'qr', label: 'QR Code / PromptPay' },
              { id: 'card', label: 'Credit/Debit Card' },
              { id: 'other', label: 'Other' }
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`p-3 border rounded-lg text-center ${
                  paymentMethod === method.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentView('menu')}
            className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700"
          >
            Back to Menu
          </button>
          <button
            onClick={() => processPayment(selectedTable)}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
          >
            Process Payment
          </button>
        </div>
      </div>
    );
  };

  const ReportsView = () => {
    const reportData = getReportData();
    
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Daily Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="text-green-600" size={24} />
              <div>
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="text-xl font-bold text-green-600">
                  ฿{reportData.totalRevenue.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Receipt className="text-blue-600" size={24} />
              <div>
                <div className="text-sm text-gray-600">Total Orders</div>
                <div className="text-xl font-bold text-blue-600">
                  {reportData.totalOrders}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-purple-600" size={24} />
              <div>
                <div className="text-sm text-gray-600">Avg Order Value</div>
                <div className="text-xl font-bold text-purple-600">
                  ฿{reportData.totalOrders > 0 ? (reportData.totalRevenue / reportData.totalOrders).toFixed(2) : '0.00'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3">Payment Methods</h3>
            <div className="space-y-2">
              {Object.entries(reportData.paymentBreakdown).map(([method, amount]) => (
                <div key={method} className="flex justify-between">
                  <span className="capitalize">{method}:</span>
                  <span>฿{amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3">Popular Items</h3>
            <div className="space-y-2">
              {Object.entries(reportData.popularItems)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([item, quantity]) => (
                <div key={item} className="flex justify-between">
                  <span>{item}:</span>
                  <span>{quantity} sold</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium mb-3">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Table</th>
                  <th className="text-left p-2">Items</th>
                  <th className="text-left p-2">Payment</th>
                  <th className="text-left p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(-10).reverse().map(transaction => (
                  <tr key={transaction.id} className="border-b">
                    <td className="p-2">{transaction.time}</td>
                    <td className="p-2">{transaction.tableId}</td>
                    <td className="p-2">{Object.keys(transaction.items).length} items</td>
                    <td className="p-2 capitalize">{transaction.paymentMethod}</td>
                    <td className="p-2">฿{transaction.totals.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Tewan's Kitchen POS</h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => {
                  setCurrentView('order');
                  setSelectedTable(null);
                }}
                className={`px-4 py-2 rounded-lg ${
                  currentView === 'order' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Tables
              </button>
              <button
                onClick={() => setCurrentView('reports')}
                className={`px-4 py-2 rounded-lg ${
                  currentView === 'reports' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Reports
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {currentView === 'order' && <TableGrid />}
        {currentView === 'menu' && <MenuView />}
        {currentView === 'checkout' && <CheckoutView />}
        {currentView === 'reports' && <ReportsView />}
      </div>
    </div>
  );
};

export default TewanKitchenPOS;
