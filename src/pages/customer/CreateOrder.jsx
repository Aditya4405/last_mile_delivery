import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rateCardService } from '../../services/rateCardService';
import { orderService } from '../../services/orderService';
import { addressService } from '../../services/addressService';
import { ZONES } from '../../constants';
import { calculateVolumetricWeight, calculateBillableWeight, formatCurrency } from '../../utils';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import MapPlaceholder from '../../components/MapPlaceholder';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin,
  FiCompass,
  FiTruck,
  FiPlusCircle,
  FiPackage,
  FiCheckCircle,
  FiChevronRight,
  FiChevronLeft,
  FiSearch,
  FiInfo
} from 'react-icons/fi';

const CreateOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address search autosuggest states
  const [pickupSearch, setPickupSearch] = useState('');
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSearch, setDropSearch] = useState('');
  const [dropSuggestions, setDropSuggestions] = useState([]);

  // Final created order ID for step 4
  const [createdOrderId, setCreatedOrderId] = useState('');

  const [calculations, setCalculations] = useState({
    volumetricWeight: 0,
    billableWeight: 0,
    baseCost: 0,
    extraWeightCost: 0,
    codFee: 0,
    taxes: 0,
    totalPrice: 0,
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pickupAddress: '',
      pickupZone: 'zone-1',
      dropAddress: '',
      dropZone: 'zone-5',
      length: '20',
      breadth: '20',
      height: '15',
      actualWeight: '1.5',
      orderType: 'B2C',
      paymentType: 'Prepaid',
    },
  });

  // Watch form fields for pricing updates
  const formValues = useWatch({ control });
  const { length, breadth, height, actualWeight, pickupZone, dropZone, orderType, paymentType, pickupAddress, dropAddress } = formValues;

  // Fetch geocoded suggestions for Pickup
  useEffect(() => {
    const fetchPickupSuggestions = async () => {
      if (pickupSearch.length >= 3) {
        const list = await addressService.getSuggestions(pickupSearch);
        setPickupSuggestions(list);
      } else {
        setPickupSuggestions([]);
      }
    };

    const timer = setTimeout(fetchPickupSuggestions, 450);
    return () => clearTimeout(timer);
  }, [pickupSearch]);

  // Fetch geocoded suggestions for Drop
  useEffect(() => {
    const fetchDropSuggestions = async () => {
      if (dropSearch.length >= 3) {
        const list = await addressService.getSuggestions(dropSearch);
        setDropSuggestions(list);
      } else {
        setDropSuggestions([]);
      }
    };

    const timer = setTimeout(fetchDropSuggestions, 450);
    return () => clearTimeout(timer);
  }, [dropSearch]);

  // Calculate pricing based on dimensions and zones
  useEffect(() => {
    const calculateRates = async () => {
      const volWeight = calculateVolumetricWeight(length, breadth, height);
      const actWeight = parseFloat(actualWeight) || 0;
      const billWeight = calculateBillableWeight(actWeight, volWeight);
      
      let totalPrice = 0;
      let baseCost = 0;
      let extraWeightCost = 0;
      let codFee = 0;
      let taxes = 0;

      if (pickupZone && dropZone && orderType && paymentType && billWeight > 0) {
        try {
          const scope = pickupZone === dropZone ? 'Intra Zone' : 'Inter Zone';
          const rates = await rateCardService.getRateCards();
          const rateCard = rates.find(
            (r) => r.type.toUpperCase() === orderType.toUpperCase() && r.scope.toLowerCase() === scope.toLowerCase()
          );

          if (rateCard) {
            const { baseWeight, basePrice, extraWeightPrice, codCharge } = rateCard;
            baseCost = basePrice;
            if (billWeight > baseWeight) {
              extraWeightCost = (billWeight - baseWeight) * extraWeightPrice;
            }
            if (paymentType === 'COD') {
              codFee = codCharge;
            }
            const subtotal = baseCost + extraWeightCost + codFee;
            taxes = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST (CGST + SGST)
            totalPrice = subtotal + taxes;
          } else {
            // Fallback pricing multiplier
            baseCost = orderType === 'B2B' ? 350.0 : 70.0;
            extraWeightCost = billWeight > 2 ? (billWeight - 2) * 20.0 : 0;
            codFee = paymentType === 'COD' ? 30.0 : 0;
            const subtotal = baseCost + extraWeightCost + codFee;
            taxes = Math.round(subtotal * 0.18 * 100) / 100;
            totalPrice = subtotal + taxes;
          }
        } catch (err) {
          console.error(err);
          totalPrice = billWeight * 85;
          baseCost = totalPrice;
        }
      }

      setCalculations({
        volumetricWeight: volWeight,
        billableWeight: billWeight,
        baseCost,
        extraWeightCost,
        codFee,
        taxes,
        totalPrice: Math.round(totalPrice),
      });
    };

    calculateRates();
  }, [length, breadth, height, actualWeight, pickupZone, dropZone, orderType, paymentType]);

  const selectPickupSuggestion = (item) => {
    setValue('pickupAddress', item.displayName);
    setPickupSearch('');
    setPickupSuggestions([]);
    
    // Auto-map Indian regions to standard zones
    const addressLower = item.displayName.toLowerCase();
    if (addressLower.includes('noida') || addressLower.includes('ghaziabad')) {
      setValue('pickupZone', 'zone-1');
    } else if (addressLower.includes('gurgaon') || addressLower.includes('gurugram') || addressLower.includes('haryana')) {
      setValue('pickupZone', 'zone-2');
    } else if (addressLower.includes('okhla') || addressLower.includes('faridabad')) {
      setValue('pickupZone', 'zone-3');
    } else if (addressLower.includes('dwarka') || addressLower.includes('janakpuri') || addressLower.includes('west')) {
      setValue('pickupZone', 'zone-4');
    } else if (addressLower.includes('delhi') || addressLower.includes('connaught') || addressLower.includes('cp')) {
      setValue('pickupZone', 'zone-5');
    }
    toast.success('Pickup address selected and localized!');
  };

  const selectDropSuggestion = (item) => {
    setValue('dropAddress', item.displayName);
    setDropSearch('');
    setDropSuggestions([]);

    const addressLower = item.displayName.toLowerCase();
    if (addressLower.includes('noida') || addressLower.includes('ghaziabad')) {
      setValue('dropZone', 'zone-1');
    } else if (addressLower.includes('gurgaon') || addressLower.includes('gurugram') || addressLower.includes('haryana')) {
      setValue('dropZone', 'zone-2');
    } else if (addressLower.includes('okhla') || addressLower.includes('faridabad')) {
      setValue('dropZone', 'zone-3');
    } else if (addressLower.includes('dwarka') || addressLower.includes('janakpuri') || addressLower.includes('west')) {
      setValue('dropZone', 'zone-4');
    } else if (addressLower.includes('delhi') || addressLower.includes('connaught') || addressLower.includes('cp')) {
      setValue('dropZone', 'zone-5');
    }
    toast.success('Destination address selected and localized!');
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!pickupAddress || !dropAddress) {
        toast.error('Please specify both pickup and drop-off destinations.');
        return;
      }
    }
    if (currentStep === 2) {
      const act = parseFloat(actualWeight);
      if (!act || act <= 0) {
        toast.error('Please enter a valid weight.');
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const finalOrderData = {
        ...data,
        volumetricWeight: calculations.volumetricWeight,
        billableWeight: calculations.billableWeight,
        price: calculations.totalPrice,
      };

      const result = await orderService.createOrder(finalOrderData, user);
      setCreatedOrderId(result.id);
      toast.success('Consignment registered in LogiTrack system!');
      setCurrentStep(4);
    } catch (err) {
      toast.error(err.message || 'Failed to submit booking order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const zoneOptions = ZONES.map((z) => ({ value: z.id, label: `${z.name} (${z.code})` }));

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header Titles */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FiPlusCircle className="text-blue-600 shrink-0" />
          Shipment Booking Hub
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Create shipments, calculate billable weights, and initialize dispatches across Indian postal zones.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-subtle flex justify-between items-center text-xs">
        {[
          { num: 1, name: 'Route Details' },
          { num: 2, name: 'Parcel Specs' },
          { num: 3, name: 'SLA & Pricing' },
          { num: 4, name: 'Confirmation' },
        ].map((step) => (
          <div key={step.num} className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xxs transition-colors ${ currentStep >= step.num ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 ' }`}
            >
              {step.num}
            </span>
            <span
              className={`hidden sm:inline font-semibold ${ currentStep === step.num ? 'text-slate-900 ' : 'text-slate-400' }`}
            >
              {step.name}
            </span>
            {step.num < 4 && <div className="hidden sm:block w-8 md:w-16 h-0.5 bg-slate-200" />}
          </div>
        ))}
      </div>

      {/* Main Wizard Form Container */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Addresses details */}
              <div className="md:col-span-2 space-y-5 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-card">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Step 1: Dispatch Routing Addresses
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Pickup Search autosuggest */}
                  <div className="relative">
                    <Input
                      label="Pickup Point Search"
                      name="pickupSearch"
                      icon={FiSearch}
                      placeholder="Type city, street, or hub name (e.g. Noida Sector 62)..."
                      value={pickupSearch}
                      onChange={(e) => setPickupSearch(e.target.value)}
                    />
                    {pickupSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-hover z-50 divide-y divide-slate-100 max-h-48 overflow-y-auto no-scrollbar">
                        {pickupSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => selectPickupSuggestion(item)}
                            className="p-3 text-xxs text-slate-700 cursor-pointer hover:bg-slate-50"
                          >
                            {item.displayName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Input
                    label="Full Pickup Address (Finalized)"
                    name="pickupAddress"
                    icon={FiMapPin}
                    placeholder="E.g. Ground Floor, Building C4, Sector 62, Noida"
                    error={errors.pickupAddress}
                    required
                    {...register('pickupAddress', { required: 'Pickup address is required' })}
                  />

                  <div className="relative">
                    <Input
                      label="Drop Point Search"
                      name="dropSearch"
                      icon={FiSearch}
                      placeholder="Type destination area or landmark (e.g. AIIMS Delhi)..."
                      value={dropSearch}
                      onChange={(e) => setDropSearch(e.target.value)}
                    />
                    {dropSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-hover z-50 divide-y divide-slate-100 max-h-48 overflow-y-auto no-scrollbar">
                        {dropSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => selectDropSuggestion(item)}
                            className="p-3 text-xxs text-slate-700 cursor-pointer hover:bg-slate-50"
                          >
                            {item.displayName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Input
                    label="Full Destination Address (Finalized)"
                    name="dropAddress"
                    icon={FiCompass}
                    placeholder="E.g. H-34, Ring Road, AIIMS, New Delhi"
                    error={errors.dropAddress}
                    required
                    {...register('dropAddress', { required: 'Drop address is required' })}
                  />

                  {/* Zones */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <Select
                      label="Pickup Operations Zone"
                      name="pickupZone"
                      options={zoneOptions}
                      error={errors.pickupZone}
                      {...register('pickupZone')}
                    />
                    <Select
                      label="Drop Operations Zone"
                      name="dropZone"
                      options={zoneOptions}
                      error={errors.dropZone}
                      {...register('dropZone')}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button variant="primary" size="md" icon={FiChevronRight} onClick={nextStep}>
                    Package Specifications
                  </Button>
                </div>
              </div>

              {/* Map Preview Sidebar */}
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200/60 text-xxs leading-relaxed text-slate-500">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                    <FiInfo className="text-blue-500 shrink-0" />
                    Indian Logistics Zoning
                  </p>
                  LogiTrack matches locations inside standard regions. Localities inside Noida fall into <b>Zone-1</b>, Gurgaon/Gurugram in <b>Zone-2</b>, Okhla in <b>Zone-3</b>, West Delhi in <b>Zone-4</b>, and Central Delhi/CP in <b>Zone-5</b>.
                </div>

                <MapPlaceholder
                  pickupAddress={pickupAddress || 'Sec 62 Noida'}
                  dropAddress={dropAddress || 'Green Park Delhi'}
                  status="pending"
                  pickupZone={pickupZone}
                  dropZone={dropZone}
                />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-card max-w-2xl mx-auto space-y-6"
            >
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <FiPackage className="text-blue-500 shrink-0" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Step 2: Parcel Dimensions & Volumetric Metrics
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Actual Weight (kg)"
                  name="actualWeight"
                  type="number"
                  step="0.01"
                  placeholder="E.g. 1.5"
                  required
                  {...register('actualWeight', { required: 'Weight is required', min: 0.1 })}
                />
                <Input
                  label="Length (cm)"
                  name="length"
                  type="number"
                  placeholder="20"
                  required
                  {...register('length', { required: 'Length is required', min: 1 })}
                />
                <Input
                  label="Breadth (cm)"
                  name="breadth"
                  type="number"
                  placeholder="20"
                  required
                  {...register('breadth', { required: 'Breadth is required', min: 1 })}
                />
                <Input
                  label="Height (cm)"
                  name="height"
                  type="number"
                  placeholder="15"
                  required
                  {...register('height', { required: 'Height is required', min: 1 })}
                />
              </div>

              {/* Live Metric calculation feedback */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xxs grid grid-cols-3 gap-4 text-center">
                <div>
                  <span className="text-slate-400 block mb-1">Volumetric Weight</span>
                  <span className="font-bold text-slate-800 text-xs">{calculations.volumetricWeight} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Actual Weight</span>
                  <span className="font-bold text-slate-800 text-xs">{actualWeight || 0} kg</span>
                </div>
                <div>
                  <span className="text-blue-500 font-extrabold block mb-1">Billable Weight</span>
                  <span className="font-extrabold text-blue-600 text-xs">{calculations.billableWeight} kg</span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <Button variant="outline" size="md" icon={FiChevronLeft} onClick={prevStep}>
                  Back
                </Button>
                <Button variant="primary" size="md" icon={FiChevronRight} onClick={nextStep}>
                  Service SLA & Pricing
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* SLA & Payment method */}
              <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-card space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Step 3: Service Scope & Billing Settings
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Consignment Order Type"
                    name="orderType"
                    options={[
                      { value: 'B2C', label: 'B2C Retail Delivery' },
                      { value: 'B2B', label: 'B2B Freight Bulk' },
                    ]}
                    {...register('orderType')}
                  />
                  <Select
                    label="Payment Method"
                    name="paymentType"
                    options={[
                      { value: 'Prepaid', label: 'Prepaid (UPI / Cards)' },
                      { value: 'COD', label: 'Cash on Delivery (COD)' },
                    ]}
                    {...register('paymentType')}
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border text-xxs space-y-3">
                  <h4 className="font-bold text-slate-800">Route Scope Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div><b>Pickup:</b> {pickupAddress}</div>
                    <div><b>Drop-off:</b> {dropAddress}</div>
                    <div><b>Distance Category:</b> {pickupZone === dropZone ? 'Intra Zone (Local)' : 'Inter Zone (Inter-city)'}</div>
                    <div><b>SLA Type:</b> {orderType === 'B2B' ? 'Standard Ground Cargo' : 'Express Delivery Rider'}</div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Button variant="outline" size="md" icon={FiChevronLeft} onClick={prevStep}>
                    Back
                  </Button>
                </div>
              </div>

              {/* Price Calculation details card */}
              <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-premium flex flex-col justify-between h-fit space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                    Premium Price Calculator
                  </h3>
                  
                  <div className="space-y-3.5 mt-5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span>Base Operations Charge:</span>
                      <span className="font-semibold text-white">{formatCurrency(calculations.baseCost)}</span>
                    </div>
                    {calculations.extraWeightCost > 0 && (
                      <div className="flex justify-between">
                        <span>Extra Weight Charge:</span>
                        <span className="font-semibold text-white">{formatCurrency(calculations.extraWeightCost)}</span>
                      </div>
                    )}
                    {calculations.codFee > 0 && (
                      <div className="flex justify-between">
                        <span>COD Collection Processing:</span>
                        <span className="font-semibold text-white">{formatCurrency(calculations.codFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>GST (18% SGST + CGST):</span>
                      <span className="font-semibold text-white">{formatCurrency(calculations.taxes)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-3 text-sm">
                      <span className="font-bold text-slate-300">Final Shipping Charge:</span>
                      <span className="font-black text-orange-400">{formatCurrency(calculations.totalPrice)}</span>
                    </div>
                  </div>

                  <div className="mt-6 p-3 bg-slate-800 rounded-xl text-xxs text-slate-400">
                    Estimated Delivery: <b>Within 24 Hours</b>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="success"
                  className="w-full shadow-lg text-xs"
                  loading={isSubmitting}
                >
                  Book Shipment Order
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-card text-center max-w-md mx-auto space-y-6 animate-pulse"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100">
                  <FiCheckCircle className="h-9 w-9" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">Consignment Dispatch Initialized!</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Logistics booking successful. Your package manifests have been registered and assigned tracking IDs.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border text-left text-xxs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Consignment ID:</span>
                  <span className="font-bold text-slate-800">{createdOrderId || 'ORD-9821'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Billable Weight:</span>
                  <span className="font-semibold text-slate-800">{calculations.billableWeight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment:</span>
                  <span className="font-semibold text-slate-800">{paymentType}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-bold">
                  <span className="text-slate-800">Amount Collected:</span>
                  <span className="text-blue-600">{formatCurrency(calculations.totalPrice)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    setValue('pickupAddress', '');
                    setValue('dropAddress', '');
                  }}
                  className="px-4 py-2.5 text-xs font-bold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Book Another
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/customer/orders')}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
                >
                  View Shipments
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default CreateOrder;
