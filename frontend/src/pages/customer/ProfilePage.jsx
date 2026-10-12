import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addressApi } from '../../api/apiServices';
import { User, MapPin, Plus, Trash2, Check, Star } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // New address state
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Visakhapatnam');
  const [state, setState] = useState('Andhra Pradesh');
  const [postalCode, setPostalCode] = useState('530003');

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await addressApi.getAddresses();
      if (res.success && res.data) {
        setAddresses(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addressApi.addAddress({
        recipientName,
        phone,
        addressLine,
        city,
        state,
        postalCode,
        isDefault: addresses.length === 0,
      });

      if (res.success) {
        setShowForm(false);
        setRecipientName('');
        setPhone('');
        setAddressLine('');
        fetchAddresses();
      }
    } catch (err) {
      alert(err.message || 'Failed to save address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressApi.setDefault(id);
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await addressApi.deleteAddress(id);
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Student Profile & Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage personal details and campus hostel addresses</p>
      </div>

      {/* Profile Overview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.fullName}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
              {user?.role} ACCOUNT
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-500 sm:text-right">
          <p>Campus Identity: Verified</p>
          <p className="text-slate-400">AU-R24 Student Access Enabled</p>
        </div>
      </div>

      {/* Address Management Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Saved Campus Addresses
            </h2>
            <p className="text-xs text-slate-500">Hostel rooms, labs, and department shipping destinations</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            {showForm ? 'Cancel' : 'Add Address'}
          </button>
        </div>

        {/* New Address Form */}
        {showForm && (
          <form onSubmit={handleAddAddress} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-semibold text-slate-900">Add New Shipping Address</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Recipient Name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="p-2.5 bg-white border border-slate-300 rounded-lg"
              />
              <input
                type="tel"
                required
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="p-2.5 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <input
              type="text"
              required
              placeholder="Hostel Block, Room / Department Name"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="p-2.5 bg-white border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                required
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="p-2.5 bg-white border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                required
                placeholder="PIN Code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="p-2.5 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
            >
              Save Address
            </button>
          </form>
        )}

        {/* Addresses List */}
        {loading ? (
          <LoadingSpinner text="Loading addresses..." />
        ) : addresses.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">No addresses added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-4 rounded-xl border text-xs flex flex-col justify-between ${
                  addr.isDefault
                    ? 'border-blue-500 bg-blue-50/30'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{addr.recipientName}</span>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500">{addr.phone}</p>
                  <p className="text-slate-600 mt-2 leading-relaxed">{addr.addressLine}</p>
                  <p className="text-slate-600">
                    {addr.city}, {addr.state} - {addr.postalCode}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3">
                  {!addr.isDefault ? (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Default delivery point</span>
                  )}
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-sm"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
