import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { addressApi, orderApi } from '../../api/apiServices';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  MapPin,
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck,
  Plus,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export const CheckoutPage = () => {
  const { cartSummary, refreshCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('SIMULATED_UPI');
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState(null);

  // New address inline form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newCity, setNewCity] = useState('Visakhapatnam');
  const [newState, setNewState] = useState('Andhra Pradesh');
  const [newPostalCode, setNewPostalCode] = useState('530003');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await addressApi.getAddresses();
        if (res.success && res.data) {
          setAddresses(res.data);
          // Set default address
          const def = res.data.find((a) => a.isDefault) || res.data[0];
          if (def) setSelectedAddressId(def.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addressApi.addAddress({
        recipientName: newRecipient,
        phone: newPhone,
        addressLine: newAddressLine,
        city: newCity,
        state: newState,
        postalCode: newPostalCode,
        isDefault: true,
      });

      if (res.success && res.data) {
        setAddresses([res.data, ...addresses]);
        setSelectedAddressId(res.data.id);
        setShowAddressForm(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select or add a delivery address to proceed.');
      return;
    }

    try {
      setPlacingOrder(true);
      setError(null);
      const res = await orderApi.createOrder({
        addressId: selectedAddressId,
        paymentMethod: paymentMethod,
        simulatedPaymentReference: 'SIM-PAY-' + Date.now(),
      });

      if (res.success && res.data) {
        await refreshCart();
        navigate(`/order-confirmation/${res.data.orderNumber}`, { state: { order: res.data } });
      }
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <LoadingSpinner text="Preparing checkout..." />;

  if (!cartSummary || !cartSummary.items || cartSummary.items.length === 0) {
    return (
      <div className="text-center p-12">
        <p className="text-slate-600 mb-4">Your cart is empty.</p>
        <Link to="/catalog" className="text-blue-600 font-semibold text-sm">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Checkout & Campus Delivery</h1>
        <p className="text-xs text-slate-500 mt-1">Review your hostel address and payment options</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Addresses & Payment */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Delivery Address */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                1. Select Hostel / Campus Delivery Address
              </h2>
              <button
                type="button"
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddressForm ? 'Cancel' : 'Add New'}
              </button>
            </div>

            {/* Address List */}
            {addresses.length === 0 && !showAddressForm ? (
              <p className="text-xs text-slate-500 italic">No saved addresses found. Please add an address below.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition relative ${
                      selectedAddressId === addr.id
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {selectedAddressId === addr.id && (
                      <CheckCircle className="w-4 h-4 text-blue-600 absolute top-3 right-3" />
                    )}
                    <p className="font-bold text-slate-900">{addr.recipientName}</p>
                    <p className="text-slate-500 mt-0.5">{addr.phone}</p>
                    <p className="text-slate-600 mt-2 leading-relaxed">{addr.addressLine}</p>
                    <p className="text-slate-600">
                      {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Inline Address Creation Form */}
            {showAddressForm && (
              <form onSubmit={handleAddNewAddress} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 mt-4 text-xs">
                <h3 className="font-semibold text-slate-900">Add New Campus Address</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Recipient Name"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    className="p-2 bg-white border border-slate-300 rounded-lg"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Hostel Block, Room / Lab / Department"
                  value={newAddressLine}
                  onChange={(e) => setNewAddressLine(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="p-2 bg-white border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="p-2 bg-white border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    required
                    placeholder="PIN Code"
                    value={newPostalCode}
                    onChange={(e) => setNewPostalCode(e.target.value)}
                    className="p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                >
                  Save and Use Address
                </button>
              </form>
            )}
          </section>

          {/* Section 2: Simulated Payment Selection */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              2. Select Payment Method (Educational Simulation)
            </h2>

            {/* Clearly labeled simulation alert */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Academic Demonstration Notice:</strong> This checkout uses a simulated transaction workflow.
                No actual debit or credit card charge will be made.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`p-4 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition ${
                  paymentMethod === 'SIMULATED_UPI'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900">Simulated UPI</span>
                  <QrCode className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-slate-500 text-[11px]">Instant campus UPI authorization</p>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'SIMULATED_UPI'}
                  onChange={() => setPaymentMethod('SIMULATED_UPI')}
                  className="hidden"
                />
              </label>

              <label
                className={`p-4 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition ${
                  paymentMethod === 'SIMULATED_CARD'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900">Simulated Card</span>
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-slate-500 text-[11px]">Demo debit/credit card gateway</p>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'SIMULATED_CARD'}
                  onChange={() => setPaymentMethod('SIMULATED_CARD')}
                  className="hidden"
                />
              </label>

              <label
                className={`p-4 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition ${
                  paymentMethod === 'CASH_ON_CAMPUS'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900">Campus Pickup</span>
                  <Banknote className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-slate-500 text-[11px]">Pay at Block C Counter 4</p>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'CASH_ON_CAMPUS'}
                  onChange={() => setPaymentMethod('CASH_ON_CAMPUS')}
                  className="hidden"
                />
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Order Confirmation Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Review
          </h2>

          <div className="space-y-3 max-h-52 overflow-y-auto divide-y divide-slate-100 text-xs">
            {cartSummary.items.map((item) => (
              <div key={item.id} className="pt-2 first:pt-0 flex justify-between gap-2">
                <span className="text-slate-700 line-clamp-1">
                  {item.quantity}x {item.productName}
                </span>
                <span className="font-bold text-slate-900 shrink-0">
                  ₹{Number(item.lineTotal).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">
                ₹{Number(cartSummary.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-slate-900">
                {Number(cartSummary.estimatedShipping) === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  `₹${Number(cartSummary.estimatedShipping).toFixed(2)}`
                )}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Payable</span>
              <span className="text-blue-600">
                ₹{Number(cartSummary.estimatedTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder || !selectedAddressId}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
          >
            {placingOrder ? 'Processing Transaction...' : 'Place Order & Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
